import FullScreenModal from '@/executor/tools/fullScreen';
import { ILink } from '@/ts/core/thing/link';
import React from 'react';
import LinkEditor from './widgets/editor';

export type Retention = 'runtime' | 'configuration';

interface IProps {
  current: ILink;
  finished: () => void;
}

const LinkModal: React.FC<IProps> = ({ current, finished }) => {
  return (
    <FullScreenModal
      open
      centered
      fullScreen
      width={'80vw'}
      bodyHeight={'80vh'}
      destroyOnClose
      title={'链接配置'}
      onCancel={() => finished()}>
      <LinkEditor current={current} />
    </FullScreenModal>
  );
};

export default LinkModal;
