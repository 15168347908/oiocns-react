import { IEntity } from '@/ts/core';
import Editor, { EditorProps } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import React, { CSSProperties, useCallback, useEffect, useRef } from 'react';

interface IProps<T> extends EditorProps {
  entity?: IEntity<T>;
  getVal?: () => any;
  style?: CSSProperties;
  onChange?: (value?: string) => void;
}

const defaultProps: IProps<any> = {
  defaultLanguage: 'json',
  options: {
    minimap: {
      enabled: false,
    },
  },
};

const MonacoEditor: React.FC<IProps<any>> = (props: IProps<any>) => {
  const div = useRef<HTMLDivElement>(null);
  const editor = useRef<editor.IStandaloneCodeEditor>();

  props = {
    ...defaultProps,
    ...props,
    // automaticLayout 必须关闭，开启会导致无限计算高度，页面卡死
    options: { ...defaultProps.options, ...props.options, automaticLayout: false },
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
    const id = props.entity?.subscribe(() => {
      setValue(props.getVal?.apply(props));
    });
    window.addEventListener('resize', resize);
    return () => {
      props.entity?.unsubscribe(id!);
      window.removeEventListener('resize', resize);
    };
  }, [props.getVal?.apply(props)]);

  // 渲染
  return (
    <div style={{ ...props.style, height: '100%', width: '100%' }} ref={div}>
      <Editor
        onMount={(e) => {
          editor.current = e;
          resize();
        }}
        onChange={(value) => {
          props.onChange?.apply(props, [value]);
        }}
        {...props}
      />
    </div>
  );
};

export default MonacoEditor;
