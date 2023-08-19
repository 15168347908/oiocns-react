import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import MainLayout from '@/components/MainLayout';
import FullScreenModal from '@/executor/tools/fullScreen';
import useMenuUpdate from '@/hooks/useMenuUpdate';
import { Command } from '@/ts/base';
import { XFileInfo } from '@/ts/base/schema';
import { Controller } from '@/ts/controller';
import { IDirectory, IFileInfo } from '@/ts/core';
import React, { useEffect, useRef } from 'react';
import { MenuItemType } from 'typings/globelType';
import TopTabs from '@/executor/config/transferModal/linkEditor/topTabs';
import orgCtrl from '@/ts/controller';

interface IProps {
  dir: IDirectory;
  finished: () => void;
}

const TransferModal: React.FC<IProps> = ({ dir, finished }) => {
  const command = useRef(new Command());
  const ctrl = useRef(new Controller(''));

  const onSelect = (menu: MenuItemType) => {
    setSelectMenu(menu as MenuItemType);
    command.current.emitter('', 'onSelect', menu as MenuItemType);
  };

  useEffect(() => {
    const id = command.current.subscribe((_: string, cmd: string, args: any) => {
      if (cmd == 'onAdd') {
        orgCtrl.changCallback();
        ctrl.current.changCallback();
        onSelect(args as MenuItemType);
      }
    });
    return () => {
      command.current.unsubscribe(id);
    };
  }, [command, ctrl]);

  const [_, rootMenu, selectMenu, setSelectMenu] = useMenuUpdate(
    () => loadMenu(dir),
    ctrl.current,
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
      <MainLayout siderMenuData={rootMenu} selectMenu={selectMenu} onSelect={onSelect}>
        <TopTabs dir={dir} cmd={command.current} />
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
