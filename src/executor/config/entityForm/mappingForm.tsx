import SchemaForm from '@/components/SchemaForm';
import { XForm, XMapping } from '@/ts/base/schema';
import { IDirectory, IForm } from '@/ts/core';
import { ConfigColl } from '@/ts/core/thing/directory';
import { ProFormColumnsType } from '@ant-design/pro-components';
import React, { useRef, useState } from 'react';
import { MenuItem, loadFormsMenu } from '../transferModal';
import orgCtrl from '@/ts/controller';

interface IProps {
  current: IDirectory;
  finished: () => void;
  cancel: () => void;
}

const MappingForm: React.FC<IProps> = ({ current, finished, cancel }) => {
  const [treeData, setTreeData] = useState<MenuItem[]>([loadFormsMenu(current)]);
  const sourceForm = useRef<XForm>();
  const targetForm = useRef<XForm>();
  const formSelector = (
    title: string,
    dataIndex: string,
    onSelect: (node: MenuItem) => void,
  ): ProFormColumnsType<XMapping> => {
    return {
      title: title,
      dataIndex: dataIndex,
      valueType: 'treeSelect',
      colProps: { span: 24 },
      formItemProps: {
        rules: [{ required: true, message: '源表单为必填项' }],
      },
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
              setTreeData([loadFormsMenu(current)]);
            }
          }
        },
        treeNodeFilterProp: 'label',
        treeDefaultExpandAll: true,
        treeData: treeData,
        onSelect: (_: string, node: MenuItem) => onSelect(node),
      },
    };
  };
  const columns: ProFormColumnsType<XMapping>[] = [
    formSelector(
      '源表单',
      'sourceForm',
      (node) => (sourceForm.current = (node.item as IForm).metadata),
    ),
    formSelector(
      '目标表单',
      'targetForm',
      (node) => (targetForm.current = (node.item as IForm).metadata),
    ),
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
      rowProps={{
        gutter: [24, 0],
      }}
      layoutType="ModalForm"
      onOpenChange={(open: boolean) => {
        if (!open) {
          cancel();
        }
      }}
      onFinish={async (values) => {
        values.sourceForm = sourceForm.current!;
        values.targetForm = targetForm.current!;
        values.mappings = [];
        values.name = sourceForm.current?.name + '->' + targetForm.current?.name;
        await current.createConfig(ConfigColl.Mappings, values);
        finished();
        orgCtrl.changCallback();
      }}
    />
  );
};

export default MappingForm;
