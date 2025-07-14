import './assets/css/style.css';
import { loadView } from './js/router.js';

window.addEventListener('load', loadView);
window.addEventListener('hashchange', loadView);