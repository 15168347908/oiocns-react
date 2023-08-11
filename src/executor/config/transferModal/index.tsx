import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import MainLayout from '@/components/MainLayout';
import FullScreenModal from '@/executor/tools/fullScreen';
import useMenuUpdate from '@/hooks/useMenuUpdate';
import { Controller } from '@/ts/controller';
import { IDirectory } from '@/ts/core';
import React, { useState } from 'react';
import { MenuItemType } from 'typings/globelType';
import ContainerLayout from './subModal/layout';
import TopTabs from './subModal/topTabs';
import { AxiosResponse } from 'axios';

interface IProps {
  dir: IDirectory;
  finished: () => void;
}

export interface TabContext {
  tabs: MenuItemType[];
  setTabs: React.Dispatch<React.SetStateAction<MenuItemType[]>>;
  curTab?: MenuItemType;
  setCurTab: React.Dispatch<React.SetStateAction<MenuItemType | undefined>>;
}

export interface RespContext {
  res: AxiosResponse | undefined;
  setRes: React.Dispatch<React.SetStateAction<AxiosResponse | undefined>>;
}

const TransferModal: React.FC<IProps> = (props: IProps) => {
  const [tabs, setTabs] = useState<MenuItemType[]>([]);
  const [curTab, setCurTab] = useState<MenuItemType>();
  const [res, setRes] = useState<AxiosResponse>();
  const tabContext: TabContext = { tabs, setTabs, curTab, setCurTab };
  const respContext: RespContext = { res, setRes };

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

  if (!rootMenu || !selectMenu) return <></>;

  const Container: React.FC<any> = () => {
    if (!curTab) {
      return <></>;
    }
    return <ContainerLayout curTab={curTab!} context={respContext}></ContainerLayout>;
  };

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
        top={<TopTabs context={tabContext} />}
        onSelect={(data) => {
          setSelectMenu(data);
        }}>
        <Container></Container>
      </MainLayout>
    </FullScreenModal>
  );
};

export default TransferModal;
