import OioForm from '@/components/Common/FormDesign/OioFormNext';
import EntityForm from '@/executor/config/entityForm';
import OperateModal from '@/executor/config/operateModal';
import { linkCmd } from '@/ts/base/common/command';
import { XEntity, XFileInfo, XSelection } from '@/ts/base/schema';
import { IBelong, IDirectory, IEntity, IFileInfo, IForm } from '@/ts/core';
import { ShareSet } from '@/ts/core/public/entity';
import { ConfigColl, ILink } from '@/ts/core/thing/config';
import { CloseCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { Button, Dropdown, Modal, Space, Tag } from 'antd';
import React, { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import Selector from '../../selector';
import { Retention } from '../index';
import { Environments } from './environments';
import { deepClone } from '@/ts/base/common';

interface ToolProps {
  current: ILink;
  retention: Retention;
}

export const ToolBar: React.FC<ToolProps> = ({
  current,
  retention = Retention.Configuration,
}) => {
  const nodes: ReactNode[] = [];
  const style: CSSProperties = { position: 'absolute', right: 20, top: 64 };
  nodes.push(<Environments key={'environments'} style={style} />);
  if (retention == Retention.Configuration) {
    const style: CSSProperties = { position: 'absolute', left: 20, top: 64 };
    nodes.push(<NodeTools key={'nodeTools'} current={current} style={style} />);
  }
  nodes.push(<Operate key={'operateModal'} />);
  nodes.push(<TransferEntity key={'transfer'} />);
  return <>{nodes}</>;
};

interface IProps {
  current: ILink;
  style?: CSSProperties;
}

const NodeTools: React.FC<IProps> = ({ current, style }) => {
  const belong = current.directory.target as IBelong;
  return (
    <Space style={style}>
      <Button
        onClick={() =>
          openSelector(belong, (selected) => {
            linkCmd.emitter('graph', 'insertNode', selected);
          })
        }>
        插入节点
      </Button>
      <Button onClick={() => linkCmd.emitter('graph', 'center')}>中心</Button>
      <Button onClick={() => linkCmd.emitter('graph', 'executing')}>执行</Button>
    </Space>
  );
};

export const openSelector = (
  current: IBelong,
  finished: (selected: IEntity<XEntity>[]) => void,
  typeName?: ConfigColl | 'Form',
) => {
  let selected: IEntity<XEntity>[] = [];
  Modal.confirm({
    icon: <></>,
    width: 1000,
    content: (
      <Selector
        current={current}
        onChange={(entities) => (selected = entities)}
        loadItems={async (current: IDirectory) => {
          const ans: IEntity<XEntity>[] = [];
          const needs: string[] = [];
          const forms = await current.loadForms();
          await current.loadAllConfigs();
          if (typeName) {
            switch (typeName) {
              case 'Form':
                ans.push(...forms);
                break;
              default:
                needs.push(typeName);
                break;
            }
          } else {
            ans.push(...forms);
            needs.push(
              ConfigColl.Requests,
              ConfigColl.Scripts,
              ConfigColl.Mappings,
              ConfigColl.Stores,
              ConfigColl.Selections,
            );
          }
          current.configs.forEach((values, key) => {
            if (needs.indexOf(key) != -1) {
              ans.push(...values);
            }
          });
          return ans;
        }}
        treeNode={(node) => {
          return (
            <Space style={{ padding: 2 }}>
              {node.name}
              <PlusCircleOutlined
                onClick={(e) => {
                  linkCmd.emitter('entity', 'add', { curDir: node, cmd: 'newDir' });
                  e.stopPropagation();
                }}
              />
              <CloseCircleOutlined
                onClick={(e) => {
                  linkCmd.emitter('entity', 'delete', { entity: node });
                  e.stopPropagation();
                }}
              />
            </Space>
          );
        }}
        add={(curDir: IDirectory) => {
          return (
            <Dropdown
              menu={{
                items: [
                  { key: 'newRequest', label: '新增请求' },
                  { key: 'newExecutable', label: '新增脚本' },
                  { key: 'newMapping', label: '新增映射' },
                  { key: 'newSelection', label: '新增选择' },
                  { key: 'newWorkConfig', label: '新增事项配置' },
                  { key: 'newThingConfig', label: '新增实体配置' },
                ],
                onClick: (info) => {
                  linkCmd.emitter('entity', 'add', { curDir, cmd: info.key });
                },
              }}
              children={<Button style={{ marginTop: 10 }}>新增</Button>}
            />
          );
        }}
        update={(entity: IEntity<XEntity>) => {
          return (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Space>
                <Tag color="blue">{entity.typeName}</Tag>
                {entity.name}
              </Space>
              <Space>
                <Button
                  size="small"
                  onClick={() => {
                    linkCmd.emitter('entity', 'open', { entity });
                  }}>
                  编辑
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    linkCmd.emitter('entity', 'copy', { entity });
                  }}>
                  复制
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    linkCmd.emitter('entity', 'update', { entity });
                  }}>
                  更新
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    linkCmd.emitter('entity', 'delete', { entity });
                  }}>
                  删除
                </Button>
              </Space>
            </div>
          );
        }}
      />
    ),
    onOk: () => {
      finished(selected);
    },
  });
};

