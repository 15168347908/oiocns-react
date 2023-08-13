import { Modal, Tabs } from 'antd';
import React, { useState } from 'react';
import * as im from 'react-icons/im';
import RequestConfigModal from './forms/requestConfigModal';
import RequestLayout from './requestLayout';
import { MenuItemType } from 'typings/globelType';
interface IProps {}

const TopTabs: React.FC<IProps> = (props: IProps) => {
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
        <RequestConfigModal
          save={(config) => {
            let newTab = {
              item: config,
              key: config.code,
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
          children: <RequestLayout curTab={item}></RequestLayout>,
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
      onChange={(key) => {
        for (let tab of tabs) {
          if (tab.key == key) {
            setCurTab(tab);
          }
        }
      }}
      onEdit={onEdit}
    />
  );
};

export default TopTabs;
