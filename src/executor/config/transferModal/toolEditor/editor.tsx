import { ILink } from '@/ts/core/thing/link';
import { Graph } from '@antv/x6';
import React, { createRef, useEffect } from 'react';

interface IProps {
  link: ILink;
}

const LinkEditor: React.FC<IProps> = ({ link }) => {
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
    return () => {
      graph.dispose();
    };
  }, [ref]);
  return <div style={{ height: '100%' }} ref={ref}></div>;
};

export default LinkEditor;
