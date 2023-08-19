import React from 'react';
import MonacoEditor from './../../monacor';
import { IRequest } from '@/ts/core/thing/config';

export interface IProps {
  current: IRequest;
}

const Body: React.FC<IProps> = ({ current }) => {
  return (
    <MonacoEditor
      height={1000}
      style={{ margin: 4 }}
      defaultValue={current.metadata.axios.data}
      onChange={(value) => {
        current.metadata.axios.data = value;
        current.refresh(current.metadata);
      }}
    />
  );
};

export default Body;
