# 输出前自检

1. 是否为可直接解析的 JSON？
2. `format` 是否为 `tomemo-content-package`，`version` 是否为字符串 `1.0`？
3. `packageName` 和 `items` 是否非空？
4. 每项是否包含字符串 `title` 和 `content`？
5. 是否没有 UUID、时间、分类 ID、优先级等 ToMemo 内部字段？
6. 换行、引号和反斜线是否正确转义？
7. 动态变量是否仅使用 `{{CLIPBOARD}}`、`{{CURSOR}}`？
8. JSON 前后是否没有无关说明？
