import { ITransfer } from '@/ts/core';
import React from 'react';
import GraphEditor from './widgets/graphEditor';
import GraphTools from './widgets/graphTools';
import Settings from './widgets/settings';
import Nodes from './widgets/nodes';
import NodeForms from '../../common/widgets/nodeForms';
import Operate from './widgets/operate';
import Editable from '../../common/widgets/center';
import Tasks from './widgets/tasks';
import { FullModal } from '../..';

interface IProps {
  current: ITransfer;
  finished: () => void;
}

const TransferModal: React.FC<IProps> = ({ current, finished }) => {
  return (
    <FullModal title={'迁移配置'} finished={finished}>
      <GraphEditor current={current} initStatus={'Editable'} initEvent={'EditRun'} />
      <GraphTools current={current} initStatus={'Editable'} />
      <Settings current={current} />
      <Nodes current={current} />
      <NodeForms current={current} />
      <Operate current={current} />
      <Editable current={current} />
      <Tasks current={current} />
    </FullModal>
  );
};

export { TransferModal };
