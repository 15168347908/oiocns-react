import { Method } from '@/utils/api/consts';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Input, Space } from 'antd';
import React from 'react';

interface IProps {
  method: string;
  setMethod: (method: string) => void;
  url?: string;
  setUrl: (url?: string) => void;
  send: () => void;
}

const InputBox: React.FC<IProps> = ({ method, setMethod, url, setUrl, send }) => {
  let before = (
    <Dropdown
      menu={{
        items: Object.keys(Method).map((item) => {
          return {
            key: item,
            label: item,
          };
        }),
        onClick: (info) => setMethod(info.key),
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
      value={url}
      placeholder="输入 URL 地址"
      onChange={(event) => setUrl(event.target.value)}
    />
  );
};

export default InputBox;
