import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import MainLayout from '@/components/MainLayout';
import FullScreenModal from '@/executor/tools/fullScreen';
import useMenuUpdate from '@/hooks/useMenuUpdate';
import { Controller } from '@/ts/controller';
import { IDirectory } from '@/ts/core';
import { Col, Layout, Row } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import React, { useState } from 'react';
import { MenuItemType } from 'typings/globelType';
import InputBox from './subModal/inputBox';
import Editor from './subModal/monacor';
import RequestPart from './subModal/requestPart';
import TopTabs from './subModal/topTabs';
import { AxiosRequestConfig } from 'axios';

interface IProps {
  dir: IDirectory;
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
  const [_, rootMenu, selectMenu, setSelectMenu] = useMenuUpdate(
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
  const [axiosConfig, setAxiosConfig] = useState<AxiosRequestConfig>();

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
        <Layout key={curTab} style={{ height: '100%' }}>
          <Content style={{ height: '100%' }}>
            <Row>
              <InputBox></InputBox>
            </Row>
            <Row style={{ marginTop: 10, height: '100%' }}>
              <Col span={12}>
                <RequestPart></RequestPart>
              </Col>
              <Col span={12}>
                <Editor style={{ margin: 10 }}></Editor>
              </Col>
            </Row>
          </Content>
        </Layout>
      </MainLayout>
    </FullScreenModal>
  );
};

export default TransferModal;
