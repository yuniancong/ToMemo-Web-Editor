# 正确示例

```json
{
  "format": "tomemo-content-package",
  "version": "1.0",
  "packageName": "常用确认回复",
  "suggestedCategory": { "name": "常用回复", "color": "4F7CFFFF" },
  "items": [
    { "title": "确认收到", "content": "好的，已经收到，我会尽快处理。" },
    { "title": "处理剪贴板", "content": "请处理：\n{{CLIPBOARD}}\n{{CURSOR}}" }
  ]
}
```

# 常见错误

- 输出完整 ToMemo `categories/notes` 或自行生成 UUID。
- 颜色写成 `#4F7CFF`，正确形式为 `4F7CFFFF`。
- 使用未经验证的 `{{DATE}}` 等变量。
- 在 JSON 前后添加无关说明。
