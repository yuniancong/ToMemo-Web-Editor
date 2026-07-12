import { useMemo, useRef, useState } from 'react'
import {
  Braces,
  CheckCircle2,
  ChevronDown,
  Download,
  FileJson,
  FolderOpen,
  Import,
  ListFilter,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react'
import {
  exportConfiguration,
  parseConfiguration,
  rgbaHexToCss,
  type ToMemoConfiguration,
} from './domain/tomemo'

type LoadedWorkspace = {
  fileName: string
  configuration: ToMemoConfiguration
  warnings: string[]
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
}

function downloadConfiguration(configuration: ToMemoConfiguration) {
  const exported = exportConfiguration(configuration)
  const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ToMemo-Export-${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [workspace, setWorkspace] = useState<LoadedWorkspace | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showValidation, setShowValidation] = useState(false)

  const selectedCategory = workspace?.configuration.categories.find(
    (category) => category.id === selectedCategoryId,
  )
  const visibleNotes = useMemo(
    () =>
      workspace?.configuration.notes.filter(
        (note) => !selectedCategoryId || note.categoryId === selectedCategoryId,
      ) ?? [],
    [workspace, selectedCategoryId],
  )
  const selectedNote = workspace?.configuration.notes.find((note) => note.id === selectedNoteId)

  async function loadFile(file: File) {
    setError(null)
    const result = parseConfiguration(await file.text())
    if (!result.ok) {
      setError(result.errors.join('；'))
      return
    }
    const firstCategory = result.configuration.categories[0]
    const firstNote = result.configuration.notes.find((note) => note.categoryId === firstCategory?.id)
    setWorkspace({ fileName: file.name, configuration: result.configuration, warnings: result.warnings })
    setShowValidation(false)
    setSelectedCategoryId(firstCategory?.id ?? null)
    setSelectedNoteId(firstNote?.id ?? null)
  }

  const counts = workspace
    ? `${workspace.configuration.categories.length} 个分类 · ${workspace.configuration.notes.length} 条 Memo`
    : '尚未载入配置'

  const dropHandlers = {
    onDragEnter: (event: React.DragEvent) => { event.preventDefault(); setIsDragging(true) },
    onDragOver: (event: React.DragEvent) => event.preventDefault(),
    onDragLeave: () => setIsDragging(false),
    onDrop: (event: React.DragEvent) => {
      event.preventDefault()
      setIsDragging(false)
      const file = event.dataTransfer.files[0]
      if (file) void loadFile(file)
    },
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-group">
          <div className="brand-mark"><Braces size={17} strokeWidth={2.2} /></div>
          <div>
            <div className="brand-name">ToMemo Web Editor</div>
            <div className="workspace-name">{workspace?.fileName ?? '本地配置工作区'}</div>
          </div>
        </div>

        <div className="topbar-search" aria-hidden={!workspace}>
          <Search size={15} />
          <span>{workspace ? '搜索 Memo…' : '导入后可搜索'}</span>
          <kbd>⌘ K</kbd>
        </div>

        <div className="toolbar-actions">
          <input
            ref={inputRef}
            className="visually-hidden"
            type="file"
            accept="application/json,.json"
            aria-label="导入 ToMemo 配置"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0]
              if (file) void loadFile(file)
              event.currentTarget.value = ''
            }}
          />
          <button className="button secondary" onClick={() => inputRef.current?.click()}>
            <Import size={15} /> 导入配置
          </button>
          <button className="button secondary" disabled><FileJson size={15} /> AI 内容包</button>
          <button className="button secondary" disabled={!workspace} onClick={() => setShowValidation((value) => !value)}><ShieldCheck size={15} /> 校验</button>
          <button
            className="button primary"
            disabled={!workspace || workspace.warnings.length > 0}
            onClick={() => workspace && downloadConfiguration(workspace.configuration)}
          >
            <Download size={15} /> 导出 ToMemo
          </button>
        </div>
      </header>

      {error && <div className="error-banner" role="alert">{error}</div>}
      {workspace && workspace.warnings.length > 0 && (
        <div className="warning-banner" role="alert">
          {workspace.warnings.join('；')}。为避免损坏数据，当前版本仅可查看，不能导出。
        </div>
      )}
      {showValidation && workspace && (
        <section className="validation-popover" aria-label="配置校验报告">
          <div className="validation-title"><ShieldCheck size={16} /> 配置校验报告</div>
          <strong>{workspace.warnings.length > 0 ? '兼容性警告' : '结构校验通过'}</strong>
          <p>{workspace.configuration.categories.length} 个分类、{workspace.configuration.notes.length} 条 Memo；ID、颜色、时间和分类引用均符合已确认规则。</p>
          {workspace.warnings.map((warning) => <p className="validation-warning" key={warning}>{warning}</p>)}
        </section>
      )}

      {!workspace ? (
        <section
          className={`empty-state ${isDragging ? 'dragging' : ''}`}
          {...dropHandlers}
        >
          <div className="empty-icon"><UploadCloud size={30} /></div>
          <h1>选择一份 ToMemo 配置开始</h1>
          <p>导入手机端导出的 JSON 文件。解析和编辑均在当前浏览器本地完成。</p>
          <button className="button primary large" onClick={() => inputRef.current?.click()}>
            <FolderOpen size={17} /> 选择 JSON 文件
          </button>
          <div className="drop-hint">也可以将文件拖放到这里</div>
          <div className="privacy-note"><ShieldCheck size={14} /> 文件不会上传到服务器</div>
        </section>
      ) : (
        <section className={`workspace-grid ${isDragging ? 'dragging' : ''}`} {...dropHandlers}>
          <aside className="category-pane panel">
            <div className="pane-header">
              <div><span className="eyeline">配置结构</span><h2>分类</h2></div>
              <button className="icon-button" disabled aria-label="新建分类"><Plus size={16} /></button>
            </div>
            <div className="category-list">
              {workspace.configuration.categories
                .toSorted((a, b) => a.priority - b.priority)
                .map((category) => {
                  const count = workspace.configuration.notes.filter((note) => note.categoryId === category.id).length
                  const selected = category.id === selectedCategoryId
                  return (
                    <button
                      key={category.id}
                      className={`category-row ${selected ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedCategoryId(category.id)
                        setSelectedNoteId(workspace.configuration.notes.find((note) => note.categoryId === category.id)?.id ?? null)
                      }}
                    >
                      <span className="color-dot" style={{ backgroundColor: rgbaHexToCss(category.colorAsHex) }} />
                      <span className="category-name">{category.name || '未命名分类'}</span>
                      <span className="count">{count}</span>
                    </button>
                  )
                })}
            </div>
            <div className="pane-footer">按 ToMemo 优先级排列</div>
          </aside>

          <section className="memo-pane panel">
            <div className="pane-header memo-heading">
              <div>
                <span className="eyeline">{visibleNotes.length} 条 Memo</span>
                <h2>{selectedCategory?.name ?? '全部 Memo'}</h2>
              </div>
              <div className="header-tools">
                <button className="compact-control"><ListFilter size={14} /> 原始顺序 <ChevronDown size={13} /></button>
                <button className="icon-button" aria-label="更多选项"><MoreHorizontal size={16} /></button>
              </div>
            </div>
            <div className="memo-list">
              {visibleNotes.map((note, index) => (
                <button
                  className={`memo-row ${note.id === selectedNoteId ? 'selected' : ''}`}
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  aria-label={`${note.title || '无标题'} Memo`}
                >
                  <span className="memo-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="memo-body">
                    <span className="memo-title">{note.title || note.content.split('\n')[0] || '无标题'}</span>
                    <span className="memo-excerpt">{note.content || '空正文'}</span>
                    <span className="memo-time">更新于 {formatDate(note.updatedAt)}</span>
                  </span>
                </button>
              ))}
              {visibleNotes.length === 0 && (
                <div className="inline-empty">这个分类还没有 Memo</div>
              )}
            </div>
          </section>

          <section className="detail-pane panel">
            {selectedNote ? (
              <>
                <div className="pane-header detail-heading">
                  <div><span className="eyeline">Memo 详情</span><h2>{selectedNote.title || '无标题'}</h2></div>
                  <div className="readonly-state"><CheckCircle2 size={14} /> 已通过结构校验</div>
                </div>
                <div className="detail-form">
                  <label className="field-label" htmlFor="memo-title">标题</label>
                  <input id="memo-title" className="text-input" value={selectedNote.title} readOnly />

                  <label className="field-label" htmlFor="memo-category">所属分类</label>
                  <div className="select-display" id="memo-category">
                    <span className="color-dot" style={{ backgroundColor: rgbaHexToCss(selectedCategory?.colorAsHex ?? '777777FF') }} />
                    {workspace.configuration.categories.find((category) => category.id === selectedNote.categoryId)?.name}
                    <ChevronDown size={14} />
                  </div>

                  <div className="content-label-row">
                    <label className="field-label" htmlFor="memo-content">正文</label>
                    <div className="variable-tools">
                      <button disabled><span className="variable-symbol">⌘</span> 剪贴板</button>
                      <button disabled><span className="variable-symbol">⌖</span> 光标位置</button>
                    </div>
                  </div>
                  <textarea id="memo-content" className="content-editor" value={selectedNote.content} readOnly />
                  <div className="metadata-grid">
                    <div><span>创建时间</span><strong>{selectedNote.createdAt}</strong></div>
                    <div><span>更新时间</span><strong>{selectedNote.updatedAt}</strong></div>
                    <div className="wide"><span>Memo ID</span><strong>{selectedNote.id}</strong></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="inline-empty detail-empty">选择一条 Memo 查看内容</div>
            )}
          </section>
        </section>
      )}

      <footer className="statusbar">
        <span>{counts}</span>
        <span className="status-separator" />
        <span>版本 {workspace?.configuration.version ?? '—'}</span>
        <span className="status-spacer" />
        {workspace ? (
          workspace.warnings.length === 0
            ? <span className="valid-status"><CheckCircle2 size={13} /> 配置结构有效</span>
            : <span className="warning-status">版本尚未验证</span>
        ) : <span>等待导入</span>}
      </footer>
    </main>
  )
}
