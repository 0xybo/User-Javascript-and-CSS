import { Component, createApp as createVueApp } from '#imports';

export function mountNewApp(component: Component) {
    const app = createVueApp(component);

    app.mount('#app');
}
