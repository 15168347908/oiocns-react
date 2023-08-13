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
}

const defaultProps: IProps = {
  defaultLanguage: 'json',
};

const MonacoEditor: React.FC<IProps> = (props: IProps) => {
  props = {
    ...defaultProps,
    ...props,
    // automaticLayout 必须关闭，开启会导致无限计算高度，页面卡死
    options: { ...props.options, automaticLayout: false },
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

  // 初始化数值
  const initValue = () => {
    let value = props.options?.value;
    if (value) {
      switch (props.defaultLanguage) {
        case 'json':
          try {
            editor.setValue(JSON.stringify(JSON.parse(value), null, 2));
            break;
          } catch (error) {
            console.log('initValue error:', error);
          }
        default:
          editor.setValue(value);
      }
    }
  };

  // 渲染
  return (
    <div style={{ ...props.style, height: '100%', width: '100%' }} ref={ref}>
      <Editor
        width={props.width}
        height={props.height}
        defaultLanguage={props.defaultLanguage}
        defaultValue={props.defaultValue}
        options={props.options}
        onMount={(e) => {
          editor = e;
          resize();
          initValue();
        }}
        onChange={(value) => {
          props.onChange?.apply(props, [value]);
        }}
      />
    </div>
  );
};

export default MonacoEditor;
