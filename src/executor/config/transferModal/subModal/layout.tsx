import { Col, Layout, Row } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { AxiosError, AxiosResponse } from 'axios';
import React, { useState } from 'react';
import { MenuItemType } from 'typings/globelType';
import InputBox from './parts/inputBox';
import RequestPart from './parts/request';
import ResponsePart from './parts/response/responsePart';
import { IRequest } from '@/ts/core/thing/request';
import { Method } from '@/utils/api/consts';

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
            method={request.metadata.axios.method ?? Method.GET}
            setMethod={(method) => request.update(method, 'method')}
            url={request.metadata.axios.url}
            setUrl={(url) => request.update(url, 'url')}
            send={async () => {
              try {
                let res = await request.exec();
                setResp(() => res);
              } catch (error) {
                if (error instanceof AxiosError) {
                  setResp(() => (error as AxiosError).response);
                }
              }
            }}
          />
        </Row>
        <Row style={{ marginTop: 10, height: '100%' }}>
          <Col span={12}>
            <RequestPart request={request}></RequestPart>
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
