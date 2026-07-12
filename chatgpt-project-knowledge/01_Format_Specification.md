# AI 内容包规范

AI 内容包是 ToMemo Web Editor 的导入格式，不是手机 ToMemo 的最终配置。

```json
{
  "format": "tomemo-content-package",
  "version": "1.0",
  "packageName": "内容包名称",
  "suggestedCategory": { "name": "建议分类", "color": "5A656FFF" },
  "items": [
    { "title": "Memo 标题", "content": "Memo 正文" }
  ]
}
```

`packageName` 必须非空，`items` 必须是非空数组，每项必须同时有字符串 `title` 和 `content`。换行必须写成合法 JSON 的 `\n`。颜色为不带 `#` 的八位 `RRGGBBAA`。

禁止输出 `id`、`categoryId`、`createdAt`、`updatedAt`、`priority`、`exportDate` 或 ToMemo 顶层 `categories/notes`。允许的动态变量仅为 `{{CLIPBOARD}}` 和 `{{CURSOR}}`。

## 两种网页工作方式

1. 导入现有配置：内容包合并到已有分类或新分类，导出后手机按 ID 合并。
2. 新建空白配置：网页从零创建符合 ToMemo `1.0` 的分类和 Memo，导出后以全新 ID 添加到手机，不影响既有内容。

AI 内容包在两种方式中完全相同。
