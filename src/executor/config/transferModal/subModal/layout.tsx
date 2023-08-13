import { IRequest } from '@/ts/core/thing/request';
import { Method } from '@/utils/api/consts';
import { Col, Layout, Row } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { AxiosError, AxiosResponse } from 'axios';
import React, { useState } from 'react';
import { MenuItemType } from 'typings/globelType';
import InputBox from './parts/inputBox';
import RequestPart from './parts/request';
import ResponsePart from './parts/response/responsePart';
import { Controller } from '@/ts/controller';

interface IProps {
  curTab: MenuItemType;
}

const ctrl = new Controller('');

const RequestLayout: React.FC<IProps> = ({ curTab }) => {
  let request: IRequest = curTab.item;
  const [method, setMethod] = useState<string>(
    request.metadata.axios.method ?? Method.GET,
  );
  const [resp, setResp] = useState<AxiosResponse>();
  return (
    <Layout key={curTab.key} style={{ height: '100%' }}>
      <Content style={{ height: '100%' }}>
        <Row>
          <InputBox
            method={method}
            setMethod={(method) => {
              request.update(method, 'method');
              setMethod(method);
            }}
            url={request.metadata.axios.url}
            setUrl={(url) => request.update(url, 'url')}
            send={async () => {
              try {
                let res = await request.exec();
                console.log('res', res);
                setResp(() => res);
              } catch (error) {
                if (error instanceof AxiosError) {
                  console.log('error', error);
                  setResp(() => (error as AxiosError).response);
                }
              }
              ctrl.changCallback();
            }}
          />
        </Row>
        <Row style={{ marginTop: 10, height: '100%' }}>
          <Col span={12}>
            <RequestPart request={request} setUrl={(url) => request.update(url, 'url')} />
          </Col>
          <Col span={12}>
            <ResponsePart resp={resp} ctrl={ctrl} />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default RequestLayout;
