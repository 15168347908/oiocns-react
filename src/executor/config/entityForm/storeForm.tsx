import SchemaForm from '@/components/SchemaForm';
import { XMapping } from '@/ts/base/schema';
import orgCtrl from '@/ts/controller';
import { IDirectory } from '@/ts/core';
import { ConfigColl, IMapping as IStore } from '@/ts/core/thing/config';
import { ProFormColumnsType, ProFormInstance } from '@ant-design/pro-components';
import React, { useRef, useState } from 'react';
import { MenuItem, loadDirs } from '../transferModal';

interface IProps {
  formType: string;
  current: IDirectory | IStore;
  finished: (mapping?: IStore) => void;
}

const getTrees = (current: IDirectory | IStore): MenuItem[] => {
  const tree = [
    loadDirs(
      current.typeName == '存储'
        ? (current as IStore).directory.target.directory
        : (current as IDirectory).target.directory,
      (item) => (item.selectable = true),
    ),
  ];
  return tree;
};

const StoreForm: React.FC<IProps> = ({ formType, current, finished }) => {
  let initialValue = {};
  switch (formType) {
    case 'updateStore':
      initialValue = current.metadata;
      break;
  }
  const formRef = useRef<ProFormInstance>();
  const [treeData, setTreeData] = useState<MenuItem[]>(getTrees(current));
  const columns: ProFormColumnsType<XMapping>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      colProps: { span: 12 },
      formItemProps: {
        rules: [{ required: true, message: '名称为必填项' }],
      },
    },
    {
      title: '数据目录',
      dataIndex: 'uploadDir',
      valueType: 'treeSelect',
      colProps: { span: 24 },
      fieldProps: {
        fieldNames: {
          label: 'label',
          value: 'key',
          children: 'children',
        },
        showSearch: true,
        loadData: async (node: MenuItem): Promise<void> => {
          if (!node.isLeaf) {
            let forms = await (node.item as IDirectory).loadForms();
            if (forms.length > 0) {
              setTreeData(getTrees(current));
            }
          }
        },
        treeNodeFilterProp: 'label',
        treeData: treeData,
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      valueType: 'textarea',
      colProps: { span: 24 },
    },
  ];
  return (
    <SchemaForm<XMapping>
      ref={formRef}
      open
      title="映射配置"
      width={640}
      columns={columns}
      initialValues={initialValue}
      rowProps={{
        gutter: [24, 0],
      }}
      layoutType="ModalForm"
      onOpenChange={(open: boolean) => {
        if (!open) {
          finished();
        }
      }}
      onFinish={async (values) => {
        switch (formType) {
          case 'newStore': {
            values.mappings = [];
            values.typeName = '存储';
            let mapping = await (current as IDirectory).createConfig(
              ConfigColl.Stores,
              values,
            );
            finished(mapping as IStore);
            orgCtrl.changCallback();
            break;
          }
          case 'updateStore': {
            let mapping = current as IStore;
            mapping.refresh({ ...initialValue, ...values });
            finished(mapping);
            break;
          }
        }
      }}
    />
  );
};

export default StoreForm;
