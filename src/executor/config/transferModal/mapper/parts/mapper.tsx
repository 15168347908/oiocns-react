import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import { XAttribute, XForm, XMapping } from '@/ts/base/schema';
import { IMapping } from '@/ts/core/thing/config';
import { DndContext } from '@dnd-kit/core';
import { Col, Layout, Row } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import React, { useEffect, useState } from 'react';
import * as im from 'react-icons/im';
import cls from './../index.module.less';
import Draggable from './draggable';
import Field from './field';

interface IProps {
  current: IMapping;
}

const Mapper: React.FC<IProps> = ({ current }) => {
  const [sourceForm, setSourceForm] = useState<XForm>(current.metadata.sourceForm);
  const [targetForm, setTargetForm] = useState<XForm>(current.metadata.targetForm);
  const [sourceAttrs, setSourceAttrs] = useState<XAttribute[]>(
    current.metadata.sourceForm.attributes ?? [],
  );
  const [targetAttrs, setTargetAttrs] = useState<XAttribute[]>(
    current.metadata.targetForm.attributes ?? [],
  );
  const [mappings, setMappings] = useState<
    {
      sourceAttr?: XAttribute;
      targetAttr?: XAttribute;
      options?: { [key: string]: string };
    }[]
  >(current.metadata.mappings ?? []);
  useEffect(() => {
    const id = current.subscribe(() => {
      setSourceForm(current.metadata.sourceForm);
      setTargetForm(current.metadata.targetForm);
      setSourceAttrs(current.metadata.sourceForm.attributes ?? []);
      setTargetAttrs(current.metadata.targetForm.attributes ?? []);
      setMappings(current.metadata.mappings ?? []);
    });
    return () => {
      current.unsubscribe(id);
    };
  }, [current]);
  return (
    <Layout className={cls.layout}>
      <Content className={cls.content}>
        <Row>
          <Col span={12} style={{ display: 'flex', justifyContent: 'center' }}>
            <EntityIcon entity={sourceForm} showName />
          </Col>
          <Col span={12} style={{ display: 'flex', justifyContent: 'center' }}>
            <EntityIcon entity={targetForm} showName />
          </Col>
        </Row>
        <Row className={cls['mapping-body']}>
          <Col span={10}>
            <div className={cls['mapping-content']}>
              {sourceAttrs.map((attr, index) => {
                console.log(attr, index);
                return (
                  <Field
                    attr={attr}
                    operate={
                      <im.ImArrowRight
                        onClick={() => {
                          current.metadata.sourceForm.attributes?.splice(index, 1);
                          const has = current.metadata.mappings.find(
                            (item) => !item.sourceAttr,
                          );
                          if (has) {
                            has.sourceAttr = attr;
                          } else {
                            current.metadata.mappings.push({ sourceAttr: attr });
                          }
                          current.refresh(current.metadata);
                        }}
                      />
                    }
                  />
                );
              })}
            </div>
          </Col>
          <Col span={4}>
            <DndContext>
              <div className={cls['mapping-content']}>
                {mappings.map((item, index) => {
                  return (
                    <Draggable
                      node={
                        item.sourceAttr ? (
                          <Field
                            attr={item.sourceAttr}
                            operate={
                              <im.ImArrowLeft
                                onClick={() => {
                                  const row = current.metadata.mappings[index];
                                  if (!row.targetAttr) {
                                    current.metadata.mappings.splice(index, 1);
                                  } else {
                                    row.sourceAttr = undefined;
                                    row.options = undefined;
                                  }
                                  current.refresh(current.metadata);
                                }}
                              />
                            }
                          />
                        ) : (
                          <></>
                        )
                      }
                    />
                  );
                })}
              </div>
            </DndContext>
            <DndContext>
              <div className={cls['mapping-content']}>
                {mappings.map((item, index) => {
                  return (
                    <Draggable
                      node={
                        item.targetAttr ? (
                          <Field
                            attr={item.targetAttr}
                            operate={
                              <im.ImArrowRight
                                onClick={() => {
                                  const row = current.metadata.mappings[index];
                                  if (!row.sourceAttr) {
                                    current.metadata.mappings.splice(index, 1);
                                  } else {
                                    row.targetAttr = undefined;
                                    row.options = undefined;
                                  }
                                  current.refresh(current.metadata);
                                }}
                              />
                            }
                          />
                        ) : (
                          <></>
                        )
                      }
                    />
                  );
                })}
              </div>
            </DndContext>
          </Col>
          <Col span={10}>
            <div className={cls['mapping-content']}>
              {targetAttrs.map((attr, index) => {
                return (
                  <Field
                    key={attr.id}
                    attr={attr}
                    operate={
                      <im.ImArrowRight
                        onClick={() => {
                          current.metadata.sourceForm.attributes?.splice(index, 1);
                          const has = current.metadata.mappings.find(
                            (item) => !item.sourceAttr,
                          );
                          if (has) {
                            has.sourceAttr = attr;
                          } else {
                            current.metadata.mappings.push({ sourceAttr: attr });
                          }
                          current.refresh(current.metadata);
                        }}
                      />
                    }
                  />
                );
              })}
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Mapper;
