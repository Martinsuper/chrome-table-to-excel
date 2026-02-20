/**
 * Content Script - 表格导出功能
 * 负责在页面中执行表格识别和 Excel 导出
 */

import { defineContentScript } from 'wxt/sandbox';
import { exportTableToExcel, exportMultipleTables } from './excelExporter';

// 存储表格引用的 Map
const tableRegistry = new Map<string, HTMLTableElement>();

/**
 * 从表格元素提取信息（不存储引用）
 */
function extractTableInfo(table: HTMLTableElement, index: number) {
  const rows = Array.from(table.querySelectorAll('tr'));
  const preview: string[][] = [];
  
  // 获取表格名称
  let name = '表格';
  const caption = table.querySelector('caption');
  if (caption?.innerText.trim()) {
    name = caption.innerText.trim().substring(0, 50);
  } else if (table.id) {
    name = table.id;
  } else {
    const className = table.className?.toString().split(' ')[0];
    if (className) name = className;
  }
  
  // 获取预览数据（前 5 行 5 列）
  rows.forEach((row, i) => {
    if (i >= 5) return;
    const cells = Array.from(row.querySelectorAll('th, td'));
    preview.push(cells.slice(0, 5).map(cell => cell.innerText.trim()));
  });
  
  const cols = rows.length > 0 
    ? Math.max(...Array.from(rows).map(r => r.querySelectorAll('th, td').length))
    : 0;
  
  return {
    id: `table-${index}-${Date.now()}`,
    index,
    name,
    rows: rows.length,
    cols,
    preview,
  };
}

/**
 * 识别页面中的所有表格并存储引用
 */
function identifyTables() {
  const tables = Array.from(document.querySelectorAll('table'));
  const tableInfos = [];
  
  let index = 0;
  for (const table of tables) {
    // 过滤掉隐藏的表格
    const style = window.getComputedStyle(table);
    if (style.display === 'none' || style.visibility === 'hidden') {
      continue;
    }
    
    // 过滤掉没有内容的表格
    const rows = table.querySelectorAll('tr');
    if (rows.length === 0) {
      continue;
    }
    
    // 过滤掉嵌套表格（只导出外层表格）
    if (table.closest('table') !== table) {
      continue;
    }
    
    const id = `table-${index}`;
    tableRegistry.set(id, table as HTMLTableElement);
    
    const info = extractTableInfo(table as HTMLTableElement, index);
    info.id = id;
    tableInfos.push(info);
    
    index++;
  }
  
  return tableInfos;
}

/**
 * 获取表格元素
 */
function getTableElement(tableId: string): HTMLTableElement | null {
  return tableRegistry.get(tableId) || null;
}

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    // 监听来自 popup 或 background 的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('[Table Exporter] 收到消息:', message);

      switch (message.action) {
        case 'getTables':
          // 获取页面中的所有表格
          const tables = identifyTables();
          console.log('[Table Exporter] 找到表格:', tables.length);
          console.log('[Table Exporter] 表格详情:', tables);
          console.log('[Table Exporter] 当前注册的表格 IDs:', Array.from(tableRegistry.keys()));
          sendResponse({
            success: true,
            tables,
          });
          break;

        case 'exportTable':
          // 导出单个表格
          try {
            console.log('[Table Exporter] 查找表格:', message.tableId);
            console.log('[Table Exporter] 当前注册的表格:', Array.from(tableRegistry.keys()));
            
            const table = getTableElement(message.tableId);
            if (!table) {
              console.error('[Table Exporter] 未找到表格:', message.tableId);
              sendResponse({ success: false, error: '未找到指定的表格' });
              return;
            }

            console.log('[Table Exporter] 找到表格元素:', table);
            console.log('[Table Exporter] 表格行数:', table.querySelectorAll('tr').length);
            
            exportTableToExcel(table, message.filename);
            console.log('[Table Exporter] 导出成功');
            sendResponse({ success: true });
          } catch (error) {
            console.error('[Table Exporter] 导出失败:', error);
            sendResponse({
              success: false,
              error: error instanceof Error ? error.message : '导出失败',
            });
          }
          break;

        case 'exportMultiple':
          // 导出多个表格
          try {
            const tableElements = message.tableIds
              .map((id: string) => getTableElement(id))
              .filter(Boolean) as HTMLTableElement[];
              
            if (tableElements.length === 0) {
              sendResponse({ success: false, error: '未找到指定的表格' });
              return;
            }

            exportMultipleTables(tableElements, message.filename);
            sendResponse({ success: true });
          } catch (error) {
            console.error('[Table Exporter] 导出失败:', error);
            sendResponse({
              success: false,
              error: error instanceof Error ? error.message : '导出失败',
            });
          }
          break;

        default:
          sendResponse({ success: false, error: '未知操作' });
      }

      return true; // 保持消息通道开启用于异步响应
    });

    console.log('[Table Exporter] Content Script 已加载');
  },
});
