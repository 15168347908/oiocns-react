import { AxiosResponse } from 'axios';
import React from 'react';
import MonacoEditor from '../monacor';
import { IRequest } from '@/ts/core/thing/config';

interface IProps {
  request: IRequest;
  response?: AxiosResponse;
}

const ResponsePart: React.FC<IProps> = ({ request, response }) => {
  return (
    <MonacoEditor
      entity={request}
      height={1200}
      defaultValue={response?.data}
      style={{ margin: 10 }}
      options={{ readOnly: true }}
      getVal={() => response?.data}
    />
  );
};

export default ResponsePart;
