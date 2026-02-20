<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" fill="white" fill-opacity="0.2"/>
              <path d="M3 9H21" stroke="white" stroke-width="2"/>
              <path d="M3 15H21" stroke="white" stroke-width="2"/>
              <path d="M9 3V21" stroke="white" stroke-width="2"/>
              <path d="M15 3V21" stroke="white" stroke-width="2"/>
            </svg>
          </div>
          <div class="title-group">
            <h1>Table to Excel</h1>
            <p class="subtitle">一键导出网页表格</p>
          </div>
        </div>
        <div class="header-badge">v1.1.0</div>
      </div>
    </header>

    <main class="main">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <p class="loading-text">正在识别表格...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error">
        <div class="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#F56565" stroke-width="1.5" fill="#FFF5F5"/>
            <path d="M12 7V13" stroke="#F56565" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="17" r="1" fill="#F56565"/>
          </svg>
        </div>
        <p class="error-text">{{ error }}</p>
        <button @click="refreshTables" class="btn btn-retry">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 4V9H4.58C5.77 6.65 8.24 5 11 5C14.76 5 17.93 7.58 18.8 11.2M20 20V15H19.42C18.23 17.35 15.76 19 13 19C9.24 19 6.07 16.42 5.2 12.8M4.58 9H4V9.05" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          重新加载
        </button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="tables.length === 0" class="empty">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="#CBD5E0" stroke-width="1.5"/>
            <path d="M3 9H21" stroke="#CBD5E0" stroke-width="1.5"/>
            <path d="M9 3V21" stroke="#CBD5E0" stroke-width="1.5"/>
            <path d="M15 3V21" stroke="#CBD5E0" stroke-width="1.5"/>
            <circle cx="12" cy="12" r="3" fill="#E2E8F0"/>
          </svg>
        </div>
        <p class="empty-text">当前页面没有找到表格</p>
        <p class="empty-hint">试试打开包含表格的网页</p>
      </div>

      <!-- 表格列表 -->
      <div v-else class="table-list">
        <div class="section-header">
          <div class="section-title">
            <span>选择表格</span>
            <div class="title-actions">
              <label class="select-all" @click.stop>
                <div class="checkbox-wrapper" :class="{ checked: isAllSelected }">
                  <svg v-if="isAllSelected" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span>全选</span>
              </label>
            </div>
          </div>
          <div class="selected-count">
            <span class="count-number">{{ selectedTables.size }}</span>
            <span class="count-total">/ {{ tables.length }}</span>
          </div>
        </div>

        <!-- 表格选择列表 -->
        <div class="tables">
          <div
            v-for="table in tables"
            :key="table.id"
            class="table-item"
            :class="{ selected: selectedTables.has(table.id) }"
            @click="toggleTable(table.id)"
          >
            <div class="table-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M3 9H21" stroke="currentColor" stroke-width="2"/>
                <path d="M9 3V21" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="table-info">
              <div class="table-name">{{ table.name }}</div>
              <div class="table-meta">
                <span class="meta-item">{{ table.rows }} 行</span>
                <span class="meta-divider">·</span>
                <span class="meta-item">{{ table.cols }} 列</span>
              </div>
            </div>
            <div class="table-preview" v-if="table.preview && table.preview.length > 0">
              <div class="preview-grid">
                <span v-for="(row, i) in table.preview.slice(0, 2)" :key="i" class="preview-cell">
                  {{ row[0] || ' ' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 导出选项 -->
        <div class="export-options">
          <div class="form-group">
            <label for="filename" class="form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              文件名
            </label>
            <div class="input-wrapper">
              <input
                id="filename"
                v-model="filename"
                type="text"
                class="input"
                placeholder="输入文件名"
              />
              <span class="input-suffix">.xlsx</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
              </svg>
              导出模式
            </label>
            <div class="radio-group">
              <label class="radio-card" :class="{ active: exportMode === 'single' }">
                <input
                  type="radio"
                  value="single"
                  v-model="exportMode"
                  :disabled="selectedTables.size !== 1"
                />
                <div class="radio-content">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M3 9H21" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span>单个文件</span>
                </div>
              </label>
              <label class="radio-card" :class="{ active: exportMode === 'multiple' }">
                <input
                  type="radio"
                  value="multiple"
                  v-model="exportMode"
                  :disabled="selectedTables.size < 2"
                />
                <div class="radio-content">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="7" height="18" rx="1" stroke="currentColor" stroke-width="2"/>
                    <rect x="14" y="3" width="7" height="18" rx="1" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span>多个工作表</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- 预览 -->
        <div v-if="previewData && previewData.length > 0" class="preview-section">
          <div class="preview-header">
            <span class="preview-title">数据预览</span>
            <span class="preview-hint">前 5 行 5 列</span>
          </div>
          <div class="preview-table-wrapper">
            <table class="preview-table">
              <tbody>
                <tr v-for="(row, rowIndex) in previewData" :key="rowIndex">
                  <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell || ' ' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">
      <button
        v-if="selectedTables.size > 0"
        @click="exportToExcel"
        class="btn btn-primary btn-export"
        :disabled="exporting"
      >
        <svg v-if="!exporting" width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.25"/>
          <path d="M12 2C17.5228 2 22 6.47715 22 12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
        {{ exporting ? '导出中...' : `导出 ${selectedTables.size} 个表格` }}
      </button>
      <div v-else class="footer-hint">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="8" r="1" fill="currentColor"/>
        </svg>
        <span>请选择要导出的表格</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';

interface TableData {
  id: string;
  index: number;
  name: string;
  rows: number;
  cols: number;
  preview: string[][];
}

const loading = ref(true);
const error = ref<string | null>(null);
const tables = ref<TableData[]>([]);
const selectedTables = reactive(new Set<string>());
const filename = ref('表格导出');
const exportMode = ref<'single' | 'multiple'>('single');
const exporting = ref(false);
const previewData = computed(() => {
  const firstSelected = Array.from(selectedTables)[0];
  return tables.value.find(t => t.id === firstSelected)?.preview || null;
});

// 是否全选
const isAllSelected = computed(() => {
  return tables.value.length > 0 && selectedTables.size === tables.value.length;
});

// 全选/取消全选
function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedTables.clear();
  } else {
    tables.value.forEach(t => selectedTables.add(t.id));
  }
  if (selectedTables.size === 0) {
    // 不改变模式
  } else if (selectedTables.size === 1) {
    exportMode.value = 'single';
  } else {
    exportMode.value = 'multiple';
  }
}

