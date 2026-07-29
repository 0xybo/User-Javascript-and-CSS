import { createApp, type Component } from 'vue';

/**
 * Mounts a new Vue application with the specified component and attaches it to the DOM element
 * with the ID 'app'.
 *
 * @param component - The Vue component to mount as the root of the application.
 */
export function mountNewApp(component: Component) {
    const app = createApp(component);

    app.mount('#app');
}
