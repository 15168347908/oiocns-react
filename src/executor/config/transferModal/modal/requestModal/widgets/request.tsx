import { model } from '@/ts/base';
import { ITransfer } from '@/ts/core';
import { Col, Layout, Row, message } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { AxiosError } from 'axios';
import React from 'react';
import InputBox from './inputBox';
import HttpData from './httpData';
import Response from './response';

interface IProps {
  transfer: ITransfer;
  current: model.Request;
  finished?: () => void;
}

const Request: React.FC<IProps> = ({ transfer, current }) => {
  return (
    <Layout key={transfer.key} style={{ height: '100%' }}>
      <Content style={{ height: '100%' }}>
        <Row>
          <InputBox
            transfer={transfer}
            current={current}
            send={async () => {
              try {
                let res = await transfer.request(current);
                transfer.command.emitter('request', 'onValueChange', res);
              } catch (error) {
                if (error instanceof AxiosError) {
                  const axiosError = error as AxiosError;
                  if (axiosError.response) {
                    transfer.command.emitter(
                      'request',
                      'onValueChange',
                      axiosError.response,
                    );
                  } else {
                    transfer.command.emitter(
                      'request',
                      'onValueChange',
                      axiosError.message,
                    );
                  }
                } else if (error instanceof Error) {
                  message.error('请求异常，异常信息' + error.message);
                }
              }
            }}
          />
        </Row>
        <Row style={{ marginTop: 10, height: '100%' }}>
          <Col span={12}>
            <HttpData transfer={transfer} current={current} />
          </Col>
          <Col span={12}>
            <Response transfer={transfer} />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export { Request };
