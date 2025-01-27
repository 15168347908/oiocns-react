import { ITransfer } from '@/ts/core';
import { Options } from '@antv/x6/lib/graph/options';
import React, { createRef, useEffect } from 'react';
import { Store, createGraph } from '../cells/graph';
import cls from './../index.module.less';

interface IProps {
  current: ITransfer;
  options?: Partial<Options.Manual>;
}

export const GraphView: React.FC<IProps> = ({ current, options }) => {
  const ref = createRef<HTMLDivElement>();
  useEffect(() => {
    const graph = createGraph(ref, options);
    graph.use(new Store(current, 'Viewable', 'ViewRun'));
    if (current.metadata.graph) {
      graph.fromJSON(current.metadata.graph);
    }
    graph.centerContent();
    const id = current.command.subscribe((type: string, cmd: string, _: any) => {
      if (type != 'graph') return;
      switch (cmd) {
        case 'executing':
          current.execute('Viewable', 'ViewRun');
          break;
        case 'center':
          graph.centerContent();
          break;
        case 'refresh':
          graph.fromJSON(current.metadata.graph);
          break;
      }
    });
    return () => {
      current.command.unsubscribe(id);
      current.unbinding();
      graph.dispose();
    };
  }, [ref]);
  return <div className={cls.link} ref={ref} />;
};
