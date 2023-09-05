import MainLayout from '@/components/MainLayout';
import FullScreenModal from '@/executor/tools/fullScreen';
import useMenuUpdate from '@/hooks/useMenuUpdate';
import { Controller } from '@/ts/controller';
import { IDirectory } from '@/ts/core';
import React from 'react';
import { loadDirs } from '..';
import MappingTable from './parts/table';

interface IProps {
  current: IDirectory;
  finished: () => void;
}

const MappingBatchModal: React.FC<IProps> = ({ current, finished }) => {
  const [_, root, selected, setSelected] = useMenuUpdate(
    () => loadDirs(current),
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
      <MainLayout
        siderMenuData={root}
        selectMenu={selected}
        onSelect={(item) => setSelected(item)}>
        <MappingTable current={selected.item} />
      </MainLayout>
    </FullScreenModal>
  );
};

export default MappingBatchModal;
