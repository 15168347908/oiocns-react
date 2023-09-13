import { IDirectory } from '@/ts/core';
import { ITransfer } from '@/ts/core';
import { Graph } from '@antv/x6';
import React, { createRef, useEffect, useState } from 'react';
import cls from './../index.module.less';
import { LinkStore, createGraph } from './widgets/graph';
import { createNode } from './widgets/node';

export interface IProps {
  current: ITransfer;
}

const loadProps = async (current: IDirectory) => {
  await current.loadAllTransfer();
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
      graph.use(new LinkStore(current));
      if (current.metadata.graph) {
        graph.fromJSON(current.metadata.graph);
      }
      graph.centerContent();
      if (current.status == 'Editable') {
        graph.on('node:added', async (args) => {
          await current.addNode(args.cell.getData());
        });
        graph.on('node:moved', () => current.update(current.metadata));
        graph.on('node:removed', async (args) => {
          await current.delNode(args.cell.getData().id);
        });
        graph.on('node:selected', (a) => current.command.emitter('node', 'selected', a));
        graph.on('node:unselected', (a) =>
          current.command.emitter('node', 'unselected', a),
        );
        graph.on('node:contextmenu', (a) =>
          current.command.emitter('node', 'contextmenu', a),
        );
        graph.on('node:click', (a) => current.command.emitter('node', 'click', a));
        graph.on('edge:change:target', async (args) => {
          if ((args.current as any)?.cell) {
            await current.addEdge({
              id: args.edge.id,
              start: args.edge.getSourceCellId(),
              end: args.edge.getTargetCellId(),
            });
          }
        });
        graph.on('edge:moved', () => current.update(current.metadata));
        graph.on('edge:removed', async (args) => {
          await current.delEdge(args.cell.id);
        });
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
      current.binding(() => graph.toJSON());
      current.command.emitter('tools', 'initialized', graph);
      const id = current.command.subscribe((type: string, cmd: string, args: any) => {
        if (type != 'graph') return;
        handler(current, graph, cmd, args);
      });
      return () => {
        current.command.unsubscribe(id);
        graph.off();
        graph.dispose();
      };
    }
  }, [ref]);
  return <div className={cls.link} ref={ref} />;
};

/**
 * 数据处理句柄
 * @param graph 画布
 * @param cmd 命令
 * @param args 参数
 */
const handler = (current: ITransfer, graph: Graph, cmd: string, args: any) => {
  switch (cmd) {
    case 'insertNode':
      if (current.status != 'Editable') return;
      let [x, y, offset] = [0, 0, 20];
      const node = createNode(args);
      node.x = x;
      node.y = y;
      x += offset;
      y += offset;
      graph.addNode(node);
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
