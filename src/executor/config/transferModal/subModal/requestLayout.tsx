import RequestConfig from '@/utils/api/impl/config';
import RequestExecutor from '@/utils/api/impl/executor';
import { XRequestConfig } from '@/utils/api/types';
import { Col, Layout, Row } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { AxiosError, AxiosResponse } from 'axios';
import React, { useState } from 'react';
import { MenuItemType } from 'typings/globelType';
import InputBox from './parts/inputBox';
import RequestPart from './parts/request';
import ResponsePart from './parts/response/responsePart';

interface IProps {
  curTab: MenuItemType;
}

const RequestLayout: React.FC<IProps> = ({ curTab }) => {
  let config: XRequestConfig = curTab.item;
  const [resp, setResp] = useState<AxiosResponse>();
  return (
    <Layout key={curTab.key} style={{ height: '100%' }}>
      <Content style={{ height: '100%' }}>
        <Row>
          <InputBox
            send={async () => {
              let requestConfig = new RequestConfig(config);
              let requestExecutor = new RequestExecutor(requestConfig);
              try {
                let res = await requestExecutor.exec();
                setResp(res);
              } catch (error) {
                if (error instanceof AxiosError) {
                  setResp(error.response);
                }
              }
            }}
            config={config}
            onChange={(value) => (config.axios.url = value)}
          />
        </Row>
        <Row style={{ marginTop: 10, height: '100%' }}>
          <Col span={12}>
            <RequestPart
              updateParams={(value) => (config.axios.params = value)}
              updateHeaders={(value) => (config.axios.headers = value)}
              updateBody={(value) => (config.axios.data = value)}
            />
          </Col>
          <Col span={12}>
            <ResponsePart resp={resp}></ResponsePart>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default RequestLayout;
