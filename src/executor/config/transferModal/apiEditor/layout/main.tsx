import { Col, Layout, Row } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { AxiosError, AxiosResponse } from 'axios';
import React, { useState } from 'react';
import InputBox from '../parts/inputBox';
import RequestPart from '../parts/request';
import ResponsePart from '../parts/response/responsePart';
import { IRequest } from '../../../../../ts/core/thing/config';

interface IProps {
  current: IRequest;
  finished?: () => void;
}

const RequestLayout: React.FC<IProps> = ({ current }) => {
  const [resp, setResp] = useState<AxiosResponse>();
  return (
    <Layout key={current.key} style={{ height: '100%' }}>
      <Content style={{ height: '100%' }}>
        <Row>
          <InputBox
            current={current}
            send={async () => {
              try {
                let res = await current.exec();
                setResp(() => res);
              } catch (error) {
                if (error instanceof AxiosError) {
                  setResp(() => (error as AxiosError).response);
                }
              }
              current.changCallback();
            }}
          />
        </Row>
        <Row style={{ marginTop: 10, height: '100%' }}>
          <Col span={12}>
            <RequestPart current={current} />
          </Col>
          <Col span={12}>
            <ResponsePart request={current} response={resp} />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default RequestLayout;
