import { ITransfer } from '@/ts/core';
import React from 'react';
import MonacoEditor from '../monacor';

interface IProps {
  current: ITransfer;
}

const ResponsePart: React.FC<IProps> = ({ current }) => {
  return (
    <MonacoEditor
      cmd={current.command}
      style={{ margin: 10 }}
      options={{ readOnly: true }}
    />
  );
};

export default ResponsePart;
