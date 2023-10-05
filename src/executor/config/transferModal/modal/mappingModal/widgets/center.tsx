import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import { model, schema } from '@/ts/base';
import { ITransfer } from '@/ts/core';
import { ShareIdSet } from '@/ts/core/public/entity';
import { Button, Space, Table, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import cls from './../index.module.less';

interface IProps {
  transfer: ITransfer;
  current: model.Mapping;
}

type MappingType = { source?: schema.XAttribute; target?: schema.XAttribute };

const Center: React.FC<IProps> = ({ transfer, current }) => {
  const [mappings, setMappings] = useState<model.SubMapping[]>(current.mappings);
  const dataMap = useRef<Map<string, schema.XAttribute>>(new Map());
  const choosing = useRef<MappingType>({ source: undefined, target: undefined });
  const setDataMap = (target: 'source' | 'target') => {
    if (ShareIdSet.has(current[target])) {
      const form = ShareIdSet.get(current[target]) as schema.XForm;
      form.attributes.forEach((item) => dataMap.current.set(item.id, item));
    }
  };
  setDataMap('source');
  setDataMap('target');
  useEffect(() => {
    const cmdId = transfer.command.subscribe(async (type, cmd, args) => {
      if (type != 'fields') return;
      switch (cmd) {
        case 'refresh':
          setMappings([...current.mappings]);
          break;
        case 'choose':
          const pos = args[0] as 'source' | 'target';
          choosing.current[pos] = args[1];
          if (choosing.current.source && choosing.current.target) {
            const finished = async (mapping: model.SubMapping) => {
              current.mappings.unshift(mapping);
              await transfer.updNode(current);
            };
            const clear = () => {
              transfer.command.emitter('fields', 'clear');
              transfer.command.emitter('fields', 'refresh');
            };
            const source = choosing.current.source;
            const target = choosing.current.target;
            if (source?.property?.valueType != target?.property?.valueType) {
              message.warning('字段类型必须相同！');
              clear();
              return;
            }
            await finished({
              source: choosing.current.source.id,
              target: choosing.current.target.id,
            });
            clear();
          }
          break;
        case 'clear':
          choosing.current.source = undefined;
          choosing.current.target = undefined;
          break;
      }
    });
    return () => {
      transfer.command.unsubscribe(cmdId);
    };
  }, [current]);
  return (
    <div style={{ flex: 2 }} className={cls['flex-column']}>
      <EntityIcon entityId={'映射关系'} showName />
      <Table
        style={{ width: '100%' }}
        dataSource={mappings}
        columns={[
          {
            title: '原字段',
            dataIndex: 'source',
            width: '40%',
            render: (value) => {
              const item = dataMap.current.get(value);
              return (
                <Space>
                  {item?.property?.info}
                  {item?.name}
                </Space>
              );
            },
          },
          {
            title: '目标字段',
            dataIndex: 'target',
            width: '40%',
            render: (value) => {
              const item = dataMap.current.get(value);
              return (
                <Space>
                  {item?.property?.info}
                  {item?.name}
                </Space>
              );
            },
          },
          {
            title: '操作',
            dataIndex: 'action',
            render: (_v, _, index) => {
              return (
                <Space align={'center'}>
                  <Button
                    type="primary"
                    size="small"
                    onClick={async () => {
                      current.mappings.splice(index, 1);
                      await transfer.updNode(current);
                      transfer.command.emitter('fields', 'refresh');
                    }}>
                    删除
                  </Button>
                </Space>
              );
            },
          },
        ]}
      />
    </div>
  );
};

export default Center;
