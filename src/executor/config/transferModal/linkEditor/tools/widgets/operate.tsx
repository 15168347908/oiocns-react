import OioForm from '@/components/Common/FormDesign/OioFormNext';
import GenerateThingTable from '@/executor/tools/generate/thingTable';
import { model } from '@/ts/base';
import { IBelong, IForm } from '@/ts/core';
import { ShareSet } from '@/ts/core/public/entity';
import { ILink } from '@/ts/core/thing/link';
import { ProTable } from '@ant-design/pro-components';
import { Button, Modal } from 'antd';
import { Item, Toolbar } from 'devextreme-react/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import React, { useState, ReactNode, useRef, useEffect } from 'react';

interface IProps {
  current: ILink;
}

type Call = (type: string, data?: any, message?: string) => void;

interface OpenArgs {
  formId: string;
  call: Call;
}

interface SelectionArgs {
  formId: string;
  selection: model.Selection;
  data: any[];
  call: Call;
}

interface StoreArgs {
  storeId: string;
  formId: string;
  data: any[];
  call: Call;
}

const Operate: React.FC<IProps> = ({ current }) => {
  const [open, setOpen] = useState<boolean>();
  const [name, setName] = useState<string>();
  const [center, setCenter] = useState<ReactNode>(<></>);
  const data = useRef<any>();
  const call = useRef<Call>((_: string) => {});
  useEffect(() => {
    const id = current.command.subscribe(async (type, cmd, args) => {
      const loadForm = async (formId: string, call: Call): Promise<IForm | undefined> => {
        const form = ShareSet.get(formId) as IForm;
        if (!form) {
          call('错误', undefined, '未获取到表单信息！');
          return;
        }
        await form.loadContent();
        data.current = {};
        return form;
      };
      switch (type) {
        case 'input':
          switch (cmd) {
            case 'open':
              const openArgs = args as OpenArgs;
              const form = await loadForm(openArgs.formId, openArgs.call);
              if (!form) return;
              setCenter(
                <OioForm
                  form={form.metadata}
                  fields={form.fields}
                  belong={form.directory.target as IBelong}
                  onValuesChange={(_, values) => {
                    for (const key in values) {
                      for (const field of form!.fields) {
                        if (field.id == key) {
                          data.current[field.code] = values[key];
                        }
                      }
                    }
                  }}
                />,
              );
              setName(form.name);
              setOpen(true);
              call.current = openArgs.call;
              break;
          }
          break;
        case 'selection':
          switch (cmd) {
            case 'open':
              const selectionArgs = args as SelectionArgs;
              const selection = selectionArgs.selection;
              const form = await loadForm(selectionArgs.formId, selectionArgs.call);
              if (!form) return;
              setCenter(
                <ProTable<any>
                  dataSource={selectionArgs.data}
                  search={false}
                  options={false}
                  cardProps={{ bodyStyle: { padding: 0 } }}
                  scroll={{ y: 300 }}
                  rowKey={selection.key}
                  columns={form.attributes.map((item) => {
                    return { title: item.name, dataIndex: item.property?.info };
                  })}
                  tableAlertRender={false}
                  rowSelection={{
                    type: selection.type,
                    onChange: (_, rows) => {
                      switch (selection.type) {
                        case 'checkbox':
                          data.current = rows;
                          break;
                        case 'radio':
                          data.current = rows[0];
                          break;
                      }
                    },
                  }}
                />,
              );
              break;
          }
        case 'store':
          switch (cmd) {
            case 'open':
              const storeArgs = args as StoreArgs;
              const formId = storeArgs.formId;
              if (!ShareSet.has(formId)) return;
              const form = ShareSet.get(formId) as IForm;
              await form.loadContent();
              setCenter(
                <GenerateThingTable
                  fields={form.fields}
                  height={'70vh'}
                  customToolBar={() => {
                    const [saving, setSaving] = useState<boolean>(false);
                    return (
                      <Toolbar>
                        <Item location="after">
                          <Button loading={saving} onClick={async () => {}}>
                            转储至目录
                          </Button>
                        </Item>
                        <Item location="after">
                          <Button loading={saving} onClick={async () => {}}>
                            存储至实体库
                          </Button>
                        </Item>
                      </Toolbar>
                    );
                  }}
                  selection={{
                    mode: 'multiple',
                    allowSelectAll: true,
                    selectAllMode: 'page',
                    showCheckBoxesMode: 'always',
                  }}
                  dataIndex="attribute"
                  dataSource={
                    new CustomStore({
                      key: 'Id',
                      async load(_) {
                        return {
                          data: storeArgs.data,
                          totalCount: storeArgs.data.length,
                        };
                      },
                    })
                  }
                  remoteOperations={true}
                />,
              );
              setName('数据');
              setOpen(true);
              break;
          }
      }
    });
    return () => {
      current.command.unsubscribe(id);
    };
  });
  return (
    <>
      {open && (
        <Modal
          open={open}
          title={name}
          onOk={() => {
            call.current('成功', data.current);
            setOpen(false);
          }}
          onCancel={() => {
            call.current('取消', undefined, '已取消输入');
            setOpen(false);
          }}
          destroyOnClose={true}
          cancelText={'关闭'}
          width={1200}>
          {center}
        </Modal>
      )}
    </>
  );
};

export default Operate;