import SchemaForm from '@/components/SchemaForm';
import { XExecutable } from '@/ts/base/schema';
import { IDirectory } from '@/ts/core';
import {} from '@/ts/core/';
import { IExecutable } from '@/ts/core/thing/config';
import { ConfigColl } from '@/ts/core/thing/directory';
import { ProFormColumnsType } from '@ant-design/pro-components';
import React from 'react';
import MonacoEditor from '../transferModal/apiEditor/parts/monacor';

interface IProps {
  formType: string;
  current: IDirectory | IExecutable;
  finished: (executable?: IExecutable) => void;
}

const ExecutableForm: React.FC<IProps> = ({ formType, current, finished }) => {
  let initialValue = {};
  switch (formType) {
    case 'updateExecutable':
      initialValue = current.metadata;
      break;
  }
  const columns: ProFormColumnsType<XExecutable>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      formItemProps: {
        rules: [{ required: true, message: '名称为必填项' }],
      },
    },
    {
      title: '脚本',
      dataIndex: 'coder',
      colProps: { span: 24 },
      renderFormItem: (_, __, form) => {
        return (
          <MonacoEditor
            height={400}
            defaultLanguage="javascript"
            defaultValue={form.getFieldValue('coder')}
            onChange={(value) => form.setFieldValue('coder', value)}
          />
        );
      },
    },
  ];
  return (
    <SchemaForm<XExecutable>
      open
      title="脚本配置"
      width={800}
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
          case 'newExecutable':
            const dir = current as IDirectory;
            let executable = await dir.createConfig(ConfigColl.Scripts, values);
            finished(executable as IExecutable);
            break;
          case 'updateExecutable':
            const exec = current as IExecutable;
            await exec.refresh({ ...initialValue, ...values });
            finished(exec);
            break;
        }
      }}
    />
  );
};

export default ExecutableForm;
