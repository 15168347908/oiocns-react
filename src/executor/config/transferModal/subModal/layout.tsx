import { IRequest } from '@/ts/core/thing/request';
import { Col, Layout, Row } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { AxiosError, AxiosResponse } from 'axios';
import React, { useState } from 'react';
import { MenuItemType } from 'typings/globelType';
import InputBox from './parts/inputBox';
import RequestPart from './parts/request/index';
import ResponsePart from './parts/response/responsePart';

interface IProps {
  curTab: MenuItemType;
}

const RequestLayout: React.FC<IProps> = ({ curTab }) => {
  let request: IRequest = curTab.item;
  const [resp, setResp] = useState<AxiosResponse>();
  return (
    <Layout key={curTab.key} style={{ height: '100%' }}>
      <Content style={{ height: '100%' }}>
        <Row>
          <InputBox
            request={request}
            send={async () => {
              try {
                let res = await request.exec();
                setResp(() => res);
              } catch (error) {
                if (error instanceof AxiosError) {
                  setResp(() => (error as AxiosError).response);
                }
              }
              request.changCallback();
            }}
          />
        </Row>
        <Row style={{ marginTop: 10, height: '100%' }}>
          <Col span={12}>
            <RequestPart request={request} />
          </Col>
          <Col span={12}>
            <ResponsePart request={request} response={resp} />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default RequestLayout;
