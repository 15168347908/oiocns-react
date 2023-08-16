import { XRequest } from '@/ts/base/schema';
import { ILink } from '@/ts/core/thing/link';
import { Graph } from '@antv/x6';
import React, { createRef, useEffect } from 'react';
import { command } from '../..';
import { CreateNode } from './factory';

export interface IProps {
  link: ILink;
  children?: React.ReactNode;
}

const handler = (graph: Graph, cmd: string, ...args: any) => {
  switch (cmd) {
    case 'insert':
      let requests: XRequest[] = args[0];
      let [x, y, offset] = [0, 0, 20];
      for (let request of requests) {
        graph.addNode(CreateNode(request, x, y));
        x += offset;
        y += offset;
      }
      break;
  }
};

const LinkEditor: React.FC<IProps> = ({ link, children }) => {
  const ref = createRef<HTMLDivElement>();
  useEffect(() => {
    const graph = new Graph({
      height: ref.current?.clientHeight,
      container: ref.current!,
      background: {
        color: '#F2F7FA',
      },
    });
    if (link.metadata.data) {
      graph.fromJSON(link.metadata.data);
    }
    graph.centerContent();
    const id = command.subscribe((_: string, cmd: string, args: any) => {
      handler(graph, cmd, args);
    });
    return () => {
      graph.dispose();
      command.unsubscribe(id);
    };
  }, [ref]);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }} ref={ref} />
      {children}
    </div>
  );
};

export default LinkEditor;
