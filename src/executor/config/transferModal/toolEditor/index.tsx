import FullScreenModal from '@/executor/tools/fullScreen';
import { ILink } from '@/ts/core/thing/link';
import { Button, Space } from 'antd';
import React from 'react';
import LinkEditor from './editor';
import { openSelector } from './widgets/requestSelector';

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
      <LinkEditor link={link} children={<ToolBar current={link} />} />
    </FullScreenModal>
  );
};

const ToolBar: React.FC<{ current: ILink }> = ({ current }) => {
  return (
    <Space style={{ position: 'absolute', left: 10, top: 10 }}>
      <Button onClick={() => openSelector(current)}>插入 Request</Button>
    </Space>
  );
};

export default LinkLayout;
