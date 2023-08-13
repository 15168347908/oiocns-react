import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import MainLayout from '@/components/MainLayout';
import FullScreenModal from '@/executor/tools/fullScreen';
import useMenuUpdate from '@/hooks/useMenuUpdate';
import { Controller } from '@/ts/controller';
import { IDirectory } from '@/ts/core';
import React from 'react';
import { MenuItemType } from 'typings/globelType';
import TopTabs from './subModal/topTabs';

interface IProps {
  dir: IDirectory;
  finished: () => void;
}

const TransferModal: React.FC<IProps> = ({ dir, finished }) => {
  // 配置文件菜单
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
  // 菜单控制
  const [_, rootMenu, selectMenu, setSelectMenu] = useMenuUpdate(
    () => loadDirectoryMenu(dir),
    new Controller(dir.key),
  );

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
        onSelect={(data) => setSelectMenu(data)}
        children={<TopTabs dir={dir} />}
      />
    </FullScreenModal>
  );
};

export default TransferModal;
