import { defineConfig } from 'wxt';
import { buildManifest } from './config/buildManifest';
import { buildViteConfig } from './config/buildViteConfig';
import monacoOptions from './config/monaco.config';
import { withMonaco } from './config/withMonaco';
import { withSass } from './config/withSass';

// See https://wxt.dev/api/config.html
export default (() => {
    let config = defineConfig({
        modules: ['@wxt-dev/module-vue'],
        webExt: {
            disabled: true,
        },
        manifest: buildManifest,
        manifestVersion: 3,
        srcDir: 'src',
        outDir: 'dist',
        publicDir: 'src/public',
        targetBrowsers: ['firefox', 'chrome'],
        vite: buildViteConfig,
        imports: false,
    });

    config = withMonaco(config, monacoOptions);
    config = withSass(config);

    return config;
})();
