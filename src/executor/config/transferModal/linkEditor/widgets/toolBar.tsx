import OioForm from '@/components/Common/FormDesign/OioFormNext';
import EntityForm from '@/executor/config/entityForm';
import OperateModal from '@/executor/config/operateModal';
import { deepClone } from '@/ts/base/common';
import { linkCmd } from '@/ts/base/common/command';
import { XEntity, XFileInfo, XSelection } from '@/ts/base/schema';
import { IBelong, IDirectory, IEntity, IFileInfo, IForm } from '@/ts/core';
import { ShareSet } from '@/ts/core/public/entity';
import { CollMap, ConfigColl, ILink } from '@/ts/core/thing/config';
import { CloseCircleOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { Button, Dropdown, Modal, Space, Tag } from 'antd';
import React, { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import Selector from '../../selector';
import { Retention } from '../index';
import { Environments } from './environments';

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
  nodes.push(<Transfer key={'transfer'} />);
  nodes.push(<OpenOperate key={'openOperate'} />);
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

interface EntityProps {
  curDir: IDirectory;
  types?: string[];
  size?: 'small' | 'middle' | 'large';
  style?: CSSProperties;
}

export const NewEntity: React.FC<EntityProps> = ({
  curDir,
  types,
  size,
  style,
}): ReactNode => {
  types = types?.map((item) => '新增' + item);
  return (
    <Dropdown
      menu={{
        items: [
          { key: 'newDir', label: '新增目录' },
          { key: 'newRequest', label: '新增请求' },
          { key: 'newExecutable', label: '新增脚本' },
          { key: 'newMapping', label: '新增映射' },
          { key: 'newSelection', label: '新增选择' },
          { key: 'newEnvironment', label: '新增环境' },
          { key: 'newWorkConfig', label: '新增事项配置' },
          { key: 'newThingConfig', label: '新增实体配置' },
        ].filter(
          (item) => !types || types.length == 0 || types.indexOf(item.label) != -1,
        ),
        onClick: (info) => {
          linkCmd.emitter('entity', 'add', { curDir, cmd: info.key });
        },
      }}
      children={
        <Button size={size} style={style}>
          新增
        </Button>
      }
    />
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
        treeNode={(node, cur) => {
          return (
            <Space style={{ padding: 2 }}>
              {node.name}
              {node.id == cur?.id ? <Tag color="blue">当前</Tag> : ''}
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
            <NewEntity
              curDir={curDir}
              style={{ marginTop: 10 }}
              types={typeName ? [CollMap[typeName]] : []}
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

const Transfer = (): ReactNode => {
  const [entities, setEntities] = useState<{ [key: string]: IEntity<XEntity> }>({});
  const [commands, setCommands] = useState<{ [key: string]: string }>({});
  useEffect(() => {
    const id = linkCmd.subscribe((type, cmd, args) => {
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
                事项配置: 'updateWorkConfig',
                实体配置: 'newThingConfig',
              };
              setCommands({ ...commands, [entity.id]: mapping[entity.typeName] });
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
          }
          break;
      }
    });
    return () => {
      linkCmd.unsubscribe(id);
    };
  });
  const finished = (id?: string) => {
    linkCmd.emitter('selector', 'refresh');
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
        return (
          <EntityForm
            cmd={commands[entry[0]]}
            entity={entry[1]}
            finished={() => {
              finished(entry[0]);
            }}
          />
        );
      })}
    </>
  );
};

const OpenOperate = (): ReactNode => {
  const [entity, setEntity] = useState<IEntity<XEntity>>();
  const [cmd, setCmd] = useState<string>('');
  useEffect(() => {
    const id = linkCmd.subscribe((type, cmd, args) => {
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
      linkCmd.unsubscribe(id);
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
