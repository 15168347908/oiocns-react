import { Modal, Tabs } from 'antd';
import React, { useState } from 'react';
import * as im from 'react-icons/im';
import { MenuItemType } from 'typings/globelType';
import RequestModal from './forms/requestModal';
import { IDirectory } from '@/ts/core';
import orgCtrl, { Controller } from '@/ts/controller';
import RequestLayout from './layout';

interface IProps {
  ctrl: Controller;
  dir: IDirectory;
  curTab?: MenuItemType;
  setCurTab: (tab?: MenuItemType) => void;
  tabs: MenuItemType[];
  setTabs: (tabs: MenuItemType[]) => void;
}

const TopTabs: React.FC<IProps> = ({ ctrl, dir, curTab, setCurTab, tabs, setTabs }) => {
  const remove = (key: any) => {
    // 设置当前菜单项
    let index = tabs?.findIndex((item) => item.key == key);
    let temp = tabs?.filter((_, item) => item != index);
    setTabs(temp);

    // 设置当前 Tab
    if (temp.length > 0) {
      setCurTab(temp[0]);
    } else {
      setCurTab(undefined);
    }
  };

  const add = () => {
    const modal = Modal.info({
      content: (
        <RequestModal
          dir={dir}
          finished={() => {
            modal.destroy();
            ctrl.changCallback();
            orgCtrl.changCallback();
          }}
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
          children: <RequestLayout curTab={item} />
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
        let tab = tabs.find((item) => item.key == key);
        if (tab) {
          setCurTab(tab);
        }
      }}
      onEdit={onEdit}
    />
  );
};

export default TopTabs;
