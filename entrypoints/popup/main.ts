import { createApp } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { 
  faTable, 
  faFileExcel, 
  faDownload, 
  faRotate, 
  faTriangleExclamation,
  faCheck,
  faFile,
  faLayerGroup,
  faEye,
  faCircleInfo,
  faClone,
} from '@fortawesome/free-solid-svg-icons';
import App from './App.vue';
import './styles/popup.css';

// 添加图标到库
library.add(
  faTable,
  faFileExcel,
  faDownload,
  faRotate,
  faTriangleExclamation,
  faCheck,
  faFile,
  faLayerGroup,
  faEye,
  faCircleInfo,
  faClone,
);

const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon);
app.mount('#app');
