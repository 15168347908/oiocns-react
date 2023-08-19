import React from 'react';
import MonacoEditor from './../../monacor';
import { IRequest } from '@/ts/core/thing/config';

export interface IProps {
  request: IRequest;
}

const Body: React.FC<IProps> = ({ request }) => {
  return (
    <MonacoEditor
      height={1000}
      style={{ margin: 4 }}
      defaultValue={request.metadata.axios.data}
      onChange={(value) => {
        request.metadata.axios.data = value;
        request.refresh(request.metadata);
      }}
    />
  );
};

export default Body;
