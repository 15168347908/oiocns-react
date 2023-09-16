import { ITransfer } from '@/ts/core';
import { Drawer } from 'antd';
import React, { useState } from 'react';

interface IProps {
  current: ITransfer;
}

const Tasks: React.FC<IProps> = ({ current }) => {
  const [open, setOpen] = useState<boolean>(false);
  return <Drawer title="任务记录" placement="bottom" closable={true} />;
};

export default Tasks;
