import SchemaForm from '@/components/SchemaForm';
import { XSelection } from '@/ts/base/schema';
import { IDirectory } from '@/ts/core';
import { ConfigColl, ISelection } from '@/ts/core/thing/config';
import { ProFormColumnsType } from '@ant-design/pro-components';
import React, { useState } from 'react';
import { MenuItem, expand, loadFormsMenu } from '../transferModal';

interface IProps {
  formType: string;
  current: IDirectory | ISelection;
  finished: (selection?: ISelection) => void;
}

const getTrees = (current: IDirectory | ISelection) => {
  return [
    loadFormsMenu(
      current.typeName == '选择'
        ? (current as ISelection).directory.target.directory
        : (current as IDirectory).target.directory,
    ),
  ];
};

const SelectionForm: React.FC<IProps> = ({ formType, current, finished }) => {
  const [treeData, setTreeData] = useState<MenuItem[]>(getTrees(current));
  let initialValue = {};
  switch (formType) {
    case 'updateSelection':
      initialValue = current.metadata;
      break;
  }
  const columns: ProFormColumnsType<XSelection>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      formItemProps: {
        rules: [{ required: true, message: '名称为必填项' }],
      },
    },
    {
      title: '展示表单',
      dataIndex: 'formId',
      valueType: 'treeSelect',
      colProps: { span: 24 },
      formItemProps: {
        rules: [{ required: true, message: '展示为必填项' }],
      },
      fieldProps: {
        fieldNames: {
          label: 'label',
          value: 'key',
          children: 'children',
        },
        showSearch: true,
        loadData: async (node: MenuItem): Promise<void> => {
          console.log(node.isLeaf);
          if (!node.isLeaf) {
            let forms = await (node.item as IDirectory).loadForms();
            if (forms.length > 0) {
              setTreeData(getTrees(current));
            }
          }
        },
        treeNodeFilterProp: 'label',
        treeDefaultExpandedKeys: expand(treeData, ['事项配置', '表单配置']),
        treeData: treeData,
      },
    },
  ];
  return (
    <SchemaForm<XSelection>
      open
      title="环境定义"
      width={800}
      columns={columns}
      rowProps={{
        gutter: [24, 0],
      }}
      layoutType="ModalForm"
      initialValues={initialValue}
      onOpenChange={(open: boolean) => {
        if (!open) {
          finished();
        }
      }}
      onFinish={async (values) => {
        values.typeName = '选择';
        switch (formType) {
          case 'newSelection': {
            let directory = current as IDirectory;
            let selection = await directory.createConfig(ConfigColl.Selections, values);
            finished(selection as ISelection);
            break;
          }
          case 'updateEnvironment': {
            let selection = current as ISelection;
            await selection.refresh({ ...initialValue, ...values });
            finished(selection);
            break;
          }
        }
      }}
    />
  );
};

export default SelectionForm;
