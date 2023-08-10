import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Input, Space } from 'antd';
import { AxiosRequestConfig } from 'axios';
import React, { useState } from 'react';
import { Method } from '@/utils/api/types';

interface IProps {
  axiosConfig: AxiosRequestConfig;
  send: () => void;
}

const InputBox: React.FC<IProps> = (props: IProps) => {
  props.axiosConfig.method ??= Method.GET;
  const [method, setMethod] = useState<string>(props.axiosConfig.method || Method.GET);
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
          props.axiosConfig.method = info.key;
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
  return <Input addonBefore={before} addonAfter={after} placeholder="输入 URL 地址" />;
};

export default InputBox;
