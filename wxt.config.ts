import { defineConfig } from 'wxt';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  vite: () => ({
    plugins: [vue()],
  }),
  outDir: 'dist',
  manifest: {
    name: 'Table to Excel Exporter',
    description: '导出网页表格为 Excel 文件，保留格式和样式',
    version: '1.0.0',
    permissions: [
      'activeTab',
      'scripting',
      'storage',
    ],
    host_permissions: [
      '<all_urls>',
    ],
    action: {
      default_title: 'Table to Excel Exporter',
      default_popup: 'popup/index.html',
      default_icon: {
        '16': 'icon-16.png',
        '48': 'icon-48.png',
        '128': 'icon-128.png',
      },
    },
    icons: {
      '16': 'icon-16.png',
      '48': 'icon-48.png',
      '128': 'icon-128.png',
    },
  },
  contentScripts: {
    contentScript: {
      matches: ['<all_urls>'],
      js: ['index.ts'],
    },
  },
});
