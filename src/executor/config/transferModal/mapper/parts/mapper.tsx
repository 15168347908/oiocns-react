import { XAttribute, XForm, XMapping } from '@/ts/base/schema';
import { IBelong } from '@/ts/core';
import { IMapping } from '@/ts/core/thing/config';
import { Col, Layout, Row } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import React, { useEffect, useRef, useState } from 'react';
import cls from './../index.module.less';
import Form from './meta';
import Fields from './fields';
import { DndContext } from '@dnd-kit/core';
import Draggable from './draggable';
import Field from './field';
import * as im from 'react-icons/im';
import { Controller } from '@/ts/controller';

interface IProps {
  current?: IMapping;
  belong: IBelong;
  status: 'edit' | 'view';
}

const Mapper: React.FC<IProps> = ({ current, belong }) => {
  // const [mapping, setMapping] = useState<XMapping>(metadata.current);
  // useEffect(() => {
  //   const id = ctrl.current.subscribe(() => {
  //     setMapping(metadata.current);
  //   });
  //   return () => {
  //     ctrl.current.unsubscribe(id);
  //   };
  // });
  // return (
  //   <Layout className={cls.layout}>
  //     <Content className={cls.content}>
  //       <Row>
  //         <Col span={12}>
  //           <Form
  //             onChange={(form: XForm) => {
  //               metadata.current.sourceForm = form;
  //               ctrl.current.changCallback();
  //             }}
  //             belong={belong}
  //             typeName={'源对象'}></Form>
  //         </Col>
  //         <Col span={12}>
  //           <Form
  //             onChange={(form: XForm) => {
  //               metadata.current.targetForm = form;
  //               ctrl.current.changCallback();
  //             }}
  //             belong={belong}
  //             typeName={'目标对象'}></Form>
  //         </Col>
  //       </Row>
  //       <Row className={cls['mapping-body']}>
  //         <Col span={10}>
  //           {mapping && (
  //             <Fields
  //               attrs={mapping.sourceForm?.attributes ?? []}
  //               node={(attr: XAttribute | undefined, index: number) => {
  //                 return (
  //                   <Field
  //                     attr={attr!}
  //                     operate={
  //                       <im.ImArrowRight
  //                         onClick={() => {
  //                           metadata.current.sourceForm?.attributes?.splice(index, 1);
  //                           const has = current?.metadata.mappings.find(
  //                             (item) => !item.sourceAttr,
  //                           );
  //                           if (has) {
  //                             has.sourceAttr = attr;
  //                           } else {
  //                             current?.metadata.mappings?.push({ sourceAttr: attr });
  //                           }
  //                           ctrl.current.changCallback();
  //                         }}
  //                       />
  //                     }
  //                   />
  //                 );
  //               }}
  //             />
  //           )}
  //         </Col>
  //         <Col span={4}>
  //           <DndContext>
  //             <Fields
  //               attrs={metadata.current.mappings.map((item) => item.sourceAttr) ?? []}
  //               node={(attr: XAttribute | undefined, index: number) => {
  //                 return (
  //                   <Draggable
  //                     node={
  //                       attr ? (
  //                         <Field
  //                           attr={attr}
  //                           operate={
  //                             <im.ImArrowLeft
  //                               onClick={() => {
  //                                 const row = current?.metadata.mappings[index];
  //                                 if (!row?.targetAttr) {
  //                                   current?.metadata.mappings.splice(index, 1);
  //                                 } else {
  //                                   row.sourceAttr = undefined;
  //                                   row.options = undefined;
  //                                 }
  //                                 ctrl.current.changCallback();
  //                               }}
  //                             />
  //                           }
  //                         />
  //                       ) : (
  //                         <></>
  //                       )
  //                     }
  //                   />
  //                 );
  //               }}
  //             />
  //           </DndContext>
  //           <DndContext>
  //             <Fields
  //               attrs={metadata.current.mappings.map((item) => item.targetAttr) ?? []}
  //               node={(attr: XAttribute | undefined, index: number) => {
  //                 return (
  //                   <Draggable
  //                     node={
  //                       attr ? (
  //                         <Field
  //                           attr={attr}
  //                           operate={
  //                             <im.ImArrowRight
  //                               onClick={() => {
  //                                 const row = current?.metadata.mappings[index];
  //                                 if (!row?.sourceAttr) {
  //                                   current?.metadata.mappings.splice(index, 1);
  //                                 } else {
  //                                   row.targetAttr = undefined;
  //                                   row.options = undefined;
  //                                 }
  //                                 ctrl.current.changCallback();
  //                               }}
  //                             />
  //                           }
  //                         />
  //                       ) : (
  //                         <></>
  //                       )
  //                     }
  //                   />
  //                 );
  //               }}
  //             />
  //           </DndContext>
  //         </Col>
  //         <Col span={10}>
  //           {target && (
  //             <Fields
  //               attrs={target.attributes ?? []}
  //               node={(attr: XAttribute | undefined, index: number) => {
  //                 return attr ? (
  //                   <Field
  //                     attr={attr}
  //                     operate={
  //                       <im.ImArrowRight
  //                         onClick={() => {
  //                           current?.metadata.sourceForm.attributes?.splice(index, 1);
  //                           const has = current?.metadata.mappings.find(
  //                             (item) => !item.sourceAttr,
  //                           );
  //                           if (has) {
  //                             has.sourceAttr = attr;
  //                           } else {
  //                             current?.metadata.mappings?.push({ sourceAttr: attr });
  //                           }
  //                           ctrl.current.changCallback();
  //                         }}
  //                       />
  //                     }
  //                   />
  //                 ) : (
  //                   <></>
  //                 );
  //               }}
  //             />
  //           )}
  //         </Col>
  //       </Row>
  //     </Content>
  //   </Layout>
  // );
  return <></>;
};

export default Mapper;
