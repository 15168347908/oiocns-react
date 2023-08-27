import { XAttribute } from '@/ts/base/schema';
import React from 'react';
import { ReactNode } from 'react-markdown/lib/ast-to-react';
import cls from './../index.module.less';

interface IProps {
  attrs: (XAttribute | undefined)[];
  node: (attr: XAttribute | undefined, index: number) => ReactNode;
}

const Fields: React.FC<IProps> = ({ attrs, node }) => {
  return <div className={cls['mapping-content']}>{attrs.map(node)}</div>;
};

export default Fields;
