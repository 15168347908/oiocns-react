import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import MainLayout from '@/components/MainLayout';
import FullScreenModal from '@/executor/tools/fullScreen';
import useMenuUpdate from '@/hooks/useMenuUpdate';
import { XFileInfo } from '@/ts/base/schema';
import { Controller } from '@/ts/controller';
import { IDirectory, IFileInfo } from '@/ts/core';
import React, { useState } from 'react';
import { MenuItemType } from 'typings/globelType';
import TopTabs from './subModal/topTabs';

interface IProps {
  dir: IDirectory;
  finished: () => void;
}

const ctrl = new Controller('');

const TransferModal: React.FC<IProps> = ({ dir, finished }) => {
  // 菜单控制
  const [_, rootMenu, selectMenu, setSelectMenu] = useMenuUpdate(
    () => loadMenu(dir),
    ctrl,
  );

  // tabs 栏控制
  const [curDir, setCurDir] = useState<IDirectory>(dir);
  const [tabs, setTabs] = useState<MenuItemType[]>([]);
  const [curTab, setCurTab] = useState<MenuItemType | undefined>();
  const updateTabs = (tab: MenuItemType) => {
    let index = tabs.findIndex((item) => item.key == tab.key);
    if (index == -1) {
      setTabs([...tabs, tab]);
    }
  };

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
      onCancel={() => finished()}>
      <MainLayout
        siderMenuData={rootMenu}
        selectMenu={selectMenu}
        onSelect={(data) => {
          setSelectMenu(data);
          if (data.itemType == '请求') {
            setCurTab(data);
            updateTabs(data);
          } else {
            setCurDir(data.item);
          }
        }}>
        <TopTabs
          dir={curDir}
          ctrl={ctrl}
          curTab={curTab}
          setCurTab={setCurTab}
          tabs={tabs}
          setTabs={setTabs}
        />
      </MainLayout>
    </FullScreenModal>
  );
};

// 目录菜单
export const loadMenu = (directory: IDirectory): MenuItemType => {
  return {
    key: directory.id,
    item: directory,
    label: directory.name,
    itemType: directory.typeName,
    icon: <EntityIcon entityId={directory.id} typeName={directory.typeName} size={18} />,
    children: [
      ...directory.children.map(loadMenu),
      ...directory.configs.filter((item) => item.typeName == '请求').map(loadEntity),
    ],
  };
};

/** 请求菜单 */
export const loadEntity = (entity: IFileInfo<XFileInfo>): MenuItemType => {
  return {
    key: entity.id,
    item: entity,
    label: entity.name,
    itemType: entity.typeName,
    icon: <EntityIcon entityId={entity.id} typeName={entity.typeName} size={18} />,
    children: [],
  };
};

export default TransferModal;
