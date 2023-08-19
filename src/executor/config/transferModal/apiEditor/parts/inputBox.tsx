import { IRequest } from '@/ts/core/thing/config';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Input, Space } from 'antd';
import React, { useEffect, useState } from 'react';

interface IProps {
  current: IRequest;
  send: () => void;
}

const InputBox: React.FC<IProps> = ({ current, send }) => {
  const [url, setUrl] = useState<string | undefined>(current.axios.url);
  const [method, setMethod] = useState<string>(current.axios.method ?? 'GET');
  useEffect(() => {
    const id = current.subscribe(() => {
      setUrl(current.axios.url);
      setMethod(current.axios.method ?? 'GET');
    });
    return () => {
      current.unsubscribe(id);
    };
  });
  return (
    <Input
      addonBefore={
        <Dropdown
          menu={{
            items: ['GET', 'POST'].map((item) => {
              return {
                key: item,
                label: item,
              };
            }),
            onClick: (info) => {
              current.metadata.axios.method = info.key;
              current.refresh(current.metadata);
            },
          }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Space style={{ width: 80, userSelect: 'none' }}>{method}</Space>
            <DownOutlined />
          </div>
        </Dropdown>
      }
      addonAfter={
        <Space
          style={{
            width: 60,
            display: 'flex',
            justifyContent: 'center',
            userSelect: 'none',
          }}
          onClick={() => send()}>
          Send
        </Space>
      }
      value={url}
      placeholder="输入 URL 地址"
      onChange={(event) => {
        current.metadata.axios.url = event.target.value;
        current.refresh(current.metadata);
      }}
    />
  );
};

export default InputBox;
