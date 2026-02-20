# 发布指南

## 如何发布新版本

### 1. 更新版本号

在 `package.json` 中更新版本号：

```json
{
  "name": "chrome-table-to-excel",
  "version": "1.2.0",  // 更新这里
  ...
}
```

### 2. 更新 README 中的版本记录

在 `README.md` 的更新日志部分添加新版本信息：

```markdown
## 更新日志

### v1.2.0 (2026-02-20)
- 新增功能...
- 修复问题...
```

### 3. 提交更改

```bash
git add .
git commit -m "chore: 发布 v1.2.0"
git push origin main
```

### 4. 创建并推送 Tag

```bash
# 创建带注释的 tag
git tag -a v1.2.0 -m "Release v1.2.0"

# 或者创建轻量 tag
git tag v1.2.0

# 推送 tag 到远程仓库
git push origin v1.2.0
```

### 5. 等待 GitHub Actions 自动发布

推送 tag 后，GitHub Actions 会自动：
- ✅ 安装依赖
- ✅ 构建 Chrome 和 Firefox 扩展
- ✅ 创建 ZIP 压缩包
- ✅ 创建 GitHub Release
- ✅ 上传构建产物

### 6. 检查发布结果

访问 https://github.com/Martinsuper/chrome-table-to-excel/releases 查看发布状态。

---

## 版本号规范

遵循 [Semantic Versioning](https://semver.org/) 规范：

- **MAJOR.MINOR.PATCH** (主版本号。次版本号。修订号)
- **MAJOR**: 不兼容的 API 变更
- **MINOR**: 向后兼容的功能性新增
- **PATCH**: 向后兼容的问题修正

### 示例

- `v1.0.0` - 初始发布
- `v1.1.0` - 新增功能
- `v1.1.1` - 修复 bug
- `v2.0.0` - 重大更新

---

## 手动下载构建产物

如果需要手动下载构建好的扩展：

1. 访问 https://github.com/Martinsuper/chrome-table-to-excel/actions
2. 选择对应的工作流运行
3. 在页面底部的 "Artifacts" 区域下载

---

## 故障排查

### 构建失败

检查 GitHub Actions 的日志输出，常见问题：
- 依赖安装失败：检查 `package.json` 是否正确
- 构建错误：检查 TypeScript 类型错误
- 内存不足：尝试增加 GitHub Actions 的内存限制

### Release 创建失败

确保：
- Tag 名称以 `v` 开头（如 `v1.2.0`）
- 有权限创建 Release
- `GITHUB_TOKEN` 权限正确
