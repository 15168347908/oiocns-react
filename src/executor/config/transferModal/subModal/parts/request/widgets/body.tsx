import React from 'react';
import MonacoEditor from './../../monacor';

export interface IProps {
  updateBody?: (value?: string) => void;
}

const Body: React.FC<IProps> = (props: IProps) => {
  return <MonacoEditor height={850} style={{ margin: 4 }} onChange={props.updateBody} />;
};

export default Body;
