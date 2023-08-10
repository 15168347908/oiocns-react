import { Tabs } from 'antd';
import * as im from 'react-icons/im';
import { Tab } from 'rc-tabs/lib/interface';
import cls from './../index.module.less';
import { MenuItemType } from 'typings/globelType';
import React from 'react';

interface IProps {
  menus: MenuItemType[];
  setMenus: any;
  curTab?: string;
  setCurTab: any;
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
  const onEdit = (key: any, action: string) => {
    if (action == 'remove') {
      remove(key);
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
      onSelect={() => {}}
    />
  );
};

export default TopTabs;
