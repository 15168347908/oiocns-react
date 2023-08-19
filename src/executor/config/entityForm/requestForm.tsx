import React from 'react';
import SchemaForm from '@/components/SchemaForm';
import { ProFormColumnsType } from '@ant-design/pro-components';
import { IDirectory } from '@/ts/core';
import { XRequest } from '@/ts/base/schema';
import { IRequest } from '@/ts/core/thing/config';
import {} from '@/ts/core/';
import { ConfigColl } from '@/ts/core/thing/directory';

interface IProps {
  dir: IDirectory;
  finished: (request: IRequest) => void;
  cancel: () => void;
}

const RequestModal: React.FC<IProps> = ({ dir, finished, cancel }) => {
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
      onOpenChange={(open: boolean) => {
        if (!open) {
          cancel();
        }
      }}
      onFinish={async (values) => {
        values.axios = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            appid: 'zx678sw12qm1',
            nonce: '12345678910',
            Authorization: 'Basic c2FiZXI6c2FiZXJfc2VjcmV0',
            'Blade-Auth':
              'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRfaWQiOiIwMDAwMDAiLCJ1c2VyX25hbWUiOiJzamd3YzAxIiwiZ3JvdXBJZCI6bnVsbCwiYXZhdGFyIjoiaHR0cHM6Ly9ndy5hbGlwYXlvYmplY3RzLmNvbS96b3Mvcm1zcG9ydGFsL0JpYXpmYW54bWFtTlJveHhWeGthLnBuZyIsImF1dGhvcml0aWVzIjpbIuS4jeiEseaVjyJdLCJjbGllbnRfaWQiOiJzYWJlciIsInJvbGVfbmFtZSI6IuS4jeiEseaVjyIsImxpY2Vuc2UiOiJwb3dlciBieSBKdXhpdSIsInVzZXJfaWQiOiIxNjQ5OTY4NDE4MDg3OTcyODY1Iiwicm9sZV9pZCI6IjE2NDE2MjcwNjM2NjUxMDI4NTAiLCJvcmdfaWQiOiIxNjQ5OTY0Njc2MTYxMjAwMTMwIiwic2NvcGUiOlsiYWxsIl0sIm5pY2tfbmFtZSI6IumZiOWbvSIsImFwcElkIjpudWxsLCJvYXV0aF9pZCI6IiIsImV4cCI6MjA1MTk3Nzk4NywiZGVwdF9pZCI6IiIsImp0aSI6ImZmNTYxMzUxLThkYTctNDYyZC04OTU4LWU2MWM2YzhkNmZmYyIsImFjY291bnQiOiJzamd3YzAxIn0.qJaC6T9xSz_bcOVbGYoLcPLdRRxRAy0KNPGDu0zpIwM',
          },
        };
        let request = await dir.createConfig(ConfigColl.Requests, values);
        finished(request as IRequest);
      }}
    />
  );
};

export default RequestModal;
