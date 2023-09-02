import SchemaForm from '@/components/SchemaForm';
import { XLink } from '@/ts/base/schema';
import { IDirectory } from '@/ts/core';
import { ConfigColl, ILink } from '@/ts/core/thing/config';
import { ProFormColumnsType } from '@ant-design/pro-components';
import React from 'react';

interface IProps {
  formType: string;
  current: IDirectory | ILink;
  finished: (link?: ILink) => void;
}

const LinkModal: React.FC<IProps> = ({ formType, current, finished }) => {
  let initialValue = {};
  switch (formType) {
    case 'updateLink':
      initialValue = current.metadata;
      break;
  }
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
      title="链接定义"
      width={640}
      columns={columns}
      initialValues={initialValue}
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
        switch (formType) {
          case 'newLink': {
            values.typeName = '链接';
            const directory = current as IDirectory;
            let request = await directory.createConfig(ConfigColl.RequestLinks, values);
            finished(request as ILink);
            break;
          }
          case 'updateLink': {
            const link = current as ILink;
            link.refresh({ ...initialValue, ...values });
            finished(link);
            break;
          }
        }
      }}
    />
  );
};

export default LinkModal;
