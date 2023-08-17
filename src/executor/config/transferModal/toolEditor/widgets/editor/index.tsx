import { Command } from '@/ts/base';
import { ILink } from '@/ts/core/thing/link';
import { IRequest } from '@/ts/core/thing/request';
import { Graph } from '@antv/x6';
import React, { createRef, useEffect } from 'react';
import { createGraph } from './widgets/graph';
import { ExecStatus, NodeType, addNode } from './widgets/node';

export interface IProps {
  link: ILink;
  children?: React.ReactNode;
  cmd: Command;
}

/**
 * 返回一个请求编辑器
 * @returns
 */
const LinkEditor: React.FC<IProps> = ({ link, children, cmd }) => {
  const ref = createRef<HTMLDivElement>();
  useEffect(() => {
    const graph = createGraph(ref, link);
    const id = cmd.subscribe((_: string, cmd: string, args: any) => {
      handler(graph, cmd, args);
    });
    return () => {
      cmd.unsubscribe(id);
      graph.dispose();
    };
  }, [ref]);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }} ref={ref} />
      {children}
    </div>
  );
};

/**
 * 数据处理句柄
 * @param graph 画布
 * @param cmd 命令
 * @param args 参数
 */
const handler = (graph: Graph, cmd: string, ...args: any) => {
  switch (cmd) {
    case 'insert':
      let requests: IRequest[] = args[0];
      let [x, y, offset] = [0, 0, 20];
      for (let request of requests) {
        addNode({
          graph: graph,
          position: {
            x: x,
            y: y,
          },
          nodeType: NodeType.Request,
          request: request,
          status: ExecStatus.Stop,
        });
        x += offset;
        y += offset;
      }
      break;
  }
};

export default LinkEditor;
