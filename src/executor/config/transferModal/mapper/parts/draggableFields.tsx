import { DndContext } from '@dnd-kit/core';
import React, { useEffect, useState } from 'react';
import Draggable from './draggable';
import { IMapping } from '@/ts/core/thing/config';
import { XAttribute } from '@/ts/base/schema';
import cls from './../index.module.less';
import * as im from 'react-icons/im';

interface IProps {
  current: IMapping;
  targetAttrs: 'sourceAttrs' | 'targetAttrs';
  targetAttr: 'sourceAttr' | 'targetAttr';
}

const DraggableFields: React.FC<IProps> = ({ current, targetAttrs, targetAttr }) => {
  const [attrs, setAttrs] = useState<(XAttribute | undefined)[]>(
    current.metadata.mappings.map((item) => item[targetAttr]),
  );
  useEffect(() => {
    const id = current.subscribe(() => {
      setAttrs(current.metadata.mappings.map((item) => item[targetAttr]));
    });
    return () => {
      current.unsubscribe(id);
    };
  }, [current]);
  return (
    <DndContext>
      {attrs.map((item, index) => {
        return (
          <Draggable
            children={
              item ? (
                <div>
                  <div>{item.name}</div>
                  <im.ImArrowLeft
                    onClick={() => {
                      const row = current.metadata.mappings[index];
                      if (!row.sourceAttr && !row.targetAttr) {
                        current.metadata.mappings.splice(index, 1);
                      } else {
                        row[targetAttr] = undefined;
                        row.options = undefined;
                      }
                      current.metadata[targetAttrs].unshift(item);
                      current.refresh(current.metadata);
                    }}
                  />
                </div>
              ) : (
                <></>
              )
            }
          />
        );
      })}
    </DndContext>
  );
};

export default DraggableFields;
