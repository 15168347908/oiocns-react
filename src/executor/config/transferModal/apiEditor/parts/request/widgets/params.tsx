import { IRequest } from '@/ts/core/thing/config';
import { ProTable } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';

export interface IProps {
  current: IRequest;
}
interface Param {
  key: string;
  value?: string;
  description?: string;
}

const toParams = (value?: string): Param[] => {
  if (value) {
    let mark = value.indexOf('?');
    if (mark != -1) {
      let params = value.substring(mark + 1);
      let groups = params.split('&');
      let data: Param[] = [];
      for (let group of groups) {
        let split = group.split('=', 2);
        data.push({
          key: split[0],
          value: split.length > 1 ? split[1] : '',
        });
      }
      return data;
    }
  }
  return [];
};

const Params: React.FC<IProps> = ({ current }) => {
  const [params, setParams] = useState<Param[]>(toParams(current.axios.params));
  useEffect(() => {
    const id = current.subscribe(() => {
      let params = toParams(current.axios.url);
      setParams(params);
    });
    return () => {
      current.unsubscribe(id!);
    };
  }, [current.axios.params]);
  return (
    <ProTable
      dataSource={params}
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

export default Params;
