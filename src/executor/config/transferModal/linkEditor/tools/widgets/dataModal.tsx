import GenerateThingTable from '@/executor/tools/generate/thingTable';
import { model } from '@/ts/base';
import { IForm, ITransfer } from '@/ts/core';
import CustomStore from 'devextreme/data/custom_store';
import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import FullScreenModal from '@/executor/tools/fullScreen';

interface IProps {
  transfer: ITransfer;
  current: model.Store;
  finished: () => void;
}

const loadFields = async (transfer: ITransfer, current: model.Store) => {
  const map: { [key: string]: model.FieldModel[] } = {};
  const forms = current.formIds.map((formId) => {
    return transfer.findMetadata<IForm>(formId + '*');
  });
  for (const form of forms) {
    if (form) {
      await form?.loadContent();
      map[form.id] = form.fields;
    }
  }
  return map;
};

const DataModal: React.FC<IProps> = ({ transfer, current, finished }) => {
  const [curTab, setCurTab] = useState<string>();
  const [notInit, setNotInit] = useState<boolean>(true);
  const [fieldsMap, setFieldsMap] = useState<{ [key: string]: model.FieldModel[] }>({});
  useEffect(() => {
    if (notInit) {
      loadFields(transfer, current).then((res) => {
        setFieldsMap(res);
        setNotInit(false);
      });
    }
  });
  return (
    <FullScreenModal
      open
      centered
      fullScreen
      width={'80vw'}
      bodyHeight={'80vh'}
      destroyOnClose
      title={'数据查看'}
      onCancel={() => finished()}>
      <Tabs
        activeKey={curTab}
        onChange={setCurTab}
        items={current.formIds.map((key) => {
          const form = transfer.findMetadata<IForm>(key);
          const data = transfer.curTask?.visitedNodes.get(current.id)?.data;
          return {
            key: key,
            label: form?.name,
            children: (
              <GenerateThingTable
                fields={fieldsMap[key] ?? []}
                height={'70vh'}
                selection={{
                  mode: 'multiple',
                  allowSelectAll: true,
                  selectAllMode: 'page',
                  showCheckBoxesMode: 'always',
                }}
                dataIndex="attribute"
                dataSource={
                  new CustomStore({
                    key: 'Id',
                    async load(_) {
                      return {
                        data: data ?? [],
                        totalCount: data?.length ?? 0,
                      };
                    },
                  })
                }
                remoteOperations={true}
              />
            ),
          };
        })}
      />
    </FullScreenModal>
  );
};

export default DataModal;
