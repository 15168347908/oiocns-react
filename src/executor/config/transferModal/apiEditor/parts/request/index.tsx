import { Tabs } from 'antd';
import React from 'react';
import Body from './widgets/Body';
import Headers from './widgets/headers';
import Params from './widgets/params';
import { IRequest } from '@/ts/core/thing/config';

export type ReqTab = 'Param' | 'Header' | 'Body';

interface IProps {
  current: IRequest;
}

const RequestPart: React.FC<IProps> = ({ current }) => {
  const keys: { [key in string]: () => React.ReactNode } = {
    Param: () => <Params current={current} />,
    Header: () => <Headers current={current} />,
    Body: () => <Body current={current} />,
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
