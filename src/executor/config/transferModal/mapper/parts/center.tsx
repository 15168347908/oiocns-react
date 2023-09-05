import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import { FieldModel } from '@/ts/base/model';
import { IDirectory } from '@/ts/core';
import { IMapping } from '@/ts/core/thing/config';
import { Button, Col, Modal, Row, Space, Tag, TreeSelect, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { defaultGenLabel, expand, loadMappingsMenu } from '../..';
import cls from './../index.module.less';
interface IProps {
  current: IMapping;
}

interface Mapping {
  source: string;
  target: string;
  mappingId?: string; // 字典/分类映射
}

const Center: React.FC<IProps> = ({ current }) => {
  const [mappings, setMappings] = useState<Mapping[]>(current.metadata.mappings);
  useEffect(() => {
    const id = current.subscribe(() => {
      if (current.source && current.target) {
        if (current.typeName == 'fields') {
          const source = current.source.item as FieldModel;
          const target = current.target.item as FieldModel;
          if (source.valueType != target.valueType) {
            message.warning('字段类型必须相同！');
            current.clear();
            return;
          }
          const finished = (mapping: Mapping) => {
            current.metadata.mappings.unshift(mapping);
            current.clear();
            current.refresh(current.metadata);
          };
          if (['选择型', '分类型'].indexOf(source.valueType) != -1) {
            openSelector({
              current: current.directory.target.directory,
              finished: (mappingId) => {
                finished({
                  source: source.id,
                  target: target.id,
                  mappingId: mappingId,
                });
              },
            });
            return;
          }
          finished({
            source: source.id,
            target: target.id,
          });
        }
      }
      setMappings([...current.metadata.mappings]);
    });
    return () => {
      current.clear();
      current.unsubscribe(id);
    };
  }, [current]);
  return (
    <div className={cls['flex-column']}>
      <div>
        <EntityIcon entityId={'映射关系'} showName />
      </div>
      <div className={cls['center']}>
        {mappings.map((item, index) => (
          <Row style={{ width: '100%', height: 50 }} align={'middle'}>
            <Col flex={8} style={{ textAlign: 'right' }}>
              {item.sourceAttr.name}
            </Col>
            <Col span={8} style={{ textAlign: 'center' }}>
              <Space align={'center'}>
                <Tag color="processing">{`--${item.targetAttr.property?.valueType}->`}</Tag>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => {
                    current.metadata.sourceAttrs.unshift(item.sourceAttr);
                    current.metadata.targetAttrs.unshift(item.targetAttr);
                    current.metadata.mappings.splice(index, 1);
                    current.changCallback();
                  }}>
                  删除
                </Button>
              </Space>
            </Col>
            <Col span={8} style={{ textAlign: 'left' }}>
              {item.targetAttr.name}
            </Col>
          </Row>
        ))}
      </div>
    </div>
  );
};

interface SelectProps {
  current: IDirectory;
  finished: (mappingId: string | undefined) => void;
}

const openSelector = ({ current, finished }: SelectProps) => {
  let mappingId: string | undefined = undefined;
  const treeData = [
    loadMappingsMenu(current, (entity) => {
      return defaultGenLabel(entity, ['映射']);
    }),
  ];
  const modal = Modal.confirm({
    okText: '确认',
    cancelText: '取消',
    title: '选择字典/分类映射',
    content: (
      <TreeSelect
        fieldNames={{
          label: 'node',
          value: 'key',
          children: 'children',
        }}
        dropdownStyle={{ maxHeight: 400, overflow: 'auto', minWidth: 300 }}
        treeData={treeData}
        treeDefaultExpandedKeys={expand(treeData, ['映射'])}
        placement="bottomRight"
        onSelect={(value) => (mappingId = value)}
      />
    ),
    onOk: () => {
      finished(mappingId);
      modal.destroy();
    },
    onCancel: () => {
      modal.destroy();
    },
  });
};

export default Center;
