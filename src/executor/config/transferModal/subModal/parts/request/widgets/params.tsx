import { ProTable } from '@ant-design/pro-components';
import React from 'react';

type Kv = { [key: string]: any };

export interface IProps {
  updateParams: (value?: Kv) => void;
}

const Params: React.FC<IProps> = (props: IProps) => {
  let params: any[] = [];
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
