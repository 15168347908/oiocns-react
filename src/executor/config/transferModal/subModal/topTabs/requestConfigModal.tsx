import React from 'react';
import SchemaForm from '@/components/SchemaForm';
import { ProFormColumnsType } from '@ant-design/pro-components';
import { Method, XRequestConfig } from '@/utils/api/types';

interface IProps {
  save: (requestConfig: XRequestConfig) => void;
  finished: () => void;
}

const RequestConfigModal = (props: IProps) => {
  const columns: ProFormColumnsType<XRequestConfig>[] = [
    {
      title: '代码',
      dataIndex: 'code',
      formItemProps: {
        rules: [{ required: true, message: '分类代码为必填项' }],
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
      formItemProps: {
        rules: [{ required: true, message: '分类名称为必填项' }],
      },
    },
  ];
  return (
    <SchemaForm<XRequestConfig>
      open
      title="请求配置"
      width={640}
      columns={columns}
      rowProps={{
        gutter: [24, 0],
      }}
      layoutType="ModalForm"
      onFinish={async (values) => {
        values.axiosConfig = {
          method: Method.POST,
        };
        props.save(values);
        props.finished();
      }}></SchemaForm>
  );
};

export default RequestConfigModal;
