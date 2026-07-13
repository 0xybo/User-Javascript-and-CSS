import { createApp, type Component } from 'vue';

export function mountNewApp(component: Component) {
    const app = createApp(component);

    app.mount('#app');
}
