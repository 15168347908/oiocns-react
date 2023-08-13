import { AxiosResponse } from 'axios';
import React from 'react';
import MonacoEditor from '../monacor';
import { Controller } from '@/ts/controller';

interface IProps {
  resp?: AxiosResponse;
  ctrl: Controller;
}

const ResponsePart: React.FC<IProps> = ({ resp, ctrl }) => {
  return (
    <MonacoEditor
      height={1200}
      defaultValue={resp?.data}
      style={{ margin: 10 }}
      options={{ value: resp?.data, readOnly: true }}
      ctrl={ctrl}
      curVal={() => resp?.data}
    />
  );
};

export default ResponsePart;
