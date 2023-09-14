import SchemaForm from '@/components/SchemaForm';
import { ITransfer } from '@/ts/core';
import {
  ProFormColumnsType,
  ProFormInstance,
  ProTable,
} from '@ant-design/pro-components';
import React, { useEffect, useRef, useState } from 'react';
import { model } from '../../../../../ts/base';
import { ScriptForm } from './scriptForm';
import { Space, Button, Modal } from 'antd';

interface IProps {
  transfer: ITransfer;
  current: model.RequestNode;
  finished: () => void;
}

export const RequestForm: React.FC<IProps> = ({ transfer, current, finished }) => {
  const formRef = useRef<ProFormInstance>();
  const [open, setOpen] = useState<boolean>();
  const [formType, setFormType] = useState<string>('');
  const [pos, setPos] = useState<model.Pos>();
  const [scriptNode, setScriptNode] = useState<model.ScriptNode>();
  const ScriptTable: React.FC<{ pos: model.Pos; scripts: model.Script[] }> = ({
    pos,
    scripts,
  }) => {
    const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
    return (
      <>
        <Space>
          <Button
            onClick={() => {
              setOpen(true);
              setFormType('newScript');
              setPos(pos);
            }}>
            新增
          </Button>
          <Button
            onClick={async () => {
              for (const script of scripts) {
                await transfer.delNodeScript(pos, current, script.id);
              }
              setSelectedKeys([]);
            }}>
            删除
          </Button>
        </Space>
        <ProTable<model.Script>
          dataSource={scripts}
          cardProps={{ bodyStyle: { padding: 0, marginTop: 10 } }}
          scroll={{ y: 300 }}
          options={false}
          search={false}
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: setSelectedKeys,
          }}
          columns={[
            {
              title: '序号',
              valueType: 'index',
              width: 50,
            },
            {
              title: '名称',
              dataIndex: 'name',
            },
            {
              title: '代码',
              dataIndex: 'code',
            },
          ]}
        />
      </>
    );
  };
  useEffect(() => {
    const id = transfer.command.subscribe((type, cmd, args) => {
      if (type == 'node' && cmd == 'update') {
        formRef.current?.setFieldsValue(args);
      }
    });
    return () => {
      transfer.command.unsubscribe(id);
    };
  });
  const columns: ProFormColumnsType<model.RequestNode>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      formItemProps: {
        rules: [{ required: true, message: '名称为必填项' }],
      },
    },
    {
      title: '编码',
      dataIndex: 'code',
      formItemProps: {
        rules: [{ required: true, message: '编码为必填项' }],
      },
    },
    {
      title: '前置脚本',
      dataIndex: 'preScripts',
      valueType: 'select',
      colProps: { span: 24 },
      renderFormItem: () => {
        return (
          <ScriptTable
            scripts={formRef.current?.getFieldValue('preScripts')}
            pos={'pre'}
          />
        );
      },
    },
    {
      title: '后置脚本',
      dataIndex: 'postScripts',
      valueType: 'select',
      colProps: { span: 24 },
      renderFormItem: () => {
        return (
          <ScriptTable
            scripts={formRef.current?.getFieldValue('postScripts')}
            pos={'post'}
          />
        );
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      valueType: 'textarea',
      colProps: { span: 24 },
    },
  ];
  return (
    <>
      <SchemaForm<model.RequestNode>
        open
        formRef={formRef}
        title="请求定义"
        width={640}
        columns={columns}
        rowProps={{
          gutter: [24, 0],
        }}
        layoutType="ModalForm"
        initialValues={current}
        onOpenChange={(open: boolean) => {
          if (!open) {
            finished();
          }
        }}
        onFinish={async (values) => {
          const node = { ...current, ...values };
          await transfer.updNode(node);
          finished();
        }}
      />
      {open && formType && pos && (
        <ScriptForm
          formType={formType}
          transfer={transfer}
          node={current}
          pos={pos}
          finished={() => {
            setOpen(false);
            setFormType('');
            setPos(undefined);
          }}
        />
      )}
    </>
  );
};
