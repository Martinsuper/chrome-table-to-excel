/**
 * 表格数据类型定义
 */
export interface TableData {
  id: string;
  index: number;
  name: string;
  rows: number;
  cols: number;
  element: HTMLElement;
  preview: string[][];
}

/**
 * 获取表格名称
 */
function getTableName(table: HTMLTableElement): string {
  // 尝试获取 caption
  const caption = table.querySelector('caption');
  if (caption && caption.innerText.trim()) {
    return caption.innerText.trim().substring(0, 50);
  }
  
  // 尝试获取 id 或 class
  if (table.id) {
    return table.id;
  }
  
  const classNames = table.className.toString().split(' ').filter(c => c)[0];
  if (classNames) {
    return classNames;
  }
  
  return '表格';
}

/**
 * 从表格元素中提取数据
 */
function extractTableData(table: HTMLTableElement): TableData {
  const rows = Array.from(table.querySelectorAll('tr'));
  const preview: string[][] = [];
  
  // 处理行和单元格
  const rowSpanMap = new Map<number, number[]>(); // 跟踪 rowspan
  
  rows.forEach((row, rowIndex) => {
    const previewRow: string[] = [];
    const currentRowSpans = rowSpanMap.get(rowIndex) || [];
    
    let cellIndex = 0;
    const rowCells = Array.from(row.querySelectorAll('th, td'));
    
    rowCells.forEach((cell) => {
      // 处理 rowspan 占位
      while (currentRowSpans[cellIndex]) {
        previewRow.push('');
        currentRowSpans[cellIndex]--;
        cellIndex++;
      }
      
      const cellElement = cell as HTMLTableCellElement;
      const colspan = cellElement.colSpan || 1;
      const rowspan = cellElement.rowSpan || 1;
      
      // 记录 rowspan 影响
      if (rowspan > 1) {
        for (let i = 1; i < rowspan; i++) {
          const futureRowIndex = rowIndex + i;
          if (!rowSpanMap.has(futureRowIndex)) {
            rowSpanMap.set(futureRowIndex, []);
          }
          const futureRowSpans = rowSpanMap.get(futureRowIndex)!;
          for (let j = 0; j < colspan; j++) {
            futureRowSpans[cellIndex + j] = rowspan - i;
          }
        }
      }
      
      // 预览数据只取前 5 行 5 列
      if (rowIndex < 5 && previewRow.length < 5) {
        previewRow.push(cellElement.innerText.trim());
      }
      
      cellIndex += colspan;
    });
    
    if (rowIndex < 5) {
      preview.push(previewRow.slice(0, 5));
    }
  });
  
  // 存储原始表格元素引用（使用 data 属性传递索引）
  const tableId = 'table-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  (table as HTMLElement).dataset.exportId = tableId;
  
  const cols = rows.length > 0 
    ? Math.max(...Array.from(rows).map(r => r.querySelectorAll('th, td').length))
    : 0;
  
  return {
    id: tableId,
    index: 0,
    name: getTableName(table),
    rows: rows.length,
    cols,
    element: table,
    preview,
  };
}

/**
 * 识别页面中的所有表格
 */
export function identifyTables(): TableData[] {
  const tables = Array.from(document.querySelectorAll('table'));
  
  return tables
    .filter(table => {
      // 过滤掉隐藏的表格
      const style = window.getComputedStyle(table);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
      }
      
      // 过滤掉没有内容的表格
      const rows = table.querySelectorAll('tr');
      return rows.length > 0;
    })
    .map((table, index) => {
      const data = extractTableData(table as HTMLTableElement);
      data.index = index;
      return data;
    });
}

/**
 * 获取表格的完整数据（用于导出）
 */
export function getFullTableData(tableId: string): TableData | null {
  const table = document.querySelector(`[data-export-id="${tableId}"]`) as HTMLTableElement;
  if (!table) return null;
  
  return extractTableData(table);
}
