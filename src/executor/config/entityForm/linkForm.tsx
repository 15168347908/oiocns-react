import SchemaForm from '@/components/SchemaForm';
import { XLink } from '@/ts/base/schema';
import { IDirectory } from '@/ts/core';
import { ILink } from '@/ts/core/thing/link';
import { ProFormColumnsType } from '@ant-design/pro-components';
import React from 'react';

interface IProps {
  current: IDirectory;
  finished: (link?: ILink) => void;
}

const LinkModal: React.FC<IProps> = ({ current, finished }) => {
  const columns: ProFormColumnsType<XLink>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      formItemProps: {
        rules: [{ required: true, message: '名称为必填项' }],
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      valueType: 'textarea',
      colProps: { span: 24 },
      formItemProps: {
        rules: [{ required: true, message: '备注为必填项' }],
      },
    },
  ];
  return (
    <SchemaForm<XLink>
      open
      title="请求配置"
      width={640}
      columns={columns}
      rowProps={{
        gutter: [24, 0],
      }}
      layoutType="ModalForm"
      onOpenChange={(open: boolean) => {
        if (!open) {
          finished();
        }
      }}
      onFinish={async (values) => {
        let request = await current.createLink(values);
        finished(request!);
      }}
    />
  );
};

export default LinkModal;
