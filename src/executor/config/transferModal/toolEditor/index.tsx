import FullScreenModal from '@/executor/tools/fullScreen';
import { ILink } from '@/ts/core/thing/link';
import { Space } from 'antd';
import React from 'react';
import LinkEditor from './widgets/editor';
import { OpenSelector } from './widgets/selectRequest';
import { Command } from '@/ts/base';

interface IProps {
  current: ILink;
  finished: () => void;
}

export const command = new Command();

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
      <OpenSelector current={current}></OpenSelector>
    </Space>
  );
};

export default LinkLayout;
