declare module '@wangeditor/editor-for-vue' {
  import type {
    IDomEditor,
    IEditorConfig,
    IToolbarConfig,
  } from '@wangeditor/editor';

  import type { DefineComponent } from 'vue';

  export const Editor: DefineComponent<{
    defaultConfig?: Partial<IEditorConfig>;
    defaultHtml?: string;
    disabled?: boolean;
    mode?: 'default' | 'simple';
    modelValue?: string;
    readonly?: boolean;
    style?: Record<string, any>;
    value?: string;
  }>;

  export const Toolbar: DefineComponent<{
    defaultConfig?: Partial<IToolbarConfig>;
    editor?: IDomEditor;
    mode?: 'default' | 'simple';
    style?: Record<string, any>;
  }>;
}
