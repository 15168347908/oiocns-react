import SchemaForm from '@/components/SchemaForm';
import { XMapping } from '@/ts/base/schema';
import orgCtrl from '@/ts/controller';
import { IDirectory, IForm } from '@/ts/core';
import { ProFormColumnsType } from '@ant-design/pro-components';
import React, { useRef, useState } from 'react';
import { MenuItem, expand, loadFormsMenu } from '../transferModal';
import { ConfigColl, IMapping } from '@/ts/core/thing/config';

interface IProps {
  current: IDirectory;
  finished: (mapping?: IMapping) => void;
}

const MappingForm: React.FC<IProps> = ({ current, finished }) => {
  const root = (dir: IDirectory) => dir.target.directory;
  const [treeData, setTreeData] = useState<MenuItem[]>([loadFormsMenu(root(current))]);
  const source = useRef<IForm>();
  const target = useRef<IForm>();
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
        rules: [{ required: true, message: title + '为必填项' }],
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
              setTreeData([loadFormsMenu(root(current))]);
            }
          }
        },
        treeNodeFilterProp: 'label',
        treeDefaultExpandedKeys: expand(treeData, ['事项配置', '表单配置']),
        treeData: treeData,
        onSelect: (_: string, node: MenuItem) => onSelect(node),
      },
    };
  };
  const columns: ProFormColumnsType<XMapping>[] = [
    formSelector('源表单', 'sourceForm', async (node) => {
      source.current = node.item as IForm;
    }),
    formSelector('目标表单', 'targetForm', async (node) => {
      target.current = node.item as IForm;
    }),
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
          finished();
        }
      }}
      onFinish={async (values) => {
        values.sourceForm = source.current!.metadata;
        values.targetForm = target.current!.metadata;
        values.sourceAttrs = [...(await source.current!.loadAttributes())];
        values.targetAttrs = [...(await target.current!.loadAttributes())];
        values.mappings = [];
        values.name = source.current?.name + '->' + target.current?.name;
        values.typeName = '映射';
        let mapping = await current.createConfig(ConfigColl.Mappings, values);
        finished(mapping as IMapping);
        orgCtrl.changCallback();
      }}
    />
  );
};

export default MappingForm;
