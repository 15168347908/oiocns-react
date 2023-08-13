import React from 'react';
import MonacoEditor from '../monacor';
import { AxiosResponse } from 'axios';

interface IProps {
  resp?: AxiosResponse;
}

const ResponsePart: React.FC<IProps> = (props: IProps) => {
  let data = props.resp?.data;
  let value = data ? JSON.stringify(data) : '';
  return (
    <MonacoEditor
      height={1200}
      style={{ margin: 10 }}
      options={{ value: value, readOnly: true }}
    />
  );
};

export default ResponsePart;
