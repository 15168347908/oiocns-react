import { IRequest } from '@/ts/core/thing/request';
import { ProTable } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';

export interface IProps {
  request: IRequest;
}
interface Param {
  key: string;
  value: string;
  description: string;
}

const regex = /^(?:https?:[/]2)[\w./]+[?]((([a-z]+)=?[^&]+)|&)*$/;

const toParams = (value?: string): Param[] => {
  if (value) {
    console.log(value);
    let res = regex.exec(value);
    console.log(res);
  }
  return [];
};

const Params: React.FC<IProps> = ({ request }) => {
  const [params, setParams] = useState<Param[]>(toParams(request.axios.params));
  useEffect(() => {
    const id = request.subscribe(() => {
      let params = toParams(request.axios.url);
      setParams(params);
    });
    return () => {
      request.unsubscribe(id!);
    };
  }, [request.axios.params]);
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

export default Params;
