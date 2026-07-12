# ToMemo Web Editor

面向 ToMemo 的本地优先配置工作台：在桌面浏览器中可视化管理分类与 Memo，将 ChatGPT 等 AI 生成的结构化内容安全转换为真实 ToMemo 配置，并完成可验证的手机端回导。

[![Release](https://img.shields.io/github/v/release/yuniancong/ToMemo-Web-Editor)](https://github.com/yuniancong/ToMemo-Web-Editor/releases)
[![License](https://img.shields.io/github/license/yuniancong/ToMemo-Web-Editor)](LICENSE)
[![React](https://img.shields.io/badge/React-19-149ECA)](https://react.dev/)
[![Local First](https://img.shields.io/badge/data-local--first-1769E0)](#数据安全)

> 本项目是社区工具，与 ToMemo 官方无隶属关系。ToMemo 官网：https://tomemo.top/

## 特点

- 导入 ToMemo 手机端导出的完整 JSON。
- 不依赖原配置，直接从空白配置开始生成。
- 粘贴 JSON 时自动识别完整配置或 AI 内容包。
- 三栏式分类、Memo 列表和正文编辑界面。
- Command 点击追加选择、Shift 点击连续选择、Command-A 全选。
- 批量移动、复制、删除、标题处理和 AI 内容包导出。
- 按标题、创建时间、更新时间或原始顺序查看。
- 拖动单条或多条 Memo 到插入线位置，并将顺序持久化到最终配置。
- 插入已验证的 `{{CLIPBOARD}}` 和 `{{CURSOR}}` 动态变量。
- 本地自动保存、撤销和重做。
- 导出前检查 UUID、颜色、时间和分类引用。
- 未识别字段无损保留；未验证的配置版本只读。
- PWA 支持，可安装并离线使用。
- 附带 ChatGPT Projects 知识库模板。

## 数据安全

所有解析、编辑、保存和导出均在浏览器本地完成。项目没有服务器、账号系统、遥测、远程数据库或内置 AI API。

请注意：浏览器会在本地存储当前工作区。使用公共电脑时，请在完成后清除对应站点数据。

## 快速开始

需要 Node.js 20 或更高版本。

```bash
git clone https://github.com/yuniancong/ToMemo-Web-Editor.git
cd ToMemo-Web-Editor
npm install
npm run dev
```

打开终端显示的本地地址，通常为：

```text
http://localhost:5173
```

### 生产构建

```bash
npm test
npm run build
npm run preview
```

静态生产文件位于 `dist/`。

## 使用方法

### 方式一：编辑已有 ToMemo 配置

1. 在手机 ToMemo 中导出全部 Memo 和分类的 JSON。
2. 打开网页，点击“导入配置”，选择导出的 JSON；也可以拖放文件。
3. 在左侧选择分类，在中间选择 Memo，在右侧编辑标题、正文和所属分类。
4. 点击“校验”，确认结构有效。
5. 点击“导出 ToMemo”，将生成的 JSON 导回手机。

### 方式二：从零创建配置

1. 点击“新建空白配置”。
2. 创建或重命名分类，添加 Memo。
3. 编辑完成后校验并导出。
4. 导入手机后，全新 ID 会作为新数据加入，不影响已有内容。

### 方式三：直接粘贴 JSON

点击顶部“粘贴 JSON”。同一入口会自动识别：

- 完整 ToMemo 配置：包含 `categories`、`notes`、`exportDate`、`version`。
- AI 内容包：`format` 为 `tomemo-content-package`。

如果粘贴的是 AI 内容包且当前没有工作区，网页会自动创建空白配置并进入导入预览。

### AI 内容包格式

```json
{
  "format": "tomemo-content-package",
  "version": "1.0",
  "packageName": "常用回复",
  "suggestedCategory": {
    "name": "回复模板",
    "color": "4F7CFFFF"
  },
  "items": [
    {
      "title": "确认收到",
      "content": "好的，已经收到。"
    }
  ]
}
```

AI 不需要、也不应该生成 UUID、`categoryId`、创建时间或更新时间；网页会在确认导入时生成符合真实 ToMemo 配置的内部字段。

导入器会尝试修复 AI 常见的 JSON 语法瑕疵，包括 shell 命令路径中未转义的双引号。知识库仍要求模型优先生成严格合法的 JSON，自动修复仅作为容错机制。

批量导入时，网页会按页面从上到下为新 Memo 生成相差 1 秒的阶梯时间，使 ToMemo 按最新时间排序后的顺序与网页预览一致。

### ChatGPT Projects

仓库中的 `chatgpt-project-knowledge/` 是完整知识库：

1. 新建一个 ChatGPT Project。
2. 上传该目录中的全部文件。
3. 将 `00_Project_Instructions.txt` 全文复制到 Project Instructions。
4. 让 ChatGPT 生成所需内容。
5. 把返回 JSON 粘贴到网页的“粘贴 JSON”入口。
6. 预览并确认导入，最后导出 ToMemo 配置。

也可以直接使用 `release/ToMemo-ChatGPT-Projects-Knowledge.zip`。

## ToMemo 导入语义

真实手机测试确认：

- 相同 ID 的分类或 Memo 会覆盖已有记录。
- 全新 ID 会新增为独立记录。
- 使用本工具生成的验收配置已成功导入，没有干扰手机中原有数据。

删除分类时，本工具会同时删除该分类下的全部 Memo，不会自动移动到其他分类。

### 排序如何持久化

网页显示顺序来自配置中的 `notes` 数组，而 ToMemo 手机端还会依据时间排序。手动拖动后，本工具会同时：

1. 改写当前分类在 `notes` 数组中的顺序；
2. 按页面从上到下生成相差 1 秒的阶梯时间；
3. 保持其他分类的 Memo 和时间不变。

因此导出的配置在手机 ToMemo 中仍能保持拖动后的顺序。

## 技术设计

- React + TypeScript + Vite。
- 独立 ToMemo codec，负责结构、引用、颜色、UUID 和时间校验。
- 独立 AI 内容包 codec，不允许 AI 直接生成 ToMemo 内部标识。
- 浏览器本地持久化，无服务端依赖。
- Service Worker 提供同源资源离线缓存。
- Vitest 与 Testing Library 覆盖配置往返、AI 导入、级联删除、排序和快捷键行为。

## 已确认的 ToMemo 1.0 格式

- 顶层字段：`categories`、`exportDate`、`notes`、`version`。
- 分类字段：`colorAsHex`、`id`、`name`、`priority`。
- Memo 字段：`categoryId`、`content`、`createdAt`、`id`、`title`、`updatedAt`。
- ID：大写 UUID。
- 颜色：不带 `#` 的八位 `RRGGBBAA`。
- 时间：UTC ISO 8601。

## 测试

```bash
npm test
npm run build
```

项目使用真实导出的脱敏衍生样本验证 codec，并使用浏览器工作流测试导入、文本粘贴、AI 内容包识别和空白配置生成。

## 目录

```text
src/                       应用和配置 codec
chatgpt-project-knowledge/ ChatGPT Projects 知识库
acceptance/                手机回导验收配置与记录
release/                   可直接分发的 ZIP
docs/                      架构和项目约定
```

## 开源许可

[MIT](LICENSE)
