import Editor from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import cls from './../../index.module.less';
import React, { CSSProperties, useEffect, useRef, useState, useCallback } from 'react';

type Options = editor.IStandaloneEditorConstructionOptions;

interface IProps {
  style?: CSSProperties;
  defaultLanguage?: string;
  defaultValue?: string;
  options?: Options;
  onChange?: (value: string) => void;
}

const defaultProps: IProps = {
  defaultLanguage: 'json',
  options: {
    automaticLayout: false,
  },
};

const MonacoEditor: React.FC<IProps> = (props: IProps) => {
  props = {
    ...defaultProps,
    ...props,
  };

  // 编辑器
  let editor: editor.IStandaloneCodeEditor = null!;

  // 监听父组件 Div 的宽高变化
  const ref = useRef<HTMLDivElement>(null);
  const resize = useCallback(() => {
    editor?.layout({
      width: ref.current?.clientWidth ?? 600,
      height: ref.current?.clientHeight ?? 400,
    });
  }, [ref]);

  // 监听函数
  useEffect(() => {
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [resize]);

  // 渲染
  return (
    <div style={props.style} className={cls['monaco']} ref={ref}>
      <Editor
        defaultLanguage={props.defaultLanguage}
        defaultValue={props.defaultValue}
        options={props.options}
        onMount={(e) => {
          editor = e;
          resize();
        }}
      />
    </div>
  );
};

export default MonacoEditor;
