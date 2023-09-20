import TransferEditor from '@/executor/config/transferModal/linkEditor/graph';
import { ToolBar } from '@/executor/config/transferModal/linkEditor/tools';
import FullScreenModal from '@/executor/tools/fullScreen';
import { ITransfer } from '@/ts/core';
import React from 'react';

interface IProps {
  current: ITransfer;
  finished: () => void;
}

const TransferView: React.FC<IProps> = ({ current, finished }) => {
  return (
    <FullScreenModal
      open
      centered
      fullScreen
      width={'80vw'}
      bodyHeight={'80vh'}
      destroyOnClose
      title={'迁移查看'}
      onCancel={() => finished()}>
      <TransferEditor current={current} initStatus="Viewable" initEvent={'ViewRun'} />
      <ToolBar current={current} initStatus="Viewable" />
    </FullScreenModal>
  );
};

export default TransferView;
