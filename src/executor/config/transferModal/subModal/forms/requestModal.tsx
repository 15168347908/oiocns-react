import React from 'react';
import SchemaForm from '@/components/SchemaForm';
import { ProFormColumnsType } from '@ant-design/pro-components';
import { Method } from '@/utils/api/consts';
import { IDirectory } from '@/ts/core';
import { XRequest } from '@/ts/base/schema';

interface IProps {
  dir: IDirectory;
  finished: () => void;
}

const RequestModal: React.FC<IProps> = ({ dir, finished }) => {
  const columns: ProFormColumnsType<XRequest>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      formItemProps: {
        rules: [{ required: true, message: '名称为必填项' }],
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      valueType: 'textarea',
      colProps: { span: 24 },
      formItemProps: {
        rules: [{ required: true, message: '备注为必填项' }],
      },
    },
  ];
  return (
    <SchemaForm<XRequest>
      open
      title="请求配置"
      width={640}
      columns={columns}
      rowProps={{
        gutter: [24, 0],
      }}
      layoutType="ModalForm"
      onFinish={async (values) => {
        values.axios = { method: Method.GET };
        await dir.createRequest(values);
        finished();
      }}
    />
  );
};

export default RequestModal;
