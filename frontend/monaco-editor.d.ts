declare module '@monaco-editor/react' {
  import { editor } from 'monaco-editor';
  import * as React from 'react';

  export interface EditorProps {
    height?: string | number;
    width?: string | number;
    defaultLanguage?: string;
    defaultValue?: string;
    value?: string;
    language?: string;
    theme?: string;
    line?: number;
    loading?: React.ReactNode;
    options?: editor.IStandaloneEditorConstructionOptions;
    overrideServices?: editor.IEditorOverrideServices;
    saveViewState?: boolean;
    keepCurrentModel?: boolean;
    path?: string;
    className?: string;
    wrapperProps?: object;
    beforeMount?: (monaco: typeof import('monaco-editor')) => void;
    onMount?: (editor: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => void;
    onChange?: (value: string | undefined, ev: editor.IModelContentChangedEvent) => void;
    onValidate?: (markers: editor.IMarker[]) => void;
  }

  const Editor: React.FC<EditorProps>;
  export default Editor;
}
