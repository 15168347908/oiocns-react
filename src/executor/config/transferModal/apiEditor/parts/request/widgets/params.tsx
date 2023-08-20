import { generateUuid } from '@/ts/base/common';
import { IRequest } from '@/ts/core/thing/config';
import { EditableProTable, ProFormInstance } from '@ant-design/pro-components';
import TextArea from 'antd/lib/input/TextArea';
import React, { useEffect, useRef, useState } from 'react';
import cls from './../index.module.css';

export interface IProps {
  current: IRequest;
}
export interface Param {
  id: string;
  key?: string;
  value?: string;
  description?: string;
}

const toUrlParams = (url: string = '', params: readonly Param[]): string => {
  let parts = url.split('?');
  let ans = params.map((item) => `${item.key ?? ''}=${item.value ?? ''}`).join('&');
  return parts[0] + '?' + ans;
};

const Params: React.FC<IProps> = ({ current }) => {
  const formRef = useRef<ProFormInstance>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => []);
  const [params, setParams] = useState<readonly Param[]>(current.metadata.params);
  const edited = useRef<boolean>(true);
  useEffect(() => {
    const id = current.subscribe(() => {
      setParams(current.metadata.params);
    });
    return () => {
      current.unsubscribe(id!);
    };
  }, [current.axios.params]);

  const onChange = (params: readonly Param[]) => {
    const url = toUrlParams(current.metadata.axios.url, params);
    current.metadata.axios.url = url;
    current.metadata.params = params;
    current.refresh(current.metadata);
  };

  return (
    <EditableProTable<Param>
      rowKey="id"
      formRef={formRef}
      value={params}
      maxLength={1000}
      onChange={onChange}
      controlled={true}
      onRow={(row) => {
        return {
          onMouseEnter: () => {
            setEditableRowKeys([row.id]);
          },
          onMouseLeave: () => {
            if (edited.current) {
              setEditableRowKeys([]);
            }
          },
        };
      }}
      columns={[
        {
          title: 'Key',
          dataIndex: 'key',
          renderFormItem: () => <AutoTextArea edited={edited} />,
        },
        {
          title: 'Value',
          dataIndex: 'value',
          renderFormItem: () => <AutoTextArea edited={edited} />,
        },
        {
          title: 'Description',
          dataIndex: 'description',
          renderFormItem: () => <AutoTextArea edited={edited} />,
        },
        {
          title: 'Option',
          dataIndex: 'operate',
          editable: false,
          render: (_, record) => [
            <a
              key="delete"
              onClick={() => {
                onChange(params.filter((item) => item.id != record.id));
              }}>
              删除
            </a>,
          ],
        },
      ]}
      recordCreatorProps={{
        creatorButtonText: '新增',
        position: 'bottom',
        newRecordType: 'dataSource',
        record: (_index, _params) => ({
          id: generateUuid(),
        }),
      }}
      editable={{
        type: 'multiple',
        editableKeys,
      }}
    />
  );
};

const AutoTextArea: React.FC<{
  value?: string;
  onChange?: (value?: string) => void;
  edited: React.MutableRefObject<boolean>;
}> = ({ value, onChange, edited }) => {
  return (
    <TextArea
      autoComplete={'off'}
      className={cls['textarea']}
      autoSize={true}
      defaultValue={value}
      onCompositionStart={() => (edited.current = false)}
      onCompositionEnd={(event) => {
        edited.current = true;
        onChange?.((event.target as HTMLTextAreaElement).value);
      }}
      onChange={(event) => {
        if (edited.current) {
          onChange?.(event.target.value);
        }
      }}
    />
  );
};

export default Params;
