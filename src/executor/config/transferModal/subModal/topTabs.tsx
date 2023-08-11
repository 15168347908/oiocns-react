import { Tabs } from 'antd';
import * as im from 'react-icons/im';
import { Tab } from 'rc-tabs/lib/interface';
import cls from './../index.module.less';
import { MenuItemType } from 'typings/globelType';
import React from 'react';
import { Modal } from 'antd';
import RequestConfigModal from './topTabs/requestConfigModal';
import { XRequestConfig } from '@/utils/api/types';

interface IProps {
  menus: MenuItemType[];
  setMenus: (menus: MenuItemType[]) => void;
  curTab?: string;
  setCurTab: (key: string) => void;
  addConfig: (config: XRequestConfig) => void;
}

const TopTabs: React.FC<IProps> = (props: IProps) => {
  let tabs: Tab[] = props.menus.map((item) => {
    return {
      key: item.key,
      label: item.label,
    };
  });
  const remove = (key: any) => {
    // 设置当前菜单项
    let index = props.menus.findIndex((item) => item.key == key);
    let menus = props.menus.filter((_, item) => item != index);
    props.setMenus(menus);

    // 设置当前 Tab
    if (tabs.length > 0) {
      props.setCurTab(tabs[0].key);
    }
  };
  const add = () => {
    const modal = Modal.info({
      content: (
        <RequestConfigModal
          save={(config) => {
            props.addConfig(config);
            props.setMenus([
              ...props.menus,
              { key: config.code, label: config.name, itemType: 'file', children: [] },
            ]);
            props.setCurTab(config.code);
          }}
          finished={() => modal.destroy()}
        />
      ),
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
      activeKey={props.curTab}
      style={{ marginLeft: 10 }}
      items={tabs}
      addIcon={
        <div style={{ height: 42 }} className={cls['flex-center']}>
          <im.ImPlus />
        </div>
      }
      onChange={(key) => props.setCurTab(key)}
      onEdit={onEdit}
    />
  );
};

export default TopTabs;
