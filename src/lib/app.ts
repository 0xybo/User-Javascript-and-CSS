import { createApp, watch, type Component } from 'vue';
import i18n from './i18n';
import { storage } from './storage';

/**
 * Mounts a new Vue application with the specified component and attaches it to the DOM element
 * with the ID 'app'.
 *
 * @param component - The Vue component to mount as the root of the application.
 */
export function mountNewApp(component: Component) {
    const app = createApp(component);

    app.use(i18n);
    storage.onLoaded(() =>
        watch(
            () => storage.settings.language,
            (language) => language && (i18n.global.locale.value = language),
            { immediate: true },
        ),
    );

    app.mount('#app');
}
