import OioForm from '@/components/Common/FormDesign/OioFormNext';
import OperateModal from '@/executor/config/operateModal';
import GenerateThingTable from '@/executor/tools/generate/thingTable';
import { model } from '@/ts/base';
import { XEntity } from '@/ts/base/schema';
import { IBelong, IEntity, IForm } from '@/ts/core';
import { ShareSet } from '@/ts/core/public/entity';
import { ILink } from '@/ts/core/thing/link';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Space } from 'antd';
import { Item, Toolbar } from 'devextreme-react/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import * as forms from './../forms/index';
import Environments from './environments';

interface IProps {
  current: ILink;
}

export const ToolBar: React.FC<IProps> = ({ current }) => {
  return (
    <>
      <NodeTools current={current}></NodeTools>
      <Environments key={'environments'} current={current} />
      <Operate key={'operateModal'} current={current} />
      <Transfer key={'transfer'} current={current} />
      <OpenOperate key={'openOperate'} current={current} />
    </>
  );
};

const NodeTools: React.FC<IProps> = ({ current }) => {
  return (
    <Space style={{ position: 'absolute', left: 20, top: 64 }}>
      <Button onClick={() => current.command.emitter('graph', 'executing')}>运行</Button>
      <Button onClick={() => current.command.emitter('graph', 'center')}>
        定位至内容中心
      </Button>
    </Space>
  );
};

const Transfer: React.FC<IProps> = ({ current }) => {
  const [entities, setEntities] = useState<{ [key: string]: any }>({});
  const [commands, setCommands] = useState<{ [key: string]: string }>({});
  useEffect(() => {
    const id = current.command.subscribe((type, cmd, args) => {
      if (type != 'entity') return;
      switch (type) {
        case 'entity':
          switch (cmd) {
            case 'add': {
              const { curDir, cmd } = args;
              setEntities({ ...entities, [curDir.id]: curDir });
              setCommands({ ...commands, [curDir.id]: cmd });
              break;
            }
            case 'update': {
              const { entity } = args;
              setEntities({ ...entities, [entity.id]: entity });
              let mapping: { [key: string]: string } = {
                请求: 'updateRequest',
                脚本: 'updateExecutable',
                映射: 'updateMapping',
                选择: 'updateSelection',
                环境: 'updateEnvironment',
                存储: 'updateStore',
                事项配置: 'updateWorkConfig',
                实体配置: 'updateThingConfig',
              };
              setCommands({ ...commands, [entity.id]: mapping[entity.typeName] });
              break;
            }
            case 'copy': {
              const { entity } = args;
              Modal.confirm({
                title: '确认复制吗',
                onOk: async () => {
                  finished();
                },
                okText: '确认',
                cancelText: '取消',
              });
              break;
            }
            case 'delete': {
              const { entity } = args;
              Modal.confirm({
                title: '确认删除吗',
                onOk: async () => {
                  finished();
                },
                okText: '确认',
                cancelText: '取消',
              });
              break;
            }
          }
          break;
      }
    });
    return () => {
      current.command.unsubscribe(id);
    };
  });
  const finished = (id?: string) => {
    current.command.emitter('selector', 'refresh');
    if (id) {
      delete entities[id];
      delete commands[id];
      setEntities({ ...entities });
      setCommands({ ...commands });
    }
  };
  return (
    <>
      {Object.entries(entities).map((entry) => {
        switch (commands[entry[0]]) {
          case 'newEnvironment':
          case 'updateEnvironment':
            return (
              <forms.EnvironmentForm
                formType={commands[entry[0]]}
                link={current}
                current={entry[1]}
                finished={() => finished(entry[0])}
              />
            );
          case 'newRequest':
          case 'updateRequest':
            return (
              <forms.RequestForm
                formType={commands[entry[0]]}
                link={current}
                current={entry[1]}
                finished={() => {
                  finished(entry[0]);
                }}
              />
            );
          default:
            return <></>;
        }
      })}
    </>
  );
};

const OpenOperate: React.FC<IProps> = ({ current }) => {
  const [entity, setEntity] = useState<IEntity<XEntity>>();
  const [cmd, setCmd] = useState<string>('');
  useEffect(() => {
    const id = current.command.subscribe((type, cmd, args) => {
      if (type != 'entity') return;
      switch (type) {
        case 'entity':
          switch (cmd) {
            case 'open': {
              const { entity } = args;
              setEntity(entity);
              setCmd('open');
              break;
            }
          }
          break;
      }
    });
    return () => {
      current.command.unsubscribe(id);
    };
  });
  const finished = () => {
    setEntity(undefined);
    setCmd('');
  };
  return <>{entity && <OperateModal cmd={cmd} entity={entity} finished={finished} />}</>;
};

interface OpenArgs {
  formId: string;
  call: Call;
}

interface StoreArgs {
  storeId: string;
  formId: string;
  data: any[];
  call: Call;
}

type Call = (type: string, data?: any, message?: string) => void;

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
              setCenter(<InputForm key={'form'} form={form} data={data} />);
              setName(form.name);
              setOpen(true);
              call.current = openArgs.call;
              break;
          }
          break;
        case 'selection':
          switch (cmd) {
            case 'open':
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

interface FormProps {
  form: IForm;
  data: React.MutableRefObject<any>;
}

const InputForm: React.FC<FormProps> = ({ form, data }) => {
  return (
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
    />
  );
};

interface SelectionProps extends FormProps {
  selection: model.Selection;
  dataSource: any[];
}

const Selection: React.FC<SelectionProps> = ({ selection, dataSource, form, data }) => {
  return (
    <ProTable<any>
      dataSource={dataSource}
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
    />
  );
};
