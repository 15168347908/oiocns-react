import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Input, Space } from 'antd';
import { ItemType } from 'rc-menu/lib/interface';
import React, { useState } from 'react';

class IProps {}

const InputBox: React.FC<IProps> = (props: IProps) => {
  let types = ['POST', 'GET'];
  let menus: ItemType[] = types.map((item) => {
    return {
      key: item,
      label: item,
    };
  });
  const [method, setMethod] = useState<string>('GET');
  let before = (
    <Dropdown menu={{ items: menus, onClick: (info) => setMethod(info.key) }}>
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
      onClick={() => {}}>
      Send
    </Space>
  );
  return (
    <Input
      addonBefore={before}
      addonAfter={after}
      size="large"
      placeholder="输入 URL 地址"
    />
  );
};

export default InputBox;
