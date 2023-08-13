import { Modal, Tabs } from 'antd';
import React, { useState } from 'react';
import * as im from 'react-icons/im';
import { MenuItemType } from 'typings/globelType';
import RequestModal from './forms/requestModal';
import RequestLayout from './layout';
import ApiCtrl from '@/utils/api/controller';
import { IDirectory } from '@/ts/core';

interface IProps {
  dir: IDirectory;
}

const TopTabs: React.FC<IProps> = ({ dir }) => {
  const [tabs, setTabs] = useState<MenuItemType[]>([]);
  const [curTab, setCurTab] = useState<MenuItemType>();

  const remove = (key: any) => {
    // 设置当前菜单项
    let index = tabs.findIndex((item) => item.key == key);
    let temp = tabs.filter((_, item) => item != index);
    setTabs(temp);

    // 设置当前 Tab
    if (temp.length > 0) {
      setCurTab(tabs[0]);
    } else {
      setCurTab(undefined);
    }
  };
  const add = () => {
    const modal = Modal.info({
      content: (
        <RequestModal
          dir={dir}
          save={(config) => {
            let newTab = {
              item: config,
              key: config.id,
              label: config.name,
              itemType: 'file',
              children: [],
            };
            setTabs([...tabs, newTab]);
            setCurTab(newTab);
          }}
          finished={() => modal.destroy()}
        />
      ),
      onOk: () => modal.destroy(),
      onCancel: () => modal.destroy(),
    });
  };
  const onEdit = (key: any, action: string) => {
    if (action == 'remove') {
      remove(key);
    } else if (action == 'add') {
      add();
    }
  };
  return (
    <Tabs
      type="editable-card"
      activeKey={curTab?.key}
      style={{ marginLeft: 10 }}
      items={tabs.map((item) => {
        return {
          key: item.key,
          label: item.label,
          children: <RequestLayout key={item.key} curTab={item}></RequestLayout>,
        };
      })}
      addIcon={
        <div
          style={{
            height: 42,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <im.ImPlus />
        </div>
      }
      onEdit={onEdit}
    />
  );
};

export default TopTabs;
