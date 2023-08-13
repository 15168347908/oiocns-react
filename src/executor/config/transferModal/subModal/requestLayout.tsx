import RequestConfig from '@/utils/api/impl/config';
import RequestExecutor from '@/utils/api/impl/executor';
import { Row, Col, Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { AxiosError, AxiosResponse } from 'axios';
import React, { useState } from 'react';
import InputBox from './parts/inputBox';
import RequestPart, { ReqTab } from './parts/request';
import ResponsePart from './parts/response/responsePart';
import { MenuItemType } from 'typings/globelType';
import { XRequestConfig } from '@/utils/api/types';

interface IProps {
  curTab: MenuItemType;
}

const RequestLayout: React.FC<IProps> = (props: IProps) => {
  let config: XRequestConfig = props.curTab.item!;
  console.log('重新渲染啦', config);
  const [resp, setResp] = useState<AxiosResponse>();
  return (
    <Layout key={props.curTab.key} style={{ height: '100%' }}>
      <Content style={{ height: '100%' }}>
        <Row>
          <InputBox
            send={async () => {
              let requestConfig = new RequestConfig(config);
              let requestExecutor = new RequestExecutor(requestConfig);
              try {
                let res = await requestExecutor.exec();
                console.log('返回值：', res);
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
