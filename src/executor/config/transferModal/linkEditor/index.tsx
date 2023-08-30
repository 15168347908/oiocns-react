import FullScreenModal from '@/executor/tools/fullScreen';
import { ILink } from '@/ts/core/thing/config';
import React, { CSSProperties, ReactNode } from 'react';
import LinkEditor from './widgets/editor';
import { Environments } from './widgets/environments';
import { NodeTools } from './widgets/nodeTools';

enum Retention {
  Runtime,
  Configuration,
}

interface IProps {
  current: ILink;
  finished: () => void;
  retention?: Retention;
}

const LinkModal: React.FC<IProps> = ({
  current,
  finished,
  retention = Retention.Configuration,
}) => {
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
        current={current}
        children={<ToolBar current={current} retention={retention} />}
      />
    </FullScreenModal>
  );
};

type ToolProps = Omit<IProps, 'finished'>;

const ToolBar: React.FC<ToolProps> = ({
  current,
  retention = Retention.Configuration,
}) => {
  // 节点
  const nodes: ReactNode[] = [];

  // 环境变量
  const style: CSSProperties = { position: 'absolute', right: 10, top: 10 };
  nodes.push(<Environments style={style} />);

  // 配置态可以编辑图
  if (retention == Retention.Configuration) {
    const style: CSSProperties = { position: 'absolute', left: 10, top: 10 };
    nodes.push(<NodeTools current={current} style={style} />);
  }
  return <>{nodes}</>;
};

export default LinkModal;
