import RequestConfig from '@/utils/api/impl/config';
import RequestExecutor from '@/utils/api/impl/executor';
import { Row, Col, Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { AxiosError } from 'axios';
import React from 'react';
import InputBox from './parts/inputBox';
import RequestPart from './parts/requestPart';
import ResponsePart from './parts/responsePart';
import { MenuItemType } from 'typings/globelType';
import { XRequestConfig } from '@/utils/api/types';
import { RespContext } from '..';

interface IProps {
  curTab: MenuItemType;
  context: RespContext;
}

const ContainerLayout: React.FC<IProps> = (props: IProps) => {
  let config: XRequestConfig = props.curTab.item!;
  let context = props.context;
  return (
    <Layout key={props.curTab.key} style={{ height: '100%' }}>
      <Content style={{ height: '100%' }}>
        <Row>
          <InputBox
            send={async () => {
              let requestConfig = new RequestConfig(config);
              let executor = new RequestExecutor(requestConfig);
              try {
                let res = await executor.exec();
                console.log('返回值：', res);
                context.setRes(res);
              } catch (error) {
                if (error instanceof AxiosError) {
                  context.setRes(error.response);
                }
              }
            }}
            config={config}
            onChange={(value) => (config.axiosConfig.url = value)}
          />
        </Row>
        <Row style={{ marginTop: 10, height: '100%' }}>
          <Col span={12}>
            <RequestPart setBody={(value) => (config.axiosConfig.data = value)} />
          </Col>
          <Col span={12}>
            <ResponsePart context={context}></ResponsePart>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default ContainerLayout;
