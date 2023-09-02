import OioForm from '@/components/Common/FormDesign/OioFormNext';
import { linkCmd } from '@/ts/base/common/command';
import { XEntity } from '@/ts/base/schema';
import { IBelong, IDirectory, IEntity, IForm } from '@/ts/core';
import { ShareSet } from '@/ts/core/public/entity';
import { ConfigColl, ILink } from '@/ts/core/thing/config';
import { Button, Modal, Space } from 'antd';
import React, { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import Selector from '../../selector';
import { Retention } from '../index';
import { Environments } from './environments';
import ProTable from '@ant-design/pro-table';

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
  nodes.push(<OperateModal key={'formInput'} />);
  return <>{nodes}</>;
};

interface IProps {
  current: ILink;
  style?: CSSProperties;
}

const NodeTools: React.FC<IProps> = ({ current, style }) => {
  const onClick = (collName: string) => {
    let selected: IEntity<XEntity>[] = [];
    Modal.confirm({
      icon: <></>,
      width: 800,
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
        />
      ),
      onOk: () => {
        linkCmd.emitter('main', 'insertEntity', selected);
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
      <Button onClick={() => linkCmd.emitter('main', 'executing')}>执行</Button>
    </Space>
  );
};

interface OpenArgs {
  formId: string;
  data?: any[];
  call: Call;
}

type Call = (type: string, data?: any, message?: string) => void;

const OperateModal: React.FC<{}> = ({}) => {
  const [open, setOpen] = useState<boolean>();
  const [form, setForm] = useState<IForm>();
  const [content, setContent] = useState<ReactNode>(<></>);
  const formData = useRef<Record<string, any>>({});
  const call = useRef<Call>((_: string) => {});
  useEffect(() => {
    const id = linkCmd.subscribe(async (type, cmd, args) => {
      if (['form', 'selection'].indexOf(type) == -1) {
        return;
      }
      const openArgs = args as OpenArgs;
      const form = ShareSet.get(openArgs.formId) as IForm;
      if (!form) {
        openArgs.call('错误', undefined, '未获取到表单信息！');
        return;
      }
      await form.loadContent();
      formData.current = {};
      switch (type) {
        case 'form':
          switch (cmd) {
            case 'open':
              setContent(<InputForm form={form} formData={formData.current} />);
              setForm(form);
              setOpen(true);
              call.current = openArgs.call;
              break;
          }
          break;
        case 'selection':
          switch (cmd) {
            case 'open':
              setContent(<SelectionTable form={form} data={openArgs.data ?? []} />);
              setForm(form);
              setOpen(true);
              call.current = openArgs.call;
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
          title={form!.name}
          onOk={() => {
            call.current('成功', formData.current);
            setOpen(false);
          }}
          onCancel={() => {
            call.current('取消', undefined, '已取消输入');
            setOpen(false);
          }}
          destroyOnClose={true}
          cancelText={'关闭'}
          width={1000}>
          {content}
        </Modal>
      )}
    </>
  );
};

interface FormProps {
  form: IForm;
  formData: Record<string, any>;
}

const InputForm: React.FC<FormProps> = ({ form, formData }) => {
  return (
    <OioForm
      form={form.metadata}
      fields={form.fields}
      belong={form.directory.target as IBelong}
      onValuesChange={(_, values) => {
        for (const key in values) {
          for (const field of form!.fields) {
            if (field.id == key) {
              formData.current[field.code] = values[key];
            }
          }
        }
      }}
    />
  );
};

interface SelectionProps {
  form: IForm;
  data: any[];
}

const SelectionTable: React.FC<SelectionProps> = ({ form, data }) => {
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>();
  return (
    <ProTable<any>
      dataSource={data}
      search={false}
      cardProps={{ bodyStyle: { padding: 0 } }}
      scroll={{ y: 300 }}
      columns={[]}
      rowSelection={{
        selectedRowKeys: selectedKeys,
        onChange: setSelectedKeys,
      }}
    />
  );
};
