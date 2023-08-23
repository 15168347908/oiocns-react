import FullScreenModal from '@/executor/tools/fullScreen';
import useMenuUpdate from '@/hooks/useMenuUpdate';
import { IDirectory } from '@/ts/core';
import React from 'react';
import { loadMenu } from '..';
import MappingTable from './parts/table';
import { Controller } from '@/ts/controller';
import MainLayout from '@/components/MainLayout';

interface IProps {
  current: IDirectory;
  finished: () => void;
}

const MappingModal: React.FC<IProps> = ({ current, finished }) => {
  const [_, root, selected, setSelected] = useMenuUpdate(
    () => loadMenu(current, '映射'),
    new Controller(''),
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
      title={'映射配置'}
      onCancel={() => finished()}>
      <MainLayout siderMenuData={root} selectMenu={selected} onSelect={setSelected}>
        <MappingTable current={current}></MappingTable>
      </MainLayout>
    </FullScreenModal>
  );
};

export default MappingModal;
