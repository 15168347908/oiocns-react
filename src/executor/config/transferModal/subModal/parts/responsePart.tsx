import React from 'react';
import Editor from './monacor';
import { RespContext } from '../..';

interface IProps {
  context: RespContext;
}

const ResponsePart: React.FC<IProps> = (props: IProps) => {
  let data = props.context.res?.data;
  let value = data ? JSON.stringify(data) : '';
  console.log(value);
  return (
    <Editor style={{ margin: 10 }} value={"asdasd"} />
  );
};

export default ResponsePart;
