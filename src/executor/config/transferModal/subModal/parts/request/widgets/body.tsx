import React from 'react';
import MonacoEditor from './../../monacor';
import { IRequest } from '@/ts/core/thing/request';

export interface IProps {
  request: IRequest;
}

const Body: React.FC<IProps> = ({ request }) => {
  return (
    <MonacoEditor
      height={850}
      style={{ margin: 4 }}
      onChange={(value) => {
        request.update(value, 'data');
      }}
    />
  );
};

export default Body;
