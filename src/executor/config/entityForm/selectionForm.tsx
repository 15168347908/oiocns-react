import SchemaForm from '@/components/SchemaForm';
import { XAttribute, XSelection } from '@/ts/base/schema';
import { IDirectory, IForm } from '@/ts/core';
import { ConfigColl, ISelection } from '@/ts/core/thing/config';
import { ProFormColumnsType, ProFormInstance } from '@ant-design/pro-components';
import React, { useEffect, useRef, useState } from 'react';
import { MenuItem, expand, loadFormsMenu } from '../transferModal';
import { ShareSet } from '@/ts/core/public/entity';

interface IProps {
  formType: string;
  current: IDirectory | ISelection;
  finished: (selection?: ISelection) => void;
}

const getTrees = (current: IDirectory | ISelection) => {
  const tree = [
    loadFormsMenu(
      current.typeName == '选择'
        ? (current as ISelection).directory.target.directory
        : (current as IDirectory).target.directory,
    ),
  ];
  return tree;
};

const getFormId = (current: IDirectory | ISelection) => {
  return current.typeName == '选择' ? (current as ISelection).metadata.formId : undefined;
};

const getAttributes = async (formId?: string) => {
  if (formId) {
    if (ShareSet.has(formId)) {
      const form = ShareSet.get(formId) as IForm;
      return await form.loadAttributes();
    }
  }
  return [];
};

const SelectionForm: React.FC<IProps> = ({ formType, current, finished }) => {
  const formRef = useRef<ProFormInstance>();
  const [formId, setFormId] = useState<string | undefined>(getFormId(current));
  const [treeData, setTreeData] = useState<MenuItem[]>(getTrees(current));
  const [attrs, setAttrs] = useState<XAttribute[]>([]);
  useEffect(() => {
    getAttributes(formId).then((res) => setAttrs(res));
  }, [formId]);
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
      title: '类型',
      dataIndex: 'type',
      valueType: 'select',
      formItemProps: {
        rules: [{ required: true, message: '名称为必填项' }],
      },
      fieldProps: {
        options: [
          { value: 'checkbox', label: '多选' },
          { value: 'radio', label: '单选' },
        ],
      },
    },
    {
      title: '列表表单',
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
    {
      title: '主键',
      dataIndex: 'key',
      valueType: 'select',
      colProps: { span: 24 },
      formItemProps: {
        rules: [{ required: true, message: '名称为必填项' }],
      },
      fieldProps: {
        options: attrs.map((item) => {
          return {
            label: item.name,
            value: item.property?.info,
          };
        }),
      },
    },
  ];
  return (
    <SchemaForm<XSelection>
      open
      formRef={formRef}
      title="选择定义"
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
      onValuesChange={async (changedValues: any) => {
        const formId = changedValues.formId;
        if (formId) {
          setFormId(formId);
          formRef.current?.setFieldValue('key', undefined);
        }
      }}
      onFinish={async (values) => {
        console.log(values, treeData);
        values.typeName = '选择';
        switch (formType) {
          case 'newSelection': {
            let directory = current as IDirectory;
            let selection = await directory.createConfig(ConfigColl.Selections, values);
            finished(selection as ISelection);
            break;
          }
          case 'updateSelection': {
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
