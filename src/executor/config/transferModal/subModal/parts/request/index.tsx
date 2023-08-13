import { IRequest } from '@/ts/core/thing/request';
import { Tabs } from 'antd';
import React from 'react';
import Body from './widgets/Body';
import Headers from './widgets/headers';
import Params from './widgets/params';

export type ReqTab = 'Param' | 'Header' | 'Body';

interface IProps {
  request: IRequest;
  setUrl: (url: string) => void;
}

const RequestPart: React.FC<IProps> = ({ request, setUrl }) => {
  const keys: { [key in string]: () => React.ReactNode } = {
    Param: () => <Params request={request} setUrl={setUrl} />,
    Header: () => <Headers request={request} />,
    Body: () => <Body request={request} />,
  };
  return (
    <Tabs
      items={Object.keys(keys).map((key) => {
        return {
          key: key,
          label: key,
          children: keys[key](),
        };
      })}
    />
  );
};

export default RequestPart;