const TransferEntity = (): ReactNode => {
  const [entity, setEntity] = useState<IEntity<XEntity>>();
  const [cmd, setCmd] = useState<string>('');
  useEffect(() => {
    const id = linkCmd.subscribe((type, cmd, args) => {
      console.log(type, cmd, args);
      if (type != 'entity') return;
      switch (type) {
        case 'entity':
          switch (cmd) {
            case 'add': {
              const { curDir, cmd } = args;
              setEntity(curDir);
              setCmd(cmd);
              break;
            }
            case 'update': {
              const { entity } = args;
              setEntity(entity);
              switch (entity.typeName) {
                case '请求':
                  setCmd('updateRequest');
                  break;
                case '脚本':
                  setCmd('updateExecutable');
                  break;
                case '映射':
                  setCmd('updateMapping');
                  break;
                case '选择':
                  setCmd('updateSelection');
                  break;
                case '环境':
                  setCmd('updateEnvironment');
                  break;
                case '事项配置':
                  setCmd('updateWorkConfig');
                  break;
                case '实体配置':
                  setCmd('newThingConfig');
                  break;
              }
              break;
            }
            case 'copy': {
              const { entity } = args;
              Modal.confirm({
                title: '确认复制吗',
                onOk: async () => {
                  const file = entity as IFileInfo<XFileInfo>;
                  await file.directory.createConfig(
                    file.metadata.collName,
                    deepClone(file.metadata),
                  );
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
                  const file = entity as IFileInfo<XFileInfo>;
                  await file.delete();
                  finished();
                },
              });
              break;
            }
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
      linkCmd.unsubscribe(id);
    };
  });
  const finished = () => {
    linkCmd.emitter('selector', 'refresh');
    setEntity(undefined);
    setCmd('');
  };
  return (
    <>
      {entity && (cmd.startsWith('new') || cmd.startsWith('update')) && (
        <EntityForm cmd={cmd} entity={entity} finished={finished} />
      )}
      {entity && cmd == 'open' && (
        <OperateModal cmd={cmd} entity={entity} finished={finished} />
      )}
    </>
  );
};

interface OpenArgs {
  formId: string;
  call: Call;
}

interface SelArgs {
  selection: XSelection;
  data: any;
  call: Call;
}

type Call = (type: string, data?: any, message?: string) => void;

const Operate: React.FC<{}> = ({}) => {
  const [open, setOpen] = useState<boolean>();
  const [name, setName] = useState<string>();
  const [center, setCenter] = useState<ReactNode>(<></>);
  const data = useRef<any>();
  const call = useRef<Call>((_: string) => {});
  useEffect(() => {
    const id = linkCmd.subscribe(async (type, cmd, args) => {
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
              const selArgs = args as SelArgs;
              const dataSource = selArgs.data ?? [];
              const form = await loadForm(selArgs.selection.formId, selArgs.call);
              if (!form) return;
              setCenter(
                <Selection
                  key={'table'}
                  selection={selArgs.selection}
                  form={form}
                  dataSource={dataSource}
                  data={data}
                />,
              );
              setName(selArgs.selection.name);
              setOpen(true);
              call.current = selArgs.call;
              break;
          }
      }
    });
    return () => {
      linkCmd.unsubscribe(id);
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
          width={1000}>
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
  selection: XSelection;
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
