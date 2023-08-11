import { Modal, Tabs } from 'antd';
import React from 'react';
import * as im from 'react-icons/im';
import { TabContext } from './../index';
import cls from './../index.module.less';
import RequestConfigModal from './forms/requestConfigModal';

interface IProps {
  context: TabContext;
}

const TopTabs: React.FC<IProps> = (props: IProps) => {
  const context = props.context;
  const remove = (key: any) => {
    // 设置当前菜单项
    let index = context.tabs.findIndex((item) => item.key == key);
    let tabs = context.tabs.filter((_, item) => item != index);
    context.setTabs(tabs);

    // 设置当前 Tab
    if (tabs.length > 0) {
      context.setCurTab(tabs[0]);
    } else {
      context.setCurTab(undefined);
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
            context.setTabs([...context.tabs, newTab]);
            context.setCurTab(newTab);
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
      activeKey={context.curTab?.key}
      style={{ marginLeft: 10 }}
      items={context.tabs.map((item) => {
        return {
          key: item.key,
          label: item.label,
        };
      })}
      addIcon={
        <div style={{ height: 42 }} className={cls['flex-center']}>
          <im.ImPlus />
        </div>
      }
      onChange={(key) => {
        for (let tab of context.tabs) {
          if (tab.key == key) {
            context.curTab = tab;
          }
        }
      }}
      onEdit={onEdit}
    />
  );
};

export default TopTabs;
