import OioForm from '@/components/Common/FormDesign/OioFormNext';
import { linkCmd } from '@/ts/base/common/command';
import { XEntity, XSelection } from '@/ts/base/schema';
import { IBelong, IDirectory, IEntity, IForm } from '@/ts/core';
import { ShareSet } from '@/ts/core/public/entity';
import { CollMap, ConfigColl, ILink } from '@/ts/core/thing/config';
import { Button, Modal, Space, Tag } from 'antd';
import React, { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import Selector from '../../selector';
import { Retention } from '../index';
import { Environments } from './environments';
import ProTable from '@ant-design/pro-table';
import EntityForm from '@/executor/config/entityForm';
import OperateModal from '@/executor/config/operateModal';

interface ToolProps {
  current: ILink;
  retention: Retention;
}

export const ToolBar: React.FC<ToolProps> = ({
  current,
  retention = Retention.Configuration,
}) => {
  const nodes: ReactNode[] = [];
  const style: CSSProperties = { position: 'absolute', right: 10, top: 10 };
  nodes.push(<Environments key={'environments'} style={style} />);
  if (retention == Retention.Configuration) {
    const style: CSSProperties = { position: 'absolute', left: 10, top: 10 };
    nodes.push(<NodeTools key={'nodeTools'} current={current} style={style} />);
  }
  nodes.push(<Operate key={'operateModal'} />);
  nodes.push(<TransferEntity></TransferEntity>);
  return <>{nodes}</>;
};

interface IProps {
  current: ILink;
  style?: CSSProperties;
}

const NodeTools: React.FC<IProps> = ({ current, style }) => {
  const onClick = (collName: ConfigColl | 'Form') => {
    let selected: IEntity<XEntity>[] = [];
    Modal.confirm({
      icon: <></>,
      width: 1000,
      content: (
        <Selector
          current={current.directory.target as IBelong}
          onChange={(files) => (selected = files)}
          loadItems={async (current: IDirectory) => {
            switch (collName) {
              case 'Form':
                return await current.loadForms();
              default:
                return await current.loadConfigs(collName);
            }
          }}
          treeNode={(directory) => {
            const children: ReactNode[] = [];
            switch (collName) {
              case 'Form':
                children.push(<Tag color="blue">表单</Tag>);
                break;
              default:
                const name = CollMap[collName as ConfigColl];
                children.push(<Tag color="blue">{name}</Tag>);
                break;
            }
            return (
              <Space align="center">
                {directory.name}
                {children}
              </Space>
            );
          }}
          add={(curDir: IDirectory) => (
            <Button
              style={{ marginTop: 10 }}
              onClick={() => linkCmd.emitter('entity', 'add', { curDir, collName })}>
              新增
            </Button>
          )}
          update={(entity: IEntity<XEntity>) => {
            return (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {entity.name}
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
                      linkCmd.emitter('entity', 'update', { entity, collName });
                    }}>
                    更新
                  </Button>
                </Space>
              </div>
            );
          }}
        />
      ),
      onOk: () => {
        linkCmd.emitter('graph', 'insertNode', selected);
      },
    });
  };
  return (
    <Space style={style}>
      <Button onClick={() => onClick('Form')}>插入 Form</Button>
      <Button onClick={() => onClick(ConfigColl.Requests)}>插入 Request</Button>
      <Button onClick={() => onClick(ConfigColl.Scripts)}>插入 Script</Button>
      <Button onClick={() => onClick(ConfigColl.Mappings)}>插入 Mapping</Button>
      <Button onClick={() => onClick(ConfigColl.Selections)}>插入 Selection</Button>
      <Button onClick={() => linkCmd.emitter('graph', 'executing')}>执行</Button>
    </Space>
  );
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
              const { curDir, collName } = args;
              setEntity(curDir);
              switch (collName) {
                case ConfigColl.Requests:
                  setCmd('newRequest');
                  break;
                case ConfigColl.Scripts:
                  setCmd('newExecutable');
                  break;
                case ConfigColl.Mappings:
                  setCmd('newMapping');
                  break;
                case ConfigColl.Selections:
                  setCmd('newSelection');
                  break;
                case 'Form':
                  setCmd('newWorkConfig');
                  break;
              }
              break;
            }
            case 'update': {
              const { entity, collName } = args;
              setEntity(entity);
              switch (collName) {
                case ConfigColl.Requests:
                  setCmd('updateRequest');
                  break;
                case ConfigColl.Scripts:
                  setCmd('updateExecutable');
                  break;
                case ConfigColl.Mappings:
                  setCmd('updateMapping');
                  break;
                case ConfigColl.Selections:
                  setCmd('updateSelection');
                  break;
                case 'Form':
                  setCmd('updateWorkConfig');
                  break;
              }
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
