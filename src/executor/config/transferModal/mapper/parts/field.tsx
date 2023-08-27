import { XAttribute } from '@/ts/base/schema';
import React, { ReactNode } from 'react';

interface IProps {
  attr: XAttribute;
  operate: ReactNode;
}

const Field: React.FC<IProps> = ({ attr, operate }) => {
  return (
    <div>
      <div>{attr.name}</div>
      {operate}
    </div>
  );
};

export default Field;
