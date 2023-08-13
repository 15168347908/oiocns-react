import { Controller } from '@/ts/controller';
import Editor from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import React, { CSSProperties, useCallback, useEffect, useRef } from 'react';

type Options = editor.IStandaloneEditorConstructionOptions;

interface IProps {
  style?: CSSProperties;
  width?: number;
  height?: number;
  defaultLanguage?: string;
  defaultValue?: string;
  options?: Options;
  onChange?: (value?: string) => void;
  ctrl?: Controller;
  curVal?: () => any;
}

const defaultProps: IProps = {
  defaultLanguage: 'json',
};

const MonacoEditor: React.FC<IProps> = (props: IProps) => {
  const div = useRef<HTMLDivElement>(null);
  const editor = useRef<editor.IStandaloneCodeEditor>();

  props = {
    ...defaultProps,
    ...props,
    // automaticLayout 必须关闭，开启会导致无限计算高度，页面卡死
    options: { ...props.options, automaticLayout: false },
  };

  // 监听父组件 Div 的宽高变化
  const resize = useCallback(() => {
    editor.current?.layout({
      width: div.current?.clientWidth!,
      height: div.current?.clientHeight!,
    });
  }, [div]);

  // 初始化数值
  const setValue = (value: any) => {
    console.log('value', value);
    if (value) {
      switch (props.defaultLanguage) {
        case 'json':
          try {
            if (typeof value === 'string') {
              editor.current?.setValue(JSON.stringify(JSON.parse(value), null, 2));
            } else if (typeof value === 'object') {
              editor.current?.setValue(JSON.stringify(value, null, 2));
            }
            break;
          } catch (error) {
            console.log('initValue error:', error);
          }
        default:
          editor.current?.setValue(value);
      }
    }
  };

  // 监听函数
  useEffect(() => {
    props.ctrl?.subscribe(() => {
      setValue(props.curVal?.apply(props));
    });
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  });

  // 渲染
  return (
    <div style={{ ...props.style, height: '100%', width: '100%' }} ref={div}>
      <Editor
        width={props.width}
        height={props.height}
        defaultLanguage={props.defaultLanguage}
        defaultValue={props.defaultValue}
        options={props.options}
        onMount={(e) => {
          editor.current = e;
          resize();
        }}
        onChange={(value) => {
          props.onChange?.apply(props, [value]);
        }}
      />
    </div>
  );
};

export default MonacoEditor;
