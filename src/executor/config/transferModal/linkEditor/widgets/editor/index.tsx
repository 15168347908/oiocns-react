import { linkCmd } from '@/ts/base/common/command';
import { XEntity } from '@/ts/base/schema';
import { IBelong, IDirectory, IEntity } from '@/ts/core';
import { ILink } from '@/ts/core/thing/config';
import { Graph, Node } from '@antv/x6';
import { Modal } from 'antd';
import React, { createRef, useEffect, useRef, useState } from 'react';
import { MenuItemType } from 'typings/globelType';
import Selector from '../../../selector';
import { Persistence, Temping, createGraph } from './widgets/graph';
import { DataNode, ExecStatus, addNode, createDownstream } from './widgets/node';
import { Retention } from '../..';
import { ToolBar } from '../toolBar';

export interface IProps {
  current: ILink;
  retention: Retention;
}

/**
 * 返回一个请求编辑器
 * @returns
 */
const LinkEditor: React.FC<IProps> = ({ current, retention }) => {
  const ref = createRef<HTMLDivElement>();
  const graphRef = useRef<Graph>();
  const [visible, setVisible] = useState<boolean>();
  useEffect(() => {
    const graph = createGraph(ref, current);
    const id = linkCmd.subscribe((type: string, cmd: string, args: any) => {
      if (type != 'main') return;
      console.log(type, '接收到消息啦', linkCmd);
      handler(current, graph, cmd, args);
    });
    const update = () => {
      current.metadata.data = graph.toJSON({ diff: true });
      current.refresh(current.metadata);
    };
    graph.on('node:added', update);
    graph.on('node:moved', update);
    graph.on('node:removed', update);
    graph.on('node:selected', (args) => linkCmd.emitter('node', 'selected', args));
    graph.on('node:unselected', (args) => linkCmd.emitter('node', 'unselected', args));
    graphRef.current = graph;
    setVisible(true);
    return () => {
      graph.off();
      linkCmd.unsubscribe(id);
      graph.dispose();
    };
  }, [ref]);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }} ref={ref} />
      {visible && (
        <ToolBar current={current} graph={graphRef.current!} retention={retention} />
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
    case 'insertEntity':
      let entities: IEntity<XEntity>[] = args;
      let [x, y, offset] = [0, 0, 20];
      for (let request of entities) {
        addNode({
          graph: graph,
          position: {
            x: x,
            y: y,
          },
          entity: request.metadata,
          status: ExecStatus.Stop,
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
          let selected: IEntity<XEntity>[] = [];
          Modal.confirm({
            icon: <></>,
            width: 800,
            content: (
              <Selector
                current={current.directory.target as IBelong}
                onChange={(files) => (selected = files)}
                loadItems={async (current: IDirectory) => {
                  return await current.loadConfigs(menu.key);
                }}
              />
            ),
            onOk: () => {
              for (const select of selected) {
                createDownstream(graph, node, select.metadata);
              }
              linkCmd.emitter('node', 'unselected', { node: node });
            },
          });
      }
      break;
    case 'executing':
      // 使用临时存储插件创建环境
      const temping = graph.getPlugin<Temping>(Persistence);
      temping?.createEnv();

      // 遍历根节点
      const nodes = graph.getNodes();
      for (const node of nodes) {
        if (graph.isRootNode(node)) {
          const { entity } = node.getData() as DataNode<ExecStatus>;
          linkCmd.emitter('ergodic', entity.typeName, { nodeId: node.id });
        }
      }
      break;
  }
};

export default LinkEditor;
