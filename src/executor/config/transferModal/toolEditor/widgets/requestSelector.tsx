import React from 'react';
import modal from 'antd/lib/modal';
import { IProps } from './../editor';
import { ILink } from '@/ts/core/thing/link';

export const openSelector = (link: ILink) => {
  modal.info({
    content: <RequestSelector link={link} />,
    onOk: () => {},
  });
};

const RequestSelector: React.FC<IProps> = () => {
  return <></>;
};

export default RequestSelector;
