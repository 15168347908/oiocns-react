import { IRequest } from '@/ts/core/thing/request';
import { Method } from '@/utils/api/consts';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Input, Space } from 'antd';
import React, { useEffect, useState } from 'react';

interface IProps {
  request: IRequest;
  send: () => void;
}

const InputBox: React.FC<IProps> = ({ request, send }) => {
  const [url, setUrl] = useState<string | undefined>(request.axios.url);
  const [method, setMethod] = useState<string>(request.axios.method ?? Method.GET);
  useEffect(() => {
    const id = request.subscribe(() => {
      setUrl(request.axios.url);
      setMethod(request.axios.method ?? Method.GET);
    });
    return () => {
      request.unsubscribe(id);
    };
  });
  return (
    <Input
      addonBefore={
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
        request.update(event.target.value, 'url');
      }}
    />
  );
};

export default InputBox;
