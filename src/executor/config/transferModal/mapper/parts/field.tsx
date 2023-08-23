import React from 'react';
import cls from './../index.module.less';
import { XForm } from '@/ts/base/schema';

interface IProps {
  form?: XForm;
}

const Field: React.FC<IProps> = ({ form }) => {
  return (
    <ul className={cls['mapping-content']}>
      {form?.attributes?.map((item) => {
        return <li> {item.name}</li>;
      })}
    </ul>
  );
};

export default Field;
