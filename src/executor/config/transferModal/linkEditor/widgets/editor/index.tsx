import { Command } from '@/ts/base';
import { Graph } from '@antv/x6';
import React, { createRef, useEffect } from 'react';
import { createGraph } from './widgets/graph';
import { ExecStatus, addNode } from './widgets/node';
import { ILink, IRequest } from '@/ts/core/thing/config';

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
    const update = () => {
      link.metadata.data = graph.toJSON({ diff: true });
      link.refresh(link.metadata);
    };
    graph.on('node:added', update);
    graph.on('node:moved', update);
    return () => {
      graph.off();
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
    case 'insertRequest':
      let requests: IRequest[] = args[0];
      let [x, y, offset] = [0, 0, 20];
      for (let request of requests) {
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
  }
};

export default LinkEditor;
