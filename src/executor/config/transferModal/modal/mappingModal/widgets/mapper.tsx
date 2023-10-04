import { Col, Layout, Row } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import React from 'react';
import Center from './center';
import Fields from './fields';
import { model } from '@/ts/base';
import { ITransfer } from '@/ts/core';
import { generateUuid } from '@/ts/base/common';

interface IProps {
  transfer: ITransfer;
  current: model.Mapping;
}

const Mapper: React.FC<IProps> = ({ transfer, current }) => {
  return (
    <Layout style={{ marginTop: 10 }}>
      <Content>
        <Row>
          <Col span={6}>
            <Fields
              key={generateUuid()}
              target={'source'}
              transfer={transfer}
              current={current}
            />
          </Col>
          <Col span={6}>
            <Fields
              key={generateUuid()}
              target={'target'}
              transfer={transfer}
              current={current}
            />
          </Col>
          <Col span={12}>
            <Center key={generateUuid()} transfer={transfer} current={current} />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export { Mapper };
