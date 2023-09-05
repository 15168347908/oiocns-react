import SchemaForm from '@/components/SchemaForm';
import { XMapping } from '@/ts/base/schema';
import orgCtrl from '@/ts/controller';
import { IDirectory } from '@/ts/core';
import { ConfigColl, IMapping } from '@/ts/core/thing/config';
import { ProFormColumnsType } from '@ant-design/pro-components';
import React, { useState } from 'react';
import { MenuItem, defaultGenLabel, expand, loadFormsMenu } from '../transferModal';

interface IProps {
  formType: string;
  current: IDirectory | IMapping;
  finished: (mapping?: IMapping) => void;
}

const root = (current: IDirectory | IMapping) => {
  if (current.typeName == '目录') {
    return (current as IDirectory).target.directory;
  } else {
    return (current as IMapping).directory.target.directory;
  }
};

const MappingForm: React.FC<IProps> = ({ formType, current, finished }) => {
  let initialValue = {};
  switch (formType) {
    case 'updateMapping':
      initialValue = current.metadata;
      break;
  }
  const [treeData, setTreeData] = useState<MenuItem[]>([
    loadFormsMenu(root(current), (entity) =>
      defaultGenLabel(entity, ['实体配置', '事项配置']),
    ),
  ]);
  const formSelector = (
    title: string,
    dataIndex: string,
  ): ProFormColumnsType<XMapping> => {
    return {
      title: title,
      dataIndex: dataIndex,
      valueType: 'treeSelect',
      colProps: { span: 24 },
      formItemProps: {
        rules: [{ required: true, message: title + '为必填项' }],
      },
      fieldProps: {
        fieldNames: {
          label: 'node',
          value: 'key',
          children: 'children',
        },
        showSearch: true,
        loadData: async (node: MenuItem): Promise<void> => {
          if (!node.isLeaf) {
            let forms = await (node.item as IDirectory).loadForms();
            if (forms.length > 0) {
              setTreeData([
                loadFormsMenu(root(current), (entity) =>
                  defaultGenLabel(entity, ['实体配置', '事项配置']),
                ),
              ]);
            }
          }
        },
        treeNodeFilterProp: 'label',
        treeDefaultExpandedKeys: expand(treeData, ['事项配置', '表单配置']),
        treeData: treeData,
      },
    };
  };
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
      title: '映射类型',
      dataIndex: 'type',
      valueType: 'select',
      colProps: { span: 12 },
      formItemProps: {
        rules: [{ required: true, message: '名称为必填项' }],
      },
      fieldProps: {
        options: [
          { label: '字段映射', value: 'fields' },
          { label: '字典/分类映射', value: 'specieItems' },
        ],
      },
    },
    formSelector('源表单', 'sourceForm'),
    formSelector('目标表单', 'targetForm'),
    {
      title: '备注',
      dataIndex: 'remark',
      valueType: 'textarea',
      colProps: { span: 24 },
    },
  ];
  return (
    <SchemaForm<XMapping>
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
        values.mappings = [];
        values.typeName = '映射';
        switch (formType) {
          case 'newMapping': {
            let mapping = await (current as IDirectory).createConfig(
              ConfigColl.Mappings,
              values,
            );
            finished(mapping as IMapping);
            orgCtrl.changCallback();
            break;
          }
          case 'updateMapping': {
            let mapping = current as IMapping;
            mapping.refresh({ ...initialValue, ...values });
            finished(mapping);
            break;
          }
        }
      }}
    />
  );
};

export default MappingForm;
