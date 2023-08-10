import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import MainLayout from '@/components/MainLayout';
import FullScreenModal from '@/executor/tools/fullScreen';
import useMenuUpdate from '@/hooks/useMenuUpdate';
import { Controller } from '@/ts/controller';
import { IDirectory } from '@/ts/core';
import { DownOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Col, Dropdown, Input, Layout, Row, Space, Tabs } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { ItemType } from 'rc-menu/lib/interface';
import { Tab } from 'rc-tabs/lib/interface';
import React, { ReactNode, useState } from 'react';
import * as im from 'react-icons/im';
import { MenuItemType } from 'typings/globelType';
import cls from './index.module.less';
import Editor from './subModal/monacor';

interface IDir {
  dir: IDirectory;
}

interface IProps extends IDir {
  finished: () => void;
}

const TransferModal: React.FC<IProps> = (props: IProps) => {
  // 文件夹菜单
  const loadDirectoryMenu = (directory: IDirectory): MenuItemType => {
    let menu: MenuItemType = {
      key: directory.id,
      item: directory,
      label: directory.name,
      itemType: directory.typeName,
      icon: (
        <EntityIcon entityId={directory.id} typeName={directory.typeName} size={18} />
      ),
      children: directory.children.map((child) => loadDirectoryMenu(child)),
    };
    return menu;
  };
  const [key, rootMenu, selectMenu, setSelectMenu] = useMenuUpdate(
    () => loadDirectoryMenu(props.dir),
    new Controller(props.dir.key),
  );

  // 顶部 tabs
  const createTab = (menu: MenuItemType) => {
    let index = tabs.findIndex((item) => item.key == menu.key);
    if (index == -1) {
      setTabs([...tabs, menu]);
    }
  };
  const [tabs, setTabs] = useState<MenuItemType[]>([]);
  const [curTab, setCurTab] = useState<string>();

  if (!rootMenu || !selectMenu) return <></>;
  return (
    <FullScreenModal
      open
      centered
      fullScreen
      width={'80vw'}
      bodyHeight={'80vh'}
      destroyOnClose
      title={'请求配置'}
      onCancel={() => props.finished()}>
      <MainLayout
        siderMenuData={rootMenu}
        selectMenu={selectMenu}
        top={
          <TopTabs
            menus={tabs}
            setMenus={setTabs}
            curTab={curTab}
            setCurTab={setCurTab}
          />
        }
        onSelect={(data) => {
          setSelectMenu(data);
          createTab(data);
          setCurTab(data.key);
        }}>
        <Layout key={key} style={{ height: '100%' }}>
          <RequestPart></RequestPart>
        </Layout>
      </MainLayout>
    </FullScreenModal>
  );
};

interface ITabs {
  menus: MenuItemType[];
  setMenus: any;
  curTab?: string;
  setCurTab: any;
}

const TopTabs: React.FC<ITabs> = (props: ITabs) => {
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
      onSelect={() => {}}></Tabs>
  );
};

const RequestPart: React.FC<{}> = () => {
  return (
    <Content style={{ height: '100%' }}>
      <Row>
        <InputBox></InputBox>
      </Row>
      <Row style={{ marginTop: 10, height: '100%' }}>
        <Col span={12}>
          <RequestConfig></RequestConfig>
        </Col>
        <Col span={12}>
          <Editor style={{ margin: 10 }}></Editor>
        </Col>
      </Row>
    </Content>
  );
};

const InputBox: React.FC<{}> = () => {
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
      发 送
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

const RequestConfig: React.FC<{}> = () => {
  const keys: { [key: string]: () => ReactNode } = {
    Params: () => <Params></Params>,
    Authorization: () => <Authorization></Authorization>,
    Headers: () => <Headers></Headers>,
    Body: () => <Editor style={{ margin: 4 }}></Editor>,
  };
  const [key, setKey] = useState<string>('Params');
  return (
    <div style={{ height: '100%' }}>
      <Tabs
        activeKey={key}
        items={Object.keys(keys).map((key) => {
          return {
            key: key,
            label: key,
          };
        })}
        onChange={(item) => setKey(item)}
      />
      {keys[key]()}
    </div>
  );
};

const Params: React.FC<{}> = () => {
  let params: any[] = [];
  return (
    <ProTable
      dataSource={params}
      cardProps={{ bodyStyle: { padding: 0 } }}
      scroll={{ y: 300 }}
      options={false}
      search={false}
      columns={[
        {
          title: 'Key',
          valueType: 'key',
        },
        {
          title: 'Value',
          dataIndex: 'value',
        },
        {
          title: 'Description',
          dataIndex: 'description',
        },
      ]}
    />
  );
};

const Authorization: React.FC<{}> = () => {
  return <></>;
};

const Headers: React.FC<{}> = () => {
  let headers: any[] = [];
  return (
    <ProTable
      dataSource={headers}
      cardProps={{ bodyStyle: { padding: 0 } }}
      scroll={{ y: 300 }}
      options={false}
      search={false}
      columns={[
        {
          title: 'Key',
          valueType: 'key',
        },
        {
          title: 'Value',
          dataIndex: 'value',
        },
        {
          title: 'Description',
          dataIndex: 'description',
        },
      ]}
    />
  );
};

export default TransferModal;
