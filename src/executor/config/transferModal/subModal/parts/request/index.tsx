import { Tabs } from 'antd';
import React from 'react';
import Body from './widgets/Body';
import Headers from './widgets/headers';
import Params from './widgets/params';

export type ReqTab = 'Param' | 'Header' | 'Body';

interface IProps {
  updateParams: (value: any) => void;
  updateHeaders: (value: any) => void;
  updateBody: (value: any) => void;
}

const RequestPart: React.FC<IProps> = ({ updateParams, updateHeaders, updateBody }) => {
  const keys: { [key in string]: () => React.ReactNode } = {
    Param: () => <Params updateParams={updateParams} />,
    Header: () => <Headers updateHeaders={updateHeaders} />,
    Body: () => <Body updateBody={updateBody} />,
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
