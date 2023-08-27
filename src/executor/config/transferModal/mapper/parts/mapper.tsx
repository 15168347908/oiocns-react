import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import { IMapping } from '@/ts/core/thing/config';
import { Col, Layout, Row } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import React from 'react';
import DraggableFields from './draggableFields';
import Fields from './fields';

interface IProps {
  current: IMapping;
}

const Mapper: React.FC<IProps> = ({ current }) => {
  return (
    <Layout>
      <Content>
        <Row>
          <Col span={8}>
            <Fields
              current={current}
              targetAttrs={'sourceAttrs'}
              targetAttr={'sourceAttr'}
            />
          </Col>
          <Col span={8}>
            <Row>
              <Col span={12}>
                <DraggableFields
                  current={current}
                  targetAttrs={'sourceAttrs'}
                  targetAttr={'sourceAttr'}
                />
              </Col>
              <Col span={12}>
                <DraggableFields
                  current={current}
                  targetAttrs={'targetAttrs'}
                  targetAttr={'targetAttr'}
                />
              </Col>
            </Row>
          </Col>
          <Col span={8}>
            <EntityIcon entity={current.metadata.targetForm} showName />
            <Fields
              current={current}
              targetAttrs={'targetAttrs'}
              targetAttr={'targetAttr'}
            />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Mapper;
