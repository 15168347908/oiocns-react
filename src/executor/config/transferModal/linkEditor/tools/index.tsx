import { ITransfer } from '@/ts/core';
import React from 'react';
import GraphTools from './widgets/graphTools';
import Nodes from './widgets/nodes';
import Operate from './widgets/operate';
import NodeForms from './widgets/nodeForms';
import Settings from './widgets/settings';
import Editable from './widgets/editable';
import Tasks from './widgets/tasks';

interface IProps {
  current: ITransfer;
  initStatus: 'Editable' | 'Viewable';
}

export const ToolBar: React.FC<IProps> = ({ current, initStatus }) => {
  return (
    <>
      <GraphTools current={current} initStatus={initStatus} />
      <Settings current={current} />
      <Nodes current={current} />
      <NodeForms current={current} />
      <Operate current={current} />
      <Editable current={current} />
      <Tasks current={current} />
    </>
  );
};
