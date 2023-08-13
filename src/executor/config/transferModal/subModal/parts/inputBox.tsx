import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Input, Space } from 'antd';
import React, { useState } from 'react';
import { Method } from '@/utils/api/consts';
import { AxiosRequestConfig } from 'axios';

interface IProps {
  axios: AxiosRequestConfig;
  onChange: (value: string) => void;
  send: () => void;
}

const InputBox: React.FC<IProps> = ({ axios, onChange, send }) => {
  const [method, setMethod] = useState<string>(axios.method ?? Method.GET);
  let before = (
    <Dropdown
      menu={{
        items: Object.keys(Method).map((item) => {
          return {
            key: item,
            label: item,
          };
        }),
        onClick: (info) => {
          setMethod(info.key);
          axios.method = info.key;
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
  );
  let after = (
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
  );
  return (
    <Input
      addonBefore={before}
      addonAfter={after}
      value={axios.url}
      placeholder="输入 URL 地址"
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  );
};

export default InputBox;
