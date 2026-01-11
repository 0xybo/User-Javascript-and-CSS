import { createPinia } from 'pinia';
import { createApp } from 'vue';
import Popup from './Popup.vue';
import './style.css';

createApp(Popup).use(createPinia()).mount('#app');
