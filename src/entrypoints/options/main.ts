import { createPinia } from 'pinia';
import { createApp } from 'vue';
import Options from './Options.vue';
import './style.css';

createApp(Options).use(createPinia()).mount('#app');