// 生成带时间戳的文件名
function generateFilename(): string {
  let baseName = filename.value.trim() || '表格导出';
  if (baseName.toLowerCase().endsWith('.xlsx')) {
    baseName = baseName.slice(0, -5);
  }
  
  const now = new Date();
  const timestamp = now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    '_' +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
  
  return `${baseName}_${timestamp}.xlsx`;
}

// 获取当前标签页
async function getCurrentTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}

// 加载页面中的表格
async function loadTables() {
  loading.value = true;
  error.value = null;

  try {
    const tab = await getCurrentTab();
    if (!tab?.id) {
      throw new Error('无法获取当前标签页');
    }

    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getTables' });
    
    if (!response.success) {
      throw new Error(response.error || '获取表格失败');
    }

    tables.value = response.tables || [];

    if (tables.value.length > 0) {
      selectedTables.add(tables.value[0].id);
      exportMode.value = 'single';
    }
  } catch (e) {
    console.error('加载表格失败:', e);
    error.value = e instanceof Error ? e.message : '加载失败，请刷新页面后重试';
  } finally {
    loading.value = false;
  }
}

function refreshTables() {
  loadTables();
}

function toggleTable(tableId: string) {
  if (selectedTables.has(tableId)) {
    selectedTables.delete(tableId);
  } else {
    selectedTables.add(tableId);
  }

  if (selectedTables.size === 0) {
    // 不改变模式
  } else if (selectedTables.size === 1) {
    exportMode.value = 'single';
  } else {
    exportMode.value = 'multiple';
  }
}

async function exportToExcel() {
  if (selectedTables.size === 0) return;

  exporting.value = true;

  try {
    const tab = await getCurrentTab();
    if (!tab?.id) {
      throw new Error('无法获取当前标签页');
    }

    const selectedIds = Array.from(selectedTables);
    const finalFilename = generateFilename();

    let response;
    
    if (selectedIds.length === 1) {
      response = await chrome.tabs.sendMessage(tab.id, {
        action: 'exportTable',
        tableId: selectedIds[0],
        filename: finalFilename,
      });
    } else {
      response = await chrome.tabs.sendMessage(tab.id, {
        action: 'exportMultiple',
        tableIds: selectedIds,
        filename: finalFilename,
      });
    }

    if (!response.success) {
      throw new Error(response.error || '导出失败');
    }

    setTimeout(() => window.close(), 500);
  } catch (e) {
    console.error('导出失败:', e);
    error.value = e instanceof Error ? e.message : '导出失败，请重试';
  } finally {
    exporting.value = false;
  }
}

