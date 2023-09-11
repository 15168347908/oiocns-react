import { model } from '@/ts/base';
import { ITransfer } from '@/ts/core';
import { Button, Input, Select, Space } from 'antd';
import React, { useEffect, useState } from 'react';

interface IProps {
  transfer: ITransfer;
  current: model.RequestNode;
  send: () => void;
}

const InputBox: React.FC<IProps> = ({ transfer, current, send }) => {
  const [curNode, setCurNode] = useState(current);
  useEffect(() => {
    const id = transfer.command.subscribe((type, cmd, args) => {
      if (type == 'node' && cmd == 'update') {
        setCurNode({ ...args });
      }
    });
    return () => {
      transfer.unsubscribe(id);
    };
  });
  return (
    <Space.Compact style={{ width: '100%' }}>
      <Input
        addonBefore={
          <Select
            style={{ width: 100 }}
            value={curNode.data.method}
            options={['GET', 'POST'].map((item) => {
              return {
                value: item,
                label: item,
              };
            })}
            onChange={(value) => {
              current.data.method = value;
              transfer.updNode(current);
            }}
          />
        }
        size="large"
        value={curNode.data.uri}
        placeholder="输入 URL 地址"
        onChange={(event) => {
          current.data.uri = event.target.value;
          transfer.updNode(current);
        }}
      />
      <Select
        disabled
        value={transfer.metadata.curEnv}
        options={transfer.metadata.envs.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        })}
      />
      <Button onClick={() => send()}>Send</Button>
    </Space.Compact>
  );
};

export default InputBox;
