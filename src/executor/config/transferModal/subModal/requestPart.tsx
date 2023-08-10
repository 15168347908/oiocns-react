import { ProTable } from '@ant-design/pro-components';
import { Tabs } from 'antd';
import React, { ReactNode, useState } from 'react';
import Editor from './monacor';

const RequestPart: React.FC<{}> = () => {
  const keys: { [key: string]: () => ReactNode } = {
    Params: () => <Params></Params>,
    Authorization: () => <Authorization></Authorization>,
    Headers: () => <Headers></Headers>,
    Body: () => <Editor style={{ margin: 4 }}></Editor>,
  };
  const [key, setKey] = useState<string>('Params');
  return (
    <div style={{ height: '100%' }}>
      <Tabs
        activeKey={key}
        items={Object.keys(keys).map((key) => {
          return {
            key: key,
            label: key,
          };
        })}
        onChange={(item) => setKey(item)}
      />
      {keys[key]()}
    </div>
  );
};

const Params: React.FC<{}> = () => {
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

const Authorization: React.FC<{}> = () => {
  return <></>;
};

const Headers: React.FC<{}> = () => {
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

export default RequestPart;
