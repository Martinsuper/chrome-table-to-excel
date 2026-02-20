/**
 * Excel 导出工具模块
 * 使用 SheetJS (xlsx) 库实现带样式的 Excel 导出
 */

import { utils, writeFile, WorkBook, WorkSheet } from 'xlsx';

interface TableCellData {
  v: any;
  t: string;
  s?: any;
}

/**
 * RGB 颜色转 Hex 格式
 */
function rgbToHex(rgb: string): string {
  if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') {
    return '#FFFFFF';
  }

  if (rgb.startsWith('#')) {
    return rgb.toUpperCase();
  }

  const rgbMatch = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!rgbMatch) {
    return '#FFFFFF';
  }

  const [, r, g, b] = rgbMatch;
  return '#' + [r, g, b].map(x => {
    const hex = parseInt(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

/**
 * 将单元格样式转换为 Excel 样式
 */
function convertCellStyle(cell: HTMLElement): any {
  const computedStyle = window.getComputedStyle(cell);
  const styles: any = {};

  // 填充色
  const bgColor = rgbToHex(computedStyle.backgroundColor);
  if (bgColor && bgColor !== '#FFFFFF') {
    styles.fill = {
      fgColor: { rgb: bgColor.slice(1).toUpperCase() },
      patternType: 'solid',
    };
  }

  // 字体颜色
  const color = rgbToHex(computedStyle.color);
  if (color && color !== '#000000') {
    styles.font = {
      color: { rgb: color.slice(1).toUpperCase() },
    };
  }

  // 字体加粗
  const fontWeight = computedStyle.fontWeight;
  if (fontWeight === 'bold' || (parseInt(fontWeight) >= 700)) {
    styles.font = { ...styles.font, bold: true };
  }

  // 斜体
  if (computedStyle.fontStyle === 'italic') {
    styles.font = { ...styles.font, italic: true };
  }

  // 下划线
  if (computedStyle.textDecoration === 'underline') {
    styles.font = { ...styles.font, underline: true };
  }

  // 对齐方式
  const textAlign = computedStyle.textAlign;
  if (textAlign) {
    styles.alignment = {
      horizontal: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'right' : 'left',
    };
  }

  return Object.keys(styles).length > 0 ? styles : null;
}

/**
 * 从 HTML 表格提取二维数组数据
 */
function extractTableData(table: HTMLTableElement): { data: any[][]; merges: any[]; maxCols: number } {
  const rows = Array.from(table.querySelectorAll('tr'));
  const data: any[][] = [];
  const merges: any[] = [];
  const rowspanMap = new Map<number, number[]>();
  let maxCols = 0;

  rows.forEach((row, rowIndex) => {
    const rowData: any[] = [];
    const currentRowSpans = rowspanMap.get(rowIndex) || [];

    let cellIndex = 0;
    const cells = Array.from(row.querySelectorAll('th, td'));

    cells.forEach((cell) => {
      const cellElement = cell as HTMLTableCellElement;

      // 处理 rowspan 占位
      while (currentRowSpans[cellIndex]) {
        rowData.push('');
        currentRowSpans[cellIndex]--;
        cellIndex++;
      }

      const colspan = cellElement.colSpan || 1;
      const rowspan = cellElement.rowSpan || 1;
      const content = cellElement.innerText.trim();

      // 创建带样式的单元格对象
      const cellData: TableCellData = {
        v: content,
        t: 's',
      };

      const style = convertCellStyle(cellElement);
      if (style) {
        cellData.s = style;
      }

      rowData.push(cellData);

      // 记录合并单元格
      if (colspan > 1 || rowspan > 1) {
        merges.push({
          s: { r: rowIndex, c: cellIndex },
          e: { r: rowIndex + rowspan - 1, c: cellIndex + colspan - 1 },
        });
      }

      // 记录 rowspan 影响
      if (rowspan > 1) {
        for (let i = 1; i < rowspan; i++) {
          const futureRowIndex = rowIndex + i;
          if (!rowspanMap.has(futureRowIndex)) {
            rowspanMap.set(futureRowIndex, []);
          }
          const futureRowSpans = rowspanMap.get(futureRowIndex)!;
          for (let j = 0; j < colspan; j++) {
            futureRowSpans[cellIndex + j] = rowspan - i;
          }
        }
      }

      cellIndex += colspan;
    });

    // 处理剩余的 rowspan 占位
    while (currentRowSpans[cellIndex]) {
      rowData.push('');
      currentRowSpans[cellIndex]--;
      cellIndex++;
    }

    if (rowData.length > maxCols) {
      maxCols = rowData.length;
    }

    data.push(rowData);
  });

  return { data, merges, maxCols };
}

/**
 * 创建带样式的工作表
 */
function createWorksheet(tableData: { data: any[][]; merges: any[]; maxCols: number }): WorkSheet {
  const ws = utils.aoa_to_sheet(tableData.data);

  // 设置合并单元格
  if (tableData.merges.length > 0) {
    ws['!merges'] = tableData.merges;
  }

  // 设置列宽
  const colWidths: { wch: number }[] = [];
  for (let i = 0; i < tableData.maxCols; i++) {
    let maxWidth = 10;
    tableData.data.forEach(row => {
      if (row[i]) {
        const cell = row[i];
        const content = typeof cell === 'object' && cell.v !== undefined ? cell.v : String(cell);
        const width = String(content).length;
        if (width > maxWidth) {
          maxWidth = Math.min(width, 50);
        }
      }
    });
    colWidths.push({ wch: maxWidth });
  }
  ws['!cols'] = colWidths;

  return ws;
}

/**
 * 导出单个表格为 Excel 文件
 */
export function exportTableToExcel(table: HTMLTableElement, filename: string = 'table.xlsx'): void {
  // 提取表格数据
  const extractedData = extractTableData(table);

  // 创建工作表
  const ws = createWorksheet(extractedData);

  // 创建新工作簿并添加工作表
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Sheet1');

  // 下载文件
  writeFile(wb, filename);
}

/**
 * 批量导出多个表格
 */
export function exportMultipleTables(tables: HTMLTableElement[], filename: string = 'tables.xlsx'): void {
  const wb = utils.book_new();

  tables.forEach((table, index) => {
    const extractedData = extractTableData(table);
    const ws = createWorksheet(extractedData);

    const sheetName = `表格${index + 1}`;
    utils.book_append_sheet(wb, ws, sheetName);
  });

  writeFile(wb, filename);
}
