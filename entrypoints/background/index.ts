import { defineBackground } from 'wxt/sandbox';

export default defineBackground(() => {
  // 监听安装事件
  chrome.runtime.onInstalled.addListener((details) => {
    console.log('[Table Exporter] 扩展已安装', details);

    if (details.reason === 'install') {
      // 首次安装，可以打开欢迎页面
      chrome.tabs.create({
        url: 'https://github.com/Martinsuper/chrome-table-to-excel/blob/main/README.md',
      });
    }
  });

  // 消息转发和处理
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Table Exporter] Background 收到消息:', message);

    // 这里可以处理需要 background 权限的操作
    // 目前主要由 content script 处理

    sendResponse({ success: true });
    return true;
  });

  console.log('[Table Exporter] Background Service Worker 已启动');
});
