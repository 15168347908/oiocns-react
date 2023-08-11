import React, { CSSProperties, createRef, useCallback, useEffect, useState } from 'react';
import MonacoEditor from 'react-monaco-editor/lib/editor';
import cls from './../../index.module.less';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

type Options = monacoEditor.editor.IStandaloneEditorConstructionOptions;

interface IProps {
  style?: CSSProperties;
  theme?: string;
  value?: string;
  defaultValue?: string;
  options?: Options;
  onChange?: (value: string) => void;
}

const defaultOptions: Options = {
  language: 'json',
};

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
      <MonacoEditor
        width={width}
        height={height}
        theme={props.theme}
        value={props.defaultValue}
        defaultValue={props.defaultValue}
        onChange={props.onChange}
      />
    </div>
  );
};

export default Editor;
