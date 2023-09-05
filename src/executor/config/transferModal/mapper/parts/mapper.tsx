import { IMapping } from '@/ts/core/thing/config';
import { Col, Layout, Row } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import React from 'react';
import Center from './center';
import Fields from './fields';

interface IProps {
  current: IMapping;
}

const Mapper: React.FC<IProps> = ({ current }) => {
  return (
    <Layout style={{ marginTop: 10 }}>
      <Content>
        <Row>
          <Col span={6}>
            <Fields current={current} target={'source'} />
          </Col>
          <Col span={6}>
            <Fields current={current} target={'target'} />
          </Col>
          <Col span={12}>
            <Center current={current} />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Mapper;
