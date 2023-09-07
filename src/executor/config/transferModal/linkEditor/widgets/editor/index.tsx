import { linkCmd } from '@/ts/base/common/command';
import { XEntity } from '@/ts/base/schema';
import { IBelong, IDirectory, IEntity } from '@/ts/core';
import { ConfigColl, ILink } from '@/ts/core/thing/transfer/config';
import { LoadingOutlined } from '@ant-design/icons';
import { Graph, Node } from '@antv/x6';
import React, { createRef, useEffect, useState } from 'react';
import { MenuItemType } from 'typings/globelType';
import { Retention } from '../..';
import { ToolBar, openSelector } from '../toolBar';
import cls from './../../index.module.less';
import { Persistence, Temping, createGraph } from './widgets/graph';
import { addNode, createDownstream, getShareEntity } from './widgets/node';

export interface IProps {
  current: ILink;
  retention: Retention;
}

const loadProps = async (current: IDirectory) => {
  await current.loadAllConfigs();
  for (const child of current.children) {
    await loadProps(child);
  }
};

/**
 * 返回一个请求编辑器
 * @returns
 */
const LinkEditor: React.FC<IProps> = ({ current, retention }) => {
  const ref = createRef<HTMLDivElement>();
  const [initializing, setInitializing] = useState<boolean>(true);
  useEffect(() => {
    if (initializing) {
      let root = current.directory.target.directory;
      loadProps(root).then(() => setInitializing(false));
    } else {
      const graph = createGraph(ref, current);
      const id = linkCmd.subscribe((type: string, cmd: string, args: any) => {
        if (type != 'graph') return;
        handler(current, graph, cmd, args);
      });
      const update = () => {
        current.metadata.data = graph.toJSON({ diff: true });
        current.refresh(current.metadata);
      };
      const addTools = ({ cell }: any) => {
        cell.addTools([
          { name: 'vertices' },
          {
            name: 'button-remove',
            args: { distance: 20 },
          },
        ]);
      };
      const removeTools = ({ cell }: any) => {
        if (cell.hasTool('button-remove')) {
          cell.removeTool('button-remove');
        }
        if (cell.hasTool('vertices')) {
          cell.removeTool('vertices');
        }
      };
      graph.on('node:added', update);
      graph.on('node:moved', update);
      graph.on('node:removed', update);
      graph.on('node:selected', (a) => linkCmd.emitter('node', 'selected', a));
      graph.on('node:unselected', (a) => linkCmd.emitter('node', 'unselected', a));
      graph.on('node:contextmenu', (a) => linkCmd.emitter('node', 'contextmenu', a));
      graph.on('node:click', (a) => linkCmd.emitter('node', 'click', a));
      graph.on('edge:added', update);
      graph.on('edge:moved', update);
      graph.on('edge:removed', update);
      graph.on('edge:mouseenter', addTools);
      graph.on('edge:mouseleave', removeTools);
      graph.on('blank:click', (a) => linkCmd.emitter('blank', 'click', a));
      graph.on('blank:contextmenu', (a) => linkCmd.emitter('blank', 'contextmenu', a));
      return () => {
        graph.off();
        linkCmd.unsubscribe(id);
        graph.dispose();
      };
    }
  }, [ref]);
  return (
    <div className={cls.link}>
      <div className={cls.link} ref={ref} />
      <ToolBar current={current} retention={retention} />
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
      let entities: IEntity<XEntity>[] = args;
      let [x, y, offset] = [0, 0, 20];
      for (let request of entities) {
        addNode({
          graph: graph,
          position: {
            x: x,
            y: y,
          },
          entityId: request.metadata.id,
        });
        x += offset;
        y += offset;
      }
      break;
    case 'openSelector':
      const node = args[0] as Node;
      const menu = args[1] as MenuItemType;
      switch (menu.itemType) {
        default:
          const belong = current.directory.target as IBelong;
          openSelector(
            belong,
            (selected) => {
              for (const select of selected) {
                createDownstream(graph, node, select.id);
              }
              linkCmd.emitter('node', 'unselected', { node: node });
            },
            menu.key as ConfigColl,
          );
      }
      break;
    case 'executing':
      const nodes = graph.getNodes();

      const temping = graph.getPlugin<Temping>(Persistence);
      temping?.createEnv();
      linkCmd.emitter('node', 'clearStatus');
      linkCmd.emitter('environments', 'refresh', graph);

      for (const node of nodes) {
        const entity = getShareEntity(node);
        if (entity && graph.isRootNode(node)) {
          linkCmd.emitter('ergodic', entity.typeName, { nodeId: node.id });
        }
      }
      break;
    case 'center':
      graph.centerContent();
      break;
  }
};

export default LinkEditor;