onMounted(() => {
  loadTables();
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  width: 400px;
  min-height: 450px;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  color: #1a202c;
  background: linear-gradient(180deg, #f7fafc 0%, #ffffff 100%);
}

/* Header */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.header::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.title-group h1 {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin-bottom: 2px;
}

.subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
}

.header-badge {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

/* Main */
.main {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  gap: 16px;
}

.loading-spinner {
  position: relative;
  width: 48px;
  height: 48px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
  border-top-color: #764ba2;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.6s;
  border-top-color: #9f7aea;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #718096;
  font-size: 14px;
}

/* Error */
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  gap: 16px;
  text-align: center;
}

.error-text {
  color: #718096;
  font-size: 14px;
  max-width: 280px;
}

/* Empty */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  gap: 12px;
  text-align: center;
}

.empty-icon {
  opacity: 0.6;
}

.empty-text {
  color: #4a5568;
  font-size: 15px;
  font-weight: 500;
}

.empty-hint {
  color: #a0aec0;
  font-size: 13px;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: #2d3748;
  font-size: 15px;
}

.title-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: normal;
  color: #718096;
  cursor: pointer;
  user-select: none;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.select-all:hover {
  background: #edf2f7;
  color: #667eea;
}

.checkbox-wrapper {
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.checkbox-wrapper.checked {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

.selected-count {
  font-size: 13px;
  color: #a0aec0;
}

.count-number {
  font-weight: 600;
  color: #667eea;
}

/* Tables */
.tables {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.table-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 1px solid #edf2f7;
  transition: all 0.2s;
}

.table-item:last-child {
  border-bottom: none;
}

.table-item:hover {
  background: #f7fafc;
}

.table-item.selected {
  background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%);
  border-left: 3px solid #667eea;
  padding-left: 13px;
}

.table-icon {
  color: #a0aec0;
  flex-shrink: 0;
  transition: color 0.2s;
}

.table-item:hover .table-icon {
  color: #667eea;
}

.table-item.selected .table-icon {
  color: #667eea;
}

.table-info {
  flex: 1;
  min-width: 0;
}

.table-name {
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #a0aec0;
}

.meta-divider {
  color: #cbd5e0;
}

.table-preview {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.table-item:hover .table-preview {
  opacity: 1;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}

.preview-cell {
  font-size: 10px;
  color: #a0aec0;
  background: #f7fafc;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60px;
}

/* Export Options */
.export-options {
  background: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4a5568;
  font-size: 13px;
}

.form-label svg {
  color: #a0aec0;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input {
  width: 100%;
  padding: 10px 60px 10px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #2d3748;
  transition: all 0.2s;
  background: white;
}

.input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input::placeholder {
  color: #a0aec0;
}

.input-suffix {
  position: absolute;
  right: 12px;
  color: #a0aec0;
  font-size: 13px;
  font-weight: 500;
}

.radio-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.radio-card {
  position: relative;
  cursor: pointer;
}

.radio-card input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radio-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  color: #718096;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.radio-card:hover .radio-content {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.radio-card.active .radio-content {
  border-color: #667eea;
  background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%);
  color: #667eea;
}

.radio-card input:disabled + .radio-content {
  opacity: 0.5;
  cursor: not-allowed;
}

.radio-content svg {
  flex-shrink: 0;
}

/* Preview Section */
.preview-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
}

.preview-title {
  font-weight: 600;
  color: #4a5568;
  font-size: 13px;
}

.preview-hint {
  font-size: 12px;
  color: #a0aec0;
}

.preview-table-wrapper {
  overflow-x: auto;
  max-height: 120px;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.preview-table td {
  padding: 8px 12px;
  border: 1px solid #edf2f7;
  white-space: nowrap;
  color: #4a5568;
}

.preview-table tr:first-child td {
  background: #f7fafc;
  font-weight: 500;
}

/* Footer */
.footer {
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e2e8f0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 100%;
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.35);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.45);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary .spinner {
  animation: spin 1s linear infinite;
}

.btn-retry {
  background: #edf2f7;
  color: #4a5568;
  padding: 10px 20px;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-retry:hover {
  background: #e2e8f0;
}

.footer-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #a0aec0;
  font-size: 13px;
}

.footer-hint svg {
  color: #cbd5e0;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>
