import { Modal } from 'antd';
import React from 'react';
import { AiFillPlusCircle } from 'react-icons/ai';
import Selector from '../../selector';

interface IProps {
  form?: XForm;
  onChange: (form: XForm) => void;
  belong: IBelong;
  typeName: string;
}

const Form: React.FC<IProps> = ({ form, onChange, typeName, belong }) => {
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
