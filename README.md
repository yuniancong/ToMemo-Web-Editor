# ToMemo Web Editor

本地优先的 ToMemo 配置可视化编辑器。配置解析、编辑、AI 内容包合并和导出均在浏览器中进行。

## 启动与构建

```bash
npm install
npm run dev
npm test
npm run build
```

“粘贴 JSON”入口会自动识别完整 ToMemo 配置和 ChatGPT 生成的 AI 内容包；内容包在没有工作区时会自动创建空白配置并进入预览。导入后可以编辑分类和 Memo、搜索排序、Command/Shift 多选、批量移动复制删除、插入动态变量、撤销重做。点击“校验”后导出最终配置。

当前确认支持 ToMemo `1.0`；未知字段原样保留，未验证版本禁止导出。ChatGPT Projects 素材位于 `chatgpt-project-knowledge/`，手机验收文件位于 `acceptance/`。
