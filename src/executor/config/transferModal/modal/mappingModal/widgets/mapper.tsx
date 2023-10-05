import { model } from '@/ts/base';
import { generateUuid } from '@/ts/base/common';
import { ITransfer } from '@/ts/core';
import React from 'react';
import Center from './center';
import Fields from './fields';
import cls from './../index.module.less';

interface IProps {
  transfer: ITransfer;
  current: model.Mapping;
}

const Mapper: React.FC<IProps> = ({ transfer, current }) => {
  return (
    <div className={cls.mapper}>
      <Fields
        key={generateUuid()}
        target={'source'}
        transfer={transfer}
        current={current}
      />
      <Fields
        key={generateUuid()}
        target={'target'}
        transfer={transfer}
        current={current}
      />
      <Center key={generateUuid()} transfer={transfer} current={current} />
    </div>
  );
};

export { Mapper };
