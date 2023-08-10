import React, { CSSProperties, createRef, useCallback, useEffect, useRef, useState } from 'react';
import MonacoEditor from 'react-monaco-editor/lib/editor';
import cls from './../index.module.less';

interface IProps {
  style?: CSSProperties;
}

const Editor: React.FC<IProps> = (props: IProps) => {
  // 实时更新宽高
  const [width, setWidth] = useState<string>('100%');
  const [height, setHeight] = useState<string>('100%');

  // 监听父组件 Div 的宽高变化
  const ref = createRef<HTMLDivElement>();
  const monacoEditorResize = useCallback(() => {
    setWidth(`${ref.current?.clientWidth}`);
    setHeight(`${ref.current?.clientHeight}`);
  }, [ref]);

  // 监听函数
  useEffect(() => {
    window.addEventListener('resize', monacoEditorResize);
    return () => {
      window.removeEventListener('resize', monacoEditorResize);
    };
  }, [monacoEditorResize]);

  // 渲染
  return (
    <div style={props.style} className={cls['monaco']} ref={ref}>
      <MonacoEditor width={width} height={height} />
    </div>
  );
};

export default Editor;
