import { XForm } from '@/ts/base/schema';
import { IBelong } from '@/ts/core';
import { IMapping } from '@/ts/core/thing/config';
import { Col, Layout, Row } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import React, { useState } from 'react';
import cls from './../index.module.less';
import Form from './meta';
import Center from './center';
import Field from './field';

interface IProps {
  current?: IMapping;
  belong: IBelong;
  status: 'edit' | 'view';
}

const Mapper: React.FC<IProps> = ({ current, belong }) => {
  const [source, setSource] = useState<XForm | undefined>(current?.metadata.sourceForm);
  const [target, setTarget] = useState<XForm | undefined>(current?.metadata.targetForm);
  return (
    <Layout className={cls.layout}>
      <Content className={cls.content}>
        <Row>
          <Col span={12}>
            <Form setForm={setSource} belong={belong} typeName={'源对象'}></Form>
          </Col>
          <Col span={12}>
            <Form setForm={setTarget} belong={belong} typeName={'目标对象'}></Form>
          </Col>
        </Row>
        <Row className={cls['mapping-body']}>
          <Col span={10}>
            <Field form={source} />
          </Col>
          <Col span={4}>
            <Center></Center>
          </Col>
          <Col span={10}>
            <Field form={target} />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Mapper;
