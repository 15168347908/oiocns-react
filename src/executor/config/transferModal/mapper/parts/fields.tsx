import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import { FieldModel } from '@/ts/base/model';
import { XSpeciesItem } from '@/ts/base/schema';
import { IForm, ISpecies } from '@/ts/core';
import { ShareIdSet, ShareSet } from '@/ts/core/public/entity';
import { IMapping } from '@/ts/core/thing/transfer/config';
import { Radio, Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import cls from './../index.module.less';
import { Command } from '@/ts/base';

interface IProps {
  current: IMapping;
  target: 'source' | 'target';
  cmd: Command;
}

const Fields: React.FC<IProps> = ({ current, target, cmd }) => {
  const id = current.metadata[target];
  const type = current.metadata.type;
  const [fields, setFields] = useState<FieldModel[]>([]);
  const [items, setItems] = useState<XSpeciesItem[]>([]);
  const [initial, setInitial] = useState<boolean>(true);
  useEffect(() => {
    const subscribeId = current.subscribe(() => {
      const used = new Set(current.metadata.mappings.map((item) => item[target]));
      switch (type) {
        case 'fields':
          if (ShareSet.has(id)) {
            const form = ShareSet.get(id) as IForm;
            if (initial) {
              form.loadContent().then(() => {
                setFields(form.fields.filter((field) => !used.has(field.id)));
                setInitial(false);
                cmd.emitter('fields', 'refresh');
              });
            } else {
              setFields(form.fields.filter((field) => !used.has(field.id)));
            }
          }
          break;
        case 'specieItems':
          if (ShareSet.has(id)) {
            const species = ShareSet.get(id) as ISpecies;
            if (initial) {
              species.loadContent().then(() => {
                setItems(species.items.filter((item) => !used.has(item.id)));
                setInitial(false);
              });
            } else {
              setItems(species.items.filter((item) => !used.has(item.id)));
            }
          }
          break;
      }
    });
    return () => {
      current.unsubscribe(subscribeId);
    };
  }, [current]);
  return (
    <div className={cls['flex-column']}>
      <div>
        <EntityIcon entity={ShareIdSet.get(id)} showName />
      </div>
      <div className={cls['fields']}>
        <Radio.Group buttonStyle="outline">
          <Space direction="vertical">
            {type == 'fields' &&
              fields.map((item, index) => (
                <Radio
                  className={cls['field']}
                  value={item}
                  onClick={() => {
                    current[target] = { index, item };
                    current.changCallback();
                  }}>
                  <Space>
                    <Tag color="cyan">{item.valueType}</Tag>
                    {item.name}
                  </Space>
                </Radio>
              ))}
            {type == 'specieItems' &&
              items.map((item, index) => (
                <Radio
                  className={cls['field']}
                  value={item}
                  onClick={() => {
                    current[target] = { index, item };
                    current.changCallback();
                  }}>
                  <Space>
                    {item.info}
                    {item.name}
                  </Space>
                </Radio>
              ))}
          </Space>
        </Radio.Group>
      </div>
    </div>
  );
};

export default Fields;
