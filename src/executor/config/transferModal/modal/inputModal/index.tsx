import OioForm from '@/components/Common/FormDesign/OioFormNext';
import { IBelong, IForm } from '@/ts/core';
import React from 'react';
import { FullModal } from '../..';

interface IProps {
  current: IForm;
  finished: (values?: any) => void;
}

const InputModal: React.FC<IProps> = ({ current, finished }) => {
  return (
    <FullModal
      title={'表单输入'}
      finished={finished}
      fullScreen={false}
      children={
        <OioForm
          form={current.metadata}
          fields={current.fields}
          belong={current.directory.target as IBelong}
          onFinished={finished}
        />
      }
    />
  );
};

export { InputModal };
