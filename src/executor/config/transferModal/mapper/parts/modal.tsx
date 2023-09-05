import FullScreenModal from '@/executor/tools/fullScreen';
import { IMapping } from '@/ts/core/thing/config';
import React from 'react';
import Mapper from './mapper';

interface IProps {
  current: IMapping;
  finished: () => void;
}

const MappingModal: React.FC<IProps> = ({ current, finished }) => {
  return (
    <FullScreenModal
      open
      centered
      fullScreen
      width={'80vw'}
      bodyHeight={'80vh'}
      destroyOnClose
      title={'映射配置'}
      onCancel={() => finished()}>
      <Mapper current={current} />
    </FullScreenModal>
  );
};

export default MappingModal;
