import { defineConfig } from 'wxt';
import { buidManifest } from './config/buildManifest';
import { buildViteConfig } from './config/buildViteConfig';
import monacoOptions from './config/monaco.config';
import { withMonaco } from './config/withMonaco';

// See https://wxt.dev/api/config.html
export default withMonaco(
    defineConfig({
        modules: ['@wxt-dev/module-vue', '@wxt-dev/i18n/module'],
        webExt: {
            disabled: true,
        },
        manifest: buidManifest,
        srcDir: 'src',
        outDir: 'dist',
        publicDir: 'src/public',
        targetBrowsers: ['firefox', 'chrome'],
        vite: buildViteConfig,
        imports: false,
    }),
    monacoOptions,
);
