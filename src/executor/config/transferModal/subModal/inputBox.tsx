import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Input, Space } from 'antd';
import React, { useState } from 'react';
import { Method, XRequestConfig } from '@/utils/api/types';

interface IProps {
  config: XRequestConfig;
  onChange: (value: string) => void;
  send: () => void;
}

const InputBox: React.FC<IProps> = (props: IProps) => {
  let initMethod = props.config.axiosConfig?.method || Method.GET;
  const [method, setMethod] = useState<string>(initMethod);
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
          props.config.axiosConfig.method = info.key;
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
      onClick={() => props.send()}>
      Send
    </Space>
  );
  return (
    <Input
      addonBefore={before}
      addonAfter={after}
      placeholder="输入 URL 地址"
      onChange={(event) => {
        props.onChange(event.target.value);
      }}
    />
  );
};

export default InputBox;
