import { IRequest } from '@/ts/core/thing/config';
import { ProTable } from '@ant-design/pro-components';
import { RawAxiosRequestHeaders, AxiosHeaders, AxiosHeaderValue } from 'axios';
import React, { useEffect, useState } from 'react';

export interface IProps {
  request: IRequest;
}

export type Header = RawAxiosRequestHeaders | AxiosHeaders;

interface HeaderData {
  key: string;
  value?: AxiosHeaderValue;
}

const toHeaders = (headers?: Header): HeaderData[] => {
  const final: Header = { ...headers };
  let rows: HeaderData[] = Object.keys(final).map((key) => {
    return {
      key: key,
      value: final[key],
    };
  });
  return rows;
};

const Header: React.FC<IProps> = ({ request }) => {
  const [rows, setRows] = useState<HeaderData[]>(toHeaders(request.axios.headers));
  useEffect(() => {
    const id = request.subscribe(() => {
      setRows(toHeaders(request.axios.headers));
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
          dataIndex: 'key',
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

export default Header;
