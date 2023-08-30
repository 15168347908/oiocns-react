import { linkCmd } from '@/ts/base/common/command';
import { XEntity } from '@/ts/base/schema';
import { IEntity, IBelong, IDirectory } from '@/ts/core';
import { ILink } from '@/ts/core/thing/config';
import { ConfigColl } from '@/ts/core/thing/directory';
import { Button, Modal, Space } from 'antd';
import React, { CSSProperties } from 'react';
import Selector from '../../selector';

interface IProps {
  current: ILink;
  style?: CSSProperties;
}

export const NodeTools: React.FC<IProps> = ({ current, style }) => {
  const onClick = (collName: ConfigColl) => {
    let selected: IEntity<XEntity>[] = [];
    Modal.confirm({
      icon: <></>,
      width: 800,
      content: (
        <Selector
          current={current.directory.target as IBelong}
          onChange={(files) => (selected = files)}
          loadItems={async (current: IDirectory) => {
            return current.loadConfigs(collName);
          }}
        />
      ),
      onOk: () => {
        switch (collName) {
          case ConfigColl.Requests:
          case ConfigColl.Mappings:
            linkCmd.emitter('main', 'insertRequest', selected);
            break;
          case ConfigColl.Scripts:
            linkCmd.emitter('main', 'insertScript', selected);
            break;
        }
      },
    });
  };
  return (
    <Space style={style}>
      <Button onClick={() => onClick(ConfigColl.Requests)}>插入 Request</Button>
      <Button onClick={() => onClick(ConfigColl.Scripts)}>插入 Script</Button>
      <Button onClick={() => onClick(ConfigColl.Mappings)}>插入 Mapping</Button>
      <Button onClick={() => linkCmd.emitter('main', 'executing')}>执行</Button>
    </Space>
  );
};
