import { IRequest } from '@/ts/core/thing/request';
import { ProTable } from '@ant-design/pro-components';
import React from 'react';

export interface IProps {
  request: IRequest;
}

const Headers: React.FC<IProps> = ({ request }) => {
  let headers: any[] = [];
  return (
    <ProTable
      dataSource={headers}
      cardProps={{ bodyStyle: { padding: 0 } }}
      scroll={{ y: 300 }}
      options={false}
      search={false}
      columns={[
        {
          title: 'Key',
          valueType: 'key',
        },
        {
          title: 'Value',
          dataIndex: 'value',
        },
        {
          title: 'Description',
          dataIndex: 'description',
        },
      ]}
    />
  );
};

export default Headers;
