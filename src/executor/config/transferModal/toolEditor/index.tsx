import FullScreenModal from '@/executor/tools/fullScreen';
import React from 'react';
import LinkEditor from './editor';
import { ILink } from '@/ts/core/thing/link';

interface IProps {
  current: ILink;
  finished: () => void;
}

const LinkLayout: React.FC<IProps> = ({ current: link, finished }) => {
  return (
    <FullScreenModal
      open
      centered
      fullScreen
      width={'80vw'}
      bodyHeight={'80vh'}
      destroyOnClose
      title={'请求配置'}
      onCancel={() => finished()}>
      <LinkEditor link={link}></LinkEditor>
    </FullScreenModal>
  );
};

export default LinkLayout;
