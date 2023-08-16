import { command } from '@/ts/base';
import { ILink } from '@/ts/core/thing/link';
import { Graph } from '@antv/x6';
import React, { createRef, useEffect } from 'react';

export interface IProps {
  link: ILink;
  children?: React.ReactNode;
}

const EventHandler = (type: string, cmd: string, ...args: any) => {
  switch (type) {
    case 'insertRequest':
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

    // 订阅事件
    command.subscribe(EventHandler);
    return () => {
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

export default LinkEditor;
