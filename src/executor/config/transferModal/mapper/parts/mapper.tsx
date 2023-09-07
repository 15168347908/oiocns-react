import { IMapping } from '@/ts/core/thing/transfer/config';
import { Col, Layout, Row } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import React, { useRef } from 'react';
import Center from './center';
import Fields from './fields';
import { Command } from '@/ts/base';

interface IProps {
  current: IMapping;
}

const Mapper: React.FC<IProps> = ({ current }) => {
  const cmd = useRef<Command>(new Command());
  return (
    <Layout style={{ marginTop: 10 }}>
      <Content>
        <Row>
          <Col span={6}>
            <Fields
              key={'source'}
              current={current}
              target={'source'}
              cmd={cmd.current}
            />
          </Col>
          <Col span={6}>
            <Fields
              key={'target'}
              current={current}
              target={'target'}
              cmd={cmd.current}
            />
          </Col>
          <Col span={12}>
            <Center key={'center'} current={current} cmd={cmd.current} />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Mapper;
