import React from "react";
import SchemaForm from '@/components/SchemaForm';
import { ProFormColumnsType } from "@ant-design/pro-components";
import UploadItem from '@/executor/tools/UploadItem';

interface IProps {
  
}

const addRequestConfigModal = (props: IProps) => {
  const columns: ProFormColumnsType<FormModel>[] = [
    {
      title: '图标',
      dataIndex: 'icon',
      colProps: { span: 24 },
      renderFormItem: (_, __, form) => {
        return (
          <UploadItem
            readonly={readonly}
            typeName={props.typeName}
            icon={initialValue.icon}
            onChanged={(icon) => {
              form.setFieldValue('icon', icon);
            }}
            directory={directory}
          />
        );
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
      formItemProps: {
        rules: [{ required: true, message: '分类名称为必填项' }],
      },
    },
    {
      title: '代码',
      dataIndex: 'code',
      formItemProps: {
        rules: [{ required: true, message: '分类代码为必填项' }],
      },
    },
  ];
  return (
    <SchemaForm<FormModel>
      open
      title={title}
      width={640}
      columns={columns}
      initialValues={initialValue}
      rowProps={{
        gutter: [24, 0],
      }}
      layoutType="ModalForm"
      onOpenChange={(open: boolean) => {
        if (!open) {
          props.finished();
        }
      }}
      onFinish={async (values) => {
        values.typeName = props.typeName;
        switch (props.formType) {
          case 'update':
            await form!.update(values);
            break;
          case 'new':
            await directory.createForm(values);
            break;
        }
        props.finished();
      }}></SchemaForm>
  );
};
