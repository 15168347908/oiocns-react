import React, { useEffect, useState } from 'react';
import cls from './../index.module.less';
import { IMapping } from '@/ts/core/thing/config';
import { XAttribute, XSpeciesItem } from '@/ts/base/schema';
import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import { Radio, Space, Tag } from 'antd';
import { ShareIdSet, ShareSet } from '@/ts/core/public/entity';
import { IForm, ISpecies } from '@/ts/core';
import { FieldModel } from '@/ts/base/model';

interface IProps {
  current: IMapping;
  target: 'source' | 'target';
}

const Fields: React.FC<IProps> = ({ current, target }) => {
  const id = current.metadata[target];
  const type = current.metadata.type;
  const [selected, setSelected] = useState<XAttribute>();
  const [fields, setFields] = useState<FieldModel[]>([]);
  const [items, setItems] = useState<XSpeciesItem[]>([]);
  const [initial, setInitial] = useState<boolean>(true);
  useEffect(() => {
    const subscribeId = current.subscribe(() => {
      const used = new Set(current.metadata.mappings.map((item) => item[target]));
      setSelected(undefined);
      switch (type) {
        case 'fields':
          if (ShareSet.has(id)) {
            const form = ShareSet.get(id) as IForm;
            if (initial) {
              form.loadContent().then(() => {
                setFields(form.fields);
                setInitial(false);
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
                setItems(species.items);
                setInitial(false);
              });
            } else {
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
        <Radio.Group
          value={selected}
          buttonStyle="outline"
          onChange={(e) => setSelected(e.target.value)}>
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
                  }}
                />
              ))}
          </Space>
        </Radio.Group>
      </div>
    </div>
  );
};

export default Fields;
