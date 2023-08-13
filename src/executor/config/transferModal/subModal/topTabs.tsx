import orgCtrl, { Controller } from '@/ts/controller';
import { IDirectory } from '@/ts/core';
import { Tabs } from 'antd';
import React, { useState } from 'react';
import * as im from 'react-icons/im';
import { MenuItemType } from 'typings/globelType';
import { loadRequest } from '..';
import RequestModal from './forms/requestModal';
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
  const [open, setOpen] = useState<boolean>(false);
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

  const onEdit = (key: any, action: string) => {
    if (action == 'remove') {
      remove(key);
    } else if (action == 'add') {
      setOpen(true);
    }
  };
  return (
    <>
      <Tabs
        type="editable-card"
        activeKey={curTab?.key}
        style={{ marginLeft: 10 }}
        items={tabs.map((item) => {
          return {
            key: item.key,
            label: item.label,
            children: <RequestLayout curTab={item} />,
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
      {open && (
        <RequestModal
          dir={dir}
          cancel={() => setOpen(false)}
          finished={(request) => {
            let tab = loadRequest(request);
            setTabs([...tabs, tab]);
            setCurTab(tab);
            setOpen(false);
            ctrl.changCallback();
            orgCtrl.changCallback();
          }}
        />
      )}
    </>
  );
};

export default TopTabs;
