import type {
  NormalizedOutputOptions,
  OutputBundle,
  OutputChunk,
} from 'rollup';
import type { PluginOption } from 'vite';

import { EOL } from 'node:os';

import { dateUtil, readPackageJSON } from '@vben/node-utils';

/**
 * 用于注入版权信息
 * @returns
 */

async function viteLicensePlugin(
  root = process.cwd(),
): Promise<PluginOption | undefined> {
  const {
    author,
    description = '',
    homepage = '',
    version = '',
  } = await readPackageJSON(root);

  const authorName = typeof author === 'string' ? author : author?.name || '';
  const authorEmail = typeof author === 'string' ? '' : author?.email || '';

  const appTitle =
    (typeof process !== 'undefined' &&
      process.env?.VITE_APP_TITLE) ||
    '破管通';

  const copyrightYear = new Date().getFullYear();

  return {
    apply: 'build',
    enforce: 'post',
    generateBundle: {
      handler: (_options: NormalizedOutputOptions, bundle: OutputBundle) => {
        const date = dateUtil().format('YYYY-MM-DD ');
        const copyrightText = `/*!
  * ${appTitle}
  * Version: ${version}
  * Copyright (C) ${copyrightYear} ${authorName}
  *
  * Based on Vue Vben Admin (MIT License)
  * Copyright (c) 2024-present, Vben
  *
  * License: MIT License
  * Description: ${description || appTitle}
  * Date Created: ${date}
  * Homepage: ${homepage}
  * Contact: ${authorEmail}
*/
              `.trim();

        for (const [, fileContent] of Object.entries(bundle)) {
          if (fileContent.type === 'chunk' && fileContent.isEntry) {
            const chunkContent = fileContent as OutputChunk;
            const content = chunkContent.code;
            const updatedContent = `${copyrightText}${EOL}${content}`;

            (fileContent as OutputChunk).code = updatedContent;
          }
        }
      },
      order: 'post',
    },
    name: 'vite:license',
  };
}

export { viteLicensePlugin };
