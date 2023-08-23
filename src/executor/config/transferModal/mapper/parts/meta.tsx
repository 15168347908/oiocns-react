import { XForm } from '@/ts/base/schema';
import { IBelong, IDirectory, IForm } from '@/ts/core';
import { Modal } from 'antd';
import React from 'react';
import { AiFillPlusCircle } from 'react-icons/ai';
import Selector from '../../selector';
import cls from './../index.module.less';

interface IProps {
  form?: XForm;
  setForm: (form: XForm) => void;
  belong: IBelong;
  typeName: string;
}

const Form: React.FC<IProps> = ({ form, setForm, typeName, belong }) => {
  const openSelector = () => {
    Modal.confirm({
      icon: <></>,
      width: 800,
      content: (
        <Selector
          multiple={false}
          current={belong}
          onChange={async (selected) => {
            if (selected.length > 0) {
              const form = selected[0] as IForm;
              form.metadata.attributes = await form.loadAttributes();
              setForm(form.metadata);
            }
          }}
          loadItems={async (current: IDirectory) => await current.loadForms()}
        />
      ),
    });
  };
  return (
    <div className={cls['mapping-header']}>
      <div>{typeName}</div>
      {form && <div>({form.name})</div>}
      <AiFillPlusCircle
        size={24}
        color={'#9498df'}
        style={{ marginLeft: 10 }}
        onClick={openSelector}
      />
    </div>
  );
};

export default Form;
