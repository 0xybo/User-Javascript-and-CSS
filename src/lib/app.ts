import { Component, createApp as createVueApp } from '#imports';
import { createPinia } from 'pinia';

export function mountNewApp(component: Component) {
    const app = createVueApp(component);

    app.use(createPinia());

    app.mount('#app');
}
