import React from 'react';
import SchemaForm from '@/components/SchemaForm';
import { ProFormColumnsType } from '@ant-design/pro-components';
import { XRequestConfig } from '@/utils/api/types';
import { Method } from '@/utils/api/consts';
import { IDirectory } from '@/ts/core';
import { RequestModel } from '@/ts/base/model';

interface IProps {
  dir: IDirectory;
  save: (requestConfig: XRequestConfig) => void;
  finished: () => void;
}

const RequestModal: React.FC<IProps> = ({ dir, save, finished }) => {
  const columns: ProFormColumnsType<RequestModel>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      formItemProps: {
        rules: [{ required: true, message: '名称为必填项' }],
      },
    },
  ];
  return (
    <SchemaForm<RequestModel>
      open
      title="请求配置"
      width={640}
      columns={columns}
      rowProps={{
        gutter: [24, 0],
      }}
      layoutType="ModalForm"
      onFinish={async (values) => {
        values.axios = {
          method: Method.GET,
        };
        await dir.createRequest(values);
        save(values);
        finished();
      }}
    />
  );
};

export default RequestModal;
