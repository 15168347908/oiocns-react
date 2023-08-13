import { ProTable } from '@ant-design/pro-components';
import { AxiosHeaders, RawAxiosRequestHeaders } from 'axios';
import React from 'react';

type Header = RawAxiosRequestHeaders | AxiosHeaders;

export interface IProps {
  updateHeaders: (value?: Header) => void;
}

const Headers: React.FC<IProps> = (props: IProps) => {
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
