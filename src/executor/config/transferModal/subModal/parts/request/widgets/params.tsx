import { IRequest } from '@/ts/core/thing/request';
import { ProTable } from '@ant-design/pro-components';
import React from 'react';

export interface IProps {
  request: IRequest;
  setUrl: (url: string) => void;
}

interface Param {
  key: string;
  value: string;
  description: string;
}

const regex = /^https?:[/]2[\w./]+[?]((([a-z]+)=?[^&]+)|&)*$/;

const Params: React.FC<IProps> = ({ request }) => {
  let res = regex.exec(request.metadata.axios.params);
  console.log();
  let params: Param[] = [];
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
        {
          title: 'Description',
          dataIndex: 'description',
        },
      ]}
    />
  );
};

export default Params;
