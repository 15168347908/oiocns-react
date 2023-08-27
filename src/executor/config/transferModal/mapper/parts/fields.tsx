import React, { useEffect, useState } from 'react';
import cls from './../index.module.less';
import { IMapping } from '@/ts/core/thing/config';
import { XAttribute } from '@/ts/base/schema';
import * as im from 'react-icons/im';
import EntityIcon from '@/components/Common/GlobalComps/entityIcon';

interface IProps {
  current: IMapping;
  targetAttrs: 'sourceAttrs' | 'targetAttrs';
  targetAttr: 'sourceAttr' | 'targetAttr';
}

const Fields: React.FC<IProps> = ({ current, targetAttrs, targetAttr }) => {
  const [attrs, setAttrs] = useState<XAttribute[]>(current.metadata[targetAttrs]);
  useEffect(() => {
    const id = current.subscribe(() => {
      console.log(current.metadata);
      setAttrs([...current.metadata[targetAttrs]]);
    });
    return () => {
      current.unsubscribe(id);
    };
  }, [current]);
  return (
    <div>
      <div>
        <EntityIcon entity={current.metadata.sourceForm} showName />
      </div>
      <div>
        {attrs.map((attr, index) => (
          <div>
            <div>{attr.name}</div>
            <im.ImArrowRight
              onClick={() => {
                current.metadata[targetAttrs].splice(index, 1);
                const hasEmpty = current.metadata.mappings.find(
                  (item) => !item[targetAttr],
                );
                if (hasEmpty) {
                  hasEmpty[targetAttr] = attr;
                } else {
                  current.metadata.mappings.push({ [targetAttr]: attr });
                }
                current.refresh(current.metadata);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Fields;
