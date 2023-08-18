import FullScreenModal from '@/executor/tools/fullScreen';
import { Command } from '@/ts/base';
import { Space } from 'antd';
import React, { useRef } from 'react';
import LinkEditor from './widgets/editor';
import { OpenSelector } from './widgets/selectRequest';
import { ILink } from '@/ts/core/thing/config';

interface IProps {
  current: ILink;
  finished: () => void;
}

const LinkLayout: React.FC<IProps> = ({ current: link, finished }) => {
  const cmd = useRef(new Command());
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
      <LinkEditor
        link={link}
        children={<ToolBar current={link} cmd={cmd.current} />}
        cmd={cmd.current}
      />
    </FullScreenModal>
  );
};

const ToolBar: React.FC<{ current: ILink; cmd: Command }> = ({ current, cmd }) => {
  return (
    <Space style={{ position: 'absolute', left: 10, top: 10 }}>
      <OpenSelector current={current} cmd={cmd}></OpenSelector>
    </Space>
  );
};

export default LinkLayout;
