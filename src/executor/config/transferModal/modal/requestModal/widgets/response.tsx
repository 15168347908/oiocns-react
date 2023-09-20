import { ITransfer } from '@/ts/core';
import React from 'react';
import MonacoEditor from './monacor';

interface IProps {
  transfer: ITransfer;
}

const Response: React.FC<IProps> = ({ transfer }) => {
  return (
    <MonacoEditor
      cmd={transfer.command}
      style={{ margin: 10 }}
      options={{ readOnly: true }}
    />
  );
};

export default Response;
