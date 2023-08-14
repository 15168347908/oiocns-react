import { IRequest } from '@/ts/core/thing/request';
import { ProTable } from '@ant-design/pro-components';
import { RawAxiosRequestHeaders, AxiosHeaders } from 'axios';
import React, { useEffect, useState } from 'react';

export interface IProps {
  request: IRequest;
}

export type Header = RawAxiosRequestHeaders | AxiosHeaders;

interface HeaderData {
  key: string;
  value: string;
}

const toHeaders = (headers?: Header): HeaderData[] => {
  let rows: HeaderData[] = [];
  if (headers) {
    rows = Object.keys(headers).map((key) => {
      return {
        key: key,
        value: headers[key],
      };
    });
  }
  return rows;
};

const Header: React.FC<IProps> = ({ request }) => {
  const [rows, setRows] = useState<HeaderData[]>(toHeaders(request.axios.headers));
  useEffect(() => {
    const id = request.subscribe(() => {
      let value = toHeaders(request.axios.headers);
      setRows(value);
    });
    return () => {
      request.unsubscribe(id);
    };
  }, [request.axios.headers]);
  return (
    <ProTable
      dataSource={rows}
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
      ]}
    />
  );
};

export default Header;
