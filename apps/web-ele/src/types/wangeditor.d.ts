declare module '@wangeditor/editor-for-vue' {
  import type { DefineComponent } from 'vue';
  import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor';

  export const Editor: DefineComponent<{
    defaultConfig?: Partial<IEditorConfig>;
    defaultHtml?: string;
    mode?: 'default' | 'simple';
    style?: Record<string, any>;
    readonly?: boolean;
    disabled?: boolean;
    value?: string;
    modelValue?: string;
  }>;

  export const Toolbar: DefineComponent<{
    editor?: IDomEditor;
    defaultConfig?: Partial<IToolbarConfig>;
    mode?: 'default' | 'simple';
    style?: Record<string, any>;
  }>;
}
