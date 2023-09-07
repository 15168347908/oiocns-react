import React, { useEffect, useRef } from 'react';
import { MenuItemType } from '../../../../../typings/globelType';
import MainLayout from '../../../../components/MainLayout';
import useMenuUpdate from '../../../../hooks/useMenuUpdate';
import { Command } from '../../../../ts/base';
import orgCtrl, { Controller } from '../../../../ts/controller';
import { IDirectory } from '../../../../ts/core';
import FullScreenModal from '../../../tools/fullScreen';
import { loadMenu } from './../index';
import Top from './layout/top';
import { ConfigColl } from '@/ts/core/thing/config';

interface IProps {
  current: IDirectory;
  finished: () => void;
}

const RequestsModal: React.FC<IProps> = ({ current: dir, finished }) => {
  const command = useRef(new Command());
  const ctrl = useRef(new Controller(''));

  const onSelect = async (menu: MenuItemType) => {
    if (menu.itemType == '目录') {
      await (menu.item as IDirectory).loadAllConfigs();
    }
    setSelected(menu as MenuItemType);
    command.current.emitter('top', 'onSelect', menu as MenuItemType);
  };

  useEffect(() => {
    const id = command.current.subscribe((type: string, cmd: string, args: any) => {
      switch (type) {
        case 'main': {
          switch (cmd) {
            case 'onAdd':
              orgCtrl.changCallback();
              ctrl.current.changCallback();
              onSelect(args as MenuItemType);
              break;
            case 'onTabSelected':
              onSelect(args as MenuItemType);
              break;
          }
        }
      }
    });
    return () => {
      command.current.unsubscribe(id);
    };
  }, [command, ctrl]);

  const [_, root, selected, setSelected] = useMenuUpdate(
    () => loadMenu(dir, ConfigColl.Requests),
    ctrl.current,
  );

  if (!root || !selected) return <></>;
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
      <MainLayout siderMenuData={root} selectMenu={selected} onSelect={onSelect}>
        <Top dir={dir} cmd={command.current} />
      </MainLayout>
    </FullScreenModal>
  );
};

export default RequestsModal;
