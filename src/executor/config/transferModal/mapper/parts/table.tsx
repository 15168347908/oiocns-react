import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import MappingForm from '@/executor/config/entityForm/mappingForm';
import orgCtrl, { Controller } from '@/ts/controller';
import { IDirectory } from '@/ts/core';
import { IMapping } from '@/ts/core/thing/config';
import { ProTable } from '@ant-design/pro-components';
import { Button, Modal, Space } from 'antd';
import React, { useEffect, useState } from 'react';

interface IProps {
  current: IDirectory;
  ctrl: Controller;
}

const getMappings = (current: IDirectory) => {
  return current.configs
    .filter((item) => item.typeName == '映射')
    .map((item) => item as IMapping);
};

const MappingTable: React.FC<IProps> = ({ current, ctrl }) => {
  const [selectedMappings, setSelectedMappings] = useState<IMapping[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [data, setData] = useState<readonly IMapping[]>(getMappings(current));
  useEffect(() => {
    const id = ctrl.subscribe(() => {
      setSelectedMappings([]);
      setData(getMappings(current));
    });
    return () => {
      ctrl.unsubscribe(id);
    };
  });
  return (
    <>
      <ProTable<IMapping>
        dataSource={data}
        search={false}
        cardProps={{ bodyStyle: { padding: 0 } }}
        scroll={{ y: 300 }}
        columns={[
          {
            title: '序号',
            valueType: 'index',
          },
          {
            title: '源表单',
            dataIndex: 'sourceName',
            render: (_: any, record: IMapping) => (
              <EntityIcon
                entityId={record.metadata.sourceForm.icon}
                entity={record.metadata.sourceForm}
                showName
              />
            ),
          },
          {
            title: '目标表单',
            dataIndex: 'targetName',
            render: (_: any, record: IMapping) => (
              <EntityIcon
                entityId={record.metadata.targetForm.icon}
                entity={record.metadata.targetForm}
                showName
              />
            ),
          },
          {
            title: '映射字段',
            render: (_, entity) => {
              entity;
              return <span>已映射 {entity.metadata.mappings?.length ?? 0} 个字段</span>;
            },
          },
          {
            title: '备注',
            dataIndex: 'remark',
          },
        ]}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedMappings(selectedRows);
          },
        }}
        toolBarRender={() => {
          return [
            <Space>
              <Button onClick={() => setOpen(true)}>新增</Button>
              <Button
                onClick={() => {
                  Modal.confirm({
                    title: '确认删除？',
                    onOk: async () => {
                      const mappings = getMappings(current);
                      for (const mapping of mappings) {
                        for (const selectedMapping of selectedMappings) {
                          if (selectedMapping.id == mapping.id) {
                            await mapping.delete();
                          }
                        }
                      }
                      ctrl.changCallback();
                      orgCtrl.changCallback();
                    },
                  });
                }}>
                删除
              </Button>
            </Space>,
          ];
        }}
      />
      {open && (
        <MappingForm
          current={current}
          finished={() => {
            setData(getMappings(current));
            setOpen(false);
          }}
          cancel={() => {
            setOpen(false);
          }}
        />
      )}
    </>
  );
};

export default MappingTable;
