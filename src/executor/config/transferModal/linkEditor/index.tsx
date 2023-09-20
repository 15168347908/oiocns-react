import FullScreenModal from '@/executor/tools/fullScreen';
import { ITransfer } from '@/ts/core';
import React from 'react';
import TransferEditor from './graph';
import { ToolBar } from './tools';

interface IProps {
  current: ITransfer;
  finished: () => void;
}

const TransferModal: React.FC<IProps> = ({ current, finished }) => {
  return (
    <FullScreenModal
      open
      centered
      fullScreen
      width={'80vw'}
      bodyHeight={'80vh'}
      destroyOnClose
      title={'迁移配置'}
      onCancel={() => finished()}>
      <TransferEditor current={current} initStatus={'Editable'} initEvent={'EditRun'} />
      <ToolBar current={current} initStatus={'Editable'} />
    </FullScreenModal>
  );
};

export default TransferModal;
