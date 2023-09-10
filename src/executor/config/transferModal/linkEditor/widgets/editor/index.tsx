import { IDirectory } from '@/ts/core';
import { ILink } from '@/ts/core/thing/link';
import { LoadingOutlined } from '@ant-design/icons';
import { Graph } from '@antv/x6';
import React, { createRef, useEffect, useState } from 'react';
import { ToolBar } from '../toolBar';
import cls from './../../index.module.less';
import { LinkStore, createGraph } from './widgets/graph';
import { addNode } from './widgets/node';

export interface IProps {
  current: ILink;
}

const loadProps = async (current: IDirectory) => {
  await current.loadAllLink();
  for (const child of current.children) {
    await loadProps(child);
  }
};

/**
 * 返回一个请求编辑器
 * @returns
 */
const LinkEditor: React.FC<IProps> = ({ current }) => {
  const ref = createRef<HTMLDivElement>();
  const [initializing, setInitializing] = useState<boolean>(true);
  useEffect(() => {
    if (initializing) {
      let root = current.directory.target.directory;
      loadProps(root).then(() => setInitializing(false));
    } else {
      const graph = createGraph(ref);
      graph.fromJSON(current.metadata.graph);
      graph.use(new LinkStore(current));
      current.binding(() => graph.toJSON());
      const id = current.command.subscribe((type: string, cmd: string, args: any) => {
        if (type != 'graph') return;
        handler(current, graph, cmd, args);
      });
      if (current.status == 'Editable') {
        graph.on('node:added', () => current.refresh(current.metadata));
        graph.on('node:moved', () => current.refresh(current.metadata));
        graph.on('node:removed', () => current.refresh(current.metadata));
        graph.on('node:selected', (a) => current.command.emitter('node', 'selected', a));
        graph.on('node:unselected', (a) =>
          current.command.emitter('node', 'unselected', a),
        );
        graph.on('node:contextmenu', (a) =>
          current.command.emitter('node', 'contextmenu', a),
        );
        graph.on('node:click', (a) => current.command.emitter('node', 'click', a));
        graph.on('edge:added', () => current.refresh(current.metadata));
        graph.on('edge:moved', () => current.refresh(current.metadata));
        graph.on('edge:removed', () => current.refresh(current.metadata));
        graph.on('edge:mouseenter', ({ cell }: any) => {
          cell.addTools([
            { name: 'vertices' },
            {
              name: 'button-remove',
              args: { distance: 20 },
            },
          ]);
        });
        graph.on('edge:mouseleave', ({ cell }: any) => {
          if (cell.hasTool('button-remove')) {
            cell.removeTool('button-remove');
          }
          if (cell.hasTool('vertices')) {
            cell.removeTool('vertices');
          }
        });
        graph.on('blank:click', (a) => current.command.emitter('blank', 'click', a));
        graph.on('blank:contextmenu', (a) =>
          current.command.emitter('blank', 'contextmenu', a),
        );
      }
      return () => {
        graph.off();
        current.command.unsubscribe(id);
        graph.dispose();
      };
    }
  }, [ref]);
  return (
    <div className={cls.link}>
      <div className={cls.link} ref={ref} />
      <ToolBar current={current} />
      {initializing && (
        <div className={cls.loading}>
          <LoadingOutlined />
        </div>
      )}
    </div>
  );
};

/**
 * 数据处理句柄
 * @param graph 画布
 * @param cmd 命令
 * @param args 参数
 */
const handler = (current: ILink, graph: Graph, cmd: string, args: any) => {
  switch (cmd) {
    case 'insertNode':
      if (current.status != 'Editable') return;
      let [x, y, offset] = [0, 0, 20];
      addNode({
        graph: graph,
        position: {
          x: x,
          y: y,
        },
      });
      x += offset;
      y += offset;
      break;
    case 'executing':
      current.execute();
      break;
    case 'center':
      graph.centerContent();
      break;
  }
};

export default LinkEditor;
