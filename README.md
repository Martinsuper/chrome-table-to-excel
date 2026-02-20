# Table to Excel Exporter

📊 一款功能强大的浏览器插件，用于将网页中的表格导出为 Excel 文件，保留原始格式和样式。

## 功能特性

- ✅ **自动识别表格** - 自动检测网页中的所有表格
- ✅ **保留格式样式** - 导出时保留字体、颜色、边框等样式
- ✅ **多表格选择** - 支持选择单个或多个表格进行导出
- ✅ **自定义文件名** - 允许用户自定义导出文件名（自动添加时间戳）
- ✅ **全选功能** - 一键选择/取消选择所有表格
- ✅ **数据预览** - 提供表格数据预览功能
- ✅ **多浏览器支持** - 兼容 Chrome、Firefox、Edge 等主流浏览器

## 技术栈

- **框架**: [WXT](https://wxt.dev/) + [Vue 3](https://vuejs.org/)
- **Excel 库**: [SheetJS (xlsx)](https://sheetjs.com/)
- **构建工具**: Vite
- **语言**: TypeScript

## 安装指南

### 方式一：从 Chrome 网上应用店安装（推荐）

> 待发布

### 方式二：手动安装（开发版本）

1. **下载插件**
   ```bash
   git clone https://github.com/your-repo/chrome-table-to-excel.git
   cd chrome-table-to-excel
   npm install
   npm run build
   ```

2. **加载到 Chrome**
   - 打开 Chrome 浏览器
   - 访问 `chrome://extensions/`
   - 开启右上角的「开发者模式」
   - 点击「加载已解压的扩展程序」
   - 选择 `dist/chrome-mv3` 目录

3. **加载到 Edge**
   - 打开 Edge 浏览器
   - 访问 `edge://extensions/`
   - 开启左下角的「开发者模式」
   - 点击「加载未打包的扩展」
   - 选择 `dist/chrome-mv3` 目录

4. **加载到 Firefox**
   ```bash
   npm run build:firefox
   # 然后访问 about:debugging 加载临时扩展
   ```

## 使用说明

### 基本使用

1. **打开包含表格的网页**
   - 导航到任何包含 HTML 表格的网页

2. **点击插件图标**
   - 在浏览器工具栏中找到并点击 Table to Excel Exporter 图标

3. **选择表格**
   - 在弹出的窗口中，您会看到当前页面识别到的所有表格
   - 点击表格项进行选择（支持多选）

4. **设置导出选项**
   - 输入自定义文件名（可选）
   - 选择导出模式：
     - **单个文件**: 导出单个表格
     - **多个工作表**: 将多个表格导出为同一个 Excel 文件的不同工作表

5. **导出 Excel**
   - 点击「导出」按钮
   - Excel 文件将自动下载到您的默认下载文件夹

### 功能详解

#### 表格识别
- 插件会自动识别页面中所有可见的 `<table>` 元素
- 隐藏的表格（display: none 或 visibility: hidden）会被过滤
- 空表格会被自动忽略

#### 样式保留
插件会保留以下表格样式：
- 背景颜色
- 字体颜色
- 字体粗细（加粗）
- 字体样式（斜体）
- 文本装饰（下划线）
- 文本对齐方式
- 边框样式
- 单元格合并（colspan/rowspan）

#### 数据预览
- 选中表格后，会显示前 5 行 5 列的数据预览
- 帮助您确认选择了正确的表格

## 开发指南

### 环境要求

- Node.js >= 18.17.0（推荐 v20+）
- npm >= 9.0.0

### 开发命令

```bash
# 进入项目目录
cd chrome-table-to-excel

# 安装依赖
npm install

# 开发模式（Chrome）
npm run dev

# 开发模式（Firefox）
npm run dev:firefox

# 生产构建（Chrome）
npm run build

# 生产构建（Firefox）
npm run build:firefox

# 打包为 ZIP 文件
npm run zip

# 打包为 ZIP 文件（Firefox）
npm run zip:firefox
```

### 项目结构

```
chrome-table-to-excel/
├── entrypoints/
│   ├── popup/              # 弹出窗口界面
│   │   ├── App.vue         # 主组件
│   │   ├── main.ts         # 入口文件
│   │   ├── components/     # Vue 组件
│   │   ├── utils/          # 工具函数
│   │   └── styles/         # 样式文件
│   ├── content/            # 内容脚本
│   │   ├── index.ts        # Content Script 入口
│   │   ├── tableRecognizer.ts  # 表格识别模块
│   │   └── excelExporter.ts    # Excel 导出模块
│   └── background/         # 后台脚本
│       └── index.ts        # Background Service Worker
├── public/                 # 静态资源
│   └── icon-*.png          # 插件图标
├── icon-generator.html     # 图标生成工具
├── wxt.config.ts           # WXT 配置文件
├── tsconfig.json           # TypeScript 配置
├── package.json            # 项目依赖
└── README.md               # 项目文档
```

### 核心模块说明

#### 表格识别模块 (tableRecognizer.ts)

```typescript
// 识别页面中的所有表格
import { identifyTables } from './tableRecognizer';

const tables = identifyTables();
// 返回：TableData[] 包含表格 ID、名称、行列数、预览数据等
```

#### Excel 导出模块 (excelExporter.ts)

```typescript
// 导出单个表格
import { exportTableToExcel } from './excelExporter';

exportTableToExcel(tableData, '我的表格.xlsx');

// 导出多个表格
import { exportMultipleTables } from './excelExporter';

exportMultipleTables(tablesArray, '多个表格.xlsx');
```

## 常见问题

### Q: 为什么某些表格无法识别？
A: 插件只会识别可见的表格。如果表格被 CSS 隐藏（display: none 或 visibility: hidden），或者表格位于 iframe 内部，可能无法被识别。

### Q: 导出的 Excel 文件样式不完整？
A: 某些复杂的 CSS 样式（如渐变背景、阴影等）可能无法完全转换为 Excel 样式。插件会尽力保留基本样式。

### Q: 如何处理大型表格？
A: 插件支持导出大型表格，但非常大的表格（数千行）可能需要更长的处理时间。建议分批导出。

### Q: 支持导出哪些格式的 Excel 文件？
A: 目前支持导出为 .xlsx 格式（Excel 2007+），这是最常用的 Excel 格式。

### Q: 插件是否安全？
A: 是的，插件：
- 不会收集或上传任何用户数据
- 所有处理都在本地完成
- 不需要额外的网络权限
- 符合浏览器的安全规范

### Q: 如何在 Firefox 中使用？
A: Firefox 版本正在开发中。由于 Manifest V3 支持差异，某些功能可能有所不同。请使用 `npm run build:firefox` 构建 Firefox 专用版本。

## 更新日志

### v1.1.0 (2026-02-20)
- ✨ 新增全选功能，一键选择/取消选择所有表格
- ✨ 导出文件名自动添加时间戳（格式：YYYYMMDD_HHMMSS）
- 🐛 修复表格数据导出问题
- 🐛 修复嵌套表格识别问题

### v1.0.0 (2026-02-20)
- 🎉 首次发布
- ✨ 支持识别和导出网页表格
- ✨ 保留表格样式和格式
- ✨ 支持多表格选择和导出
- ✨ 提供数据预览功能
- 🎨 美观的 Vue 3 用户界面

## 计划功能

- [ ] 支持导出为 CSV 格式
- [ ] 支持自定义导出范围（选择特定行列）
- [ ] 支持表格截图功能
- [ ] 支持批量导出所有表格
- [ ] 支持自定义样式映射
- [ ] 支持导出到 Google Sheets
- [ ] 添加快捷键支持
- [ ] 支持导出进度显示

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 技术支持

如有问题或建议，请通过以下方式联系：

- 📧 Email: your-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/chrome-table-to-excel/issues)
- 📖 文档：[在线文档](https://github.com/your-repo/chrome-table-to-excel/wiki)

## 致谢

感谢以下开源项目：

- [WXT](https://wxt.dev/) - 下一代 Web 扩展开发框架
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [SheetJS](https://sheetjs.com/) - Excel 文件处理库

---

**Made with ❤️ by martin**
