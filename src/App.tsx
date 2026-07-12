import { useEffect, useMemo, useRef, useState, type DragEvent, type MouseEvent } from 'react'
import { Braces, Check, CheckCircle2, ChevronDown, Clipboard, Copy, Download, FileJson, FolderOpen, Import, ListFilter, MoreHorizontal, Move, Plus, Redo2, Search, ShieldCheck, Trash2, Undo2, UploadCloud, X } from 'lucide-react'
import { normalizeAiColor, parseAiPackage, type AiContentPackage } from './domain/aiPackage'
import { createCategory, createNote, deleteCategory, deleteNotes, duplicateConflict, moveNotes, updateNote } from './domain/editor'
import { createBlankConfiguration, exportConfiguration, parseConfiguration, rgbaHexToCss, type ToMemoConfiguration } from './domain/tomemo'

type Workspace = { fileName: string; configuration: ToMemoConfiguration; warnings: string[] }
type SortKey = 'original' | 'title' | 'createdAt' | 'updatedAt'
const STORAGE_KEY = 'tomemo-web-editor-workspace-v1'
const fmt = (value: string) => new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))

function download(name: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a'); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url)
}

export default function App() {
  const fileRef = useRef<HTMLInputElement>(null)
  const aiFileRef = useRef<HTMLInputElement>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Workspace | null } catch { return null }
  })
  const [past, setPast] = useState<ToMemoConfiguration[]>([])
  const [future, setFuture] = useState<ToMemoConfiguration[]>([])
  const [categoryId, setCategoryId] = useState<string | null>(() => workspace?.configuration.categories[0]?.id ?? null)
  const [noteId, setNoteId] = useState<string | null>(() => workspace?.configuration.notes[0]?.id ?? null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [anchor, setAnchor] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('original')
  const [ascending, setAscending] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [validation, setValidation] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiSource, setAiSource] = useState('')
  const [aiPackage, setAiPackage] = useState<AiContentPackage | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiTarget, setAiTarget] = useState('')
  const [configTextOpen, setConfigTextOpen] = useState(false)
  const [configText, setConfigText] = useState('')
  const [configTextError, setConfigTextError] = useState<string | null>(null)

  useEffect(() => { if (workspace) localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace)) }, [workspace])
  const config = workspace?.configuration
  const readOnly = !!workspace?.warnings.length
  const category = config?.categories.find((item) => item.id === categoryId)
  const note = config?.notes.find((item) => item.id === noteId)

  const notes = useMemo(() => {
    const source = (config?.notes ?? []).filter((item) => item.categoryId === categoryId)
      .filter((item) => !query || `${item.title}\n${item.content}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
    if (sort === 'original') return source
    return [...source].sort((a, b) => {
      const result = a[sort].localeCompare(b[sort], 'zh-CN', { numeric: true })
      return ascending ? result : -result
    })
  }, [config, categoryId, query, sort, ascending])

  function commit(next: ToMemoConfiguration) {
    if (!workspace || readOnly) return
    setPast((items) => [...items.slice(-49), workspace.configuration]); setFuture([])
    setWorkspace({ ...workspace, configuration: next })
  }
  function undo() { if (!workspace || !past.length) return; const previous = past.at(-1)!; setFuture((items) => [workspace.configuration, ...items]); setPast((items) => items.slice(0, -1)); setWorkspace({ ...workspace, configuration: previous }) }
  function redo() { if (!workspace || !future.length) return; const next = future[0]; setPast((items) => [...items, workspace.configuration]); setFuture((items) => items.slice(1)); setWorkspace({ ...workspace, configuration: next }) }

  function loadConfigurationSource(source: string, fileName: string) {
    const result = parseConfiguration(source); setError(null)
    if (!result.ok) return result.errors.join('；')
    setWorkspace({ fileName, configuration: result.configuration, warnings: result.warnings }); setPast([]); setFuture([]); setSelected(new Set())
    setCategoryId(result.configuration.categories[0]?.id ?? null); setNoteId(result.configuration.notes[0]?.id ?? null)
    return null
  }
  async function loadFile(file: File) {
    const failure = loadConfigurationSource(await file.text(), file.name)
    if (failure) setError(failure)
  }
  function startBlank() {
    const blank = createBlankConfiguration()
    const created = createCategory(blank, '新分类', '5A656FFF')
    setWorkspace({ fileName: '新建空白配置.json', configuration: created.configuration, warnings: [] })
    setPast([]); setFuture([]); setSelected(new Set()); setCategoryId(created.category.id); setNoteId(null)
  }
  function importPastedJson() {
    const configurationFailure = loadConfigurationSource(configText, '粘贴的配置.json')
    if (!configurationFailure) {
      setConfigTextOpen(false); setConfigText(''); setConfigTextError(null)
      return
    }

    const packageResult = parseAiPackage(configText)
    if (!packageResult.ok) {
      setConfigTextError(`无法识别为完整 ToMemo 配置：${configurationFailure}；也无法识别为 AI 内容包：${packageResult.error}`)
      return
    }

    if (!workspace) {
      const blank = createBlankConfiguration()
      setWorkspace({ fileName: 'AI 内容包新建配置.json', configuration: blank, warnings: [] })
      setPast([]); setFuture([]); setSelected(new Set()); setCategoryId(null); setNoteId(null)
    }
    setAiSource(configText)
    setAiPackage(packageResult.value)
    setAiTarget(packageResult.value.suggestedCategory?.name ?? category?.name ?? packageResult.value.packageName)
    setAiError(null)
    setConfigTextOpen(false); setConfigText(''); setConfigTextError(null); setAiOpen(true)
  }
  const drop = { onDragEnter: (e: DragEvent) => { e.preventDefault(); setDragging(true) }, onDragOver: (e: DragEvent) => e.preventDefault(), onDragLeave: () => setDragging(false), onDrop: (e: DragEvent) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) void loadFile(e.dataTransfer.files[0]) } }

  function selectNote(event: MouseEvent, id: string, index: number) {
    setNoteId(id)
    if (event.shiftKey && anchor !== null) {
      const [start, end] = [anchor, index].sort((a, b) => a - b); setSelected(new Set(notes.slice(start, end + 1).map((item) => item.id)))
    } else if (event.metaKey || event.ctrlKey) {
      setSelected((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next }); setAnchor(index)
    } else { setSelected(new Set([id])); setAnchor(index) }
  }

  function addCategory() {
    if (!config || readOnly) return; const name = window.prompt('新分类名称'); if (!name?.trim()) return
    const result = createCategory(config, name.trim()); commit(result.configuration); setCategoryId(result.category.id); setNoteId(null)
  }
  function addMemo() {
    if (!config || !categoryId || readOnly) return; const result = createNote(config, categoryId, '新 Memo', ''); commit(result.configuration); setNoteId(result.note.id); setSelected(new Set([result.note.id]))
  }
  function removeCategory() {
    if (!config || !categoryId || readOnly) return
    const containing = config.notes.filter((item) => item.categoryId === categoryId)
    const others = config.categories.filter((item) => item.id !== categoryId)
    const categoryName = config.categories.find((item) => item.id === categoryId)?.name ?? '未命名分类'
    const message = containing.length
      ? `确认删除分类“${categoryName}”及其中全部 ${containing.length} 条 Memo？此操作不会把 Memo 移动到其他分类。`
      : `确认删除空分类“${categoryName}”？`
    if (!window.confirm(message)) return
    commit(deleteCategory(config, categoryId)); setCategoryId(others[0]?.id ?? null); setNoteId(null); setSelected(new Set())
  }
  function batchMove(copy = false) {
    if (!config || !selected.size || readOnly) return; const name = window.prompt(copy ? '复制到分类（输入名称）' : '移动到分类（输入名称）')
    const target = config.categories.find((item) => item.name === name); if (!target) return
    commit(moveNotes(config, selected, target.id, copy)); if (!copy) setCategoryId(target.id)
  }
  function batchDelete() { if (config && selected.size && window.confirm(`删除选中的 ${selected.size} 条 Memo？`)) { commit(deleteNotes(config, selected)); setSelected(new Set()); setNoteId(null) } }
  function batchAffix() { if (!config || !selected.size) return; const prefix = window.prompt('标题前缀（可留空）', '') ?? ''; const suffix = window.prompt('标题后缀（可留空）', '') ?? ''; let next = config; for (const id of selected) { const item = next.notes.find((n) => n.id === id); if (item) next = updateNote(next, id, { title: `${prefix}${item.title}${suffix}`, content: item.content, categoryId: item.categoryId }) } commit(next) }
  function exportSelected() { if (!config || !selected.size) return; download('tomemo-content-package.json', { format: 'tomemo-content-package', version: '1.0', packageName: 'ToMemo 选定内容', suggestedCategory: { name: category?.name ?? '导出内容', color: category?.colorAsHex }, items: config.notes.filter((item) => selected.has(item.id)).map(({ title, content }) => ({ title, content })) }) }

  function previewAi() { const result = parseAiPackage(aiSource); if (!result.ok) { setAiError(result.error); setAiPackage(null); return } setAiError(null); setAiPackage(result.value); setAiTarget(result.value.suggestedCategory?.name ?? category?.name ?? '') }
  function importAi() {
    if (!config || !aiPackage || readOnly) return
    let next = config; let target = next.categories.find((item) => item.name === aiTarget)
    if (!target) { const created = createCategory(next, aiTarget || aiPackage.suggestedCategory?.name || aiPackage.packageName, normalizeAiColor(aiPackage.suggestedCategory?.color)); next = created.configuration; target = created.category }
    const existing = next.notes.filter((item) => item.categoryId === target!.id)
    for (const item of aiPackage.items) { if (duplicateConflict(item, existing).kind === 'exact') continue; next = createNote(next, target.id, item.title, item.content).configuration }
    commit(next); setCategoryId(target.id); setAiOpen(false); setAiPackage(null); setAiSource('')
  }

  const countText = config ? `${config.categories.length} 个分类 · ${config.notes.length} 条 Memo` : '尚未载入配置'
  return <main className="app-shell" onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'a' && config) { e.preventDefault(); setSelected(new Set(notes.map((item) => item.id))) } }}>
    <header className="topbar">
      <div className="brand-group"><div className="brand-mark"><Braces size={17}/></div><div><div className="brand-name">ToMemo Web Editor</div><div className="workspace-name">{workspace?.fileName ?? '本地配置工作区'}</div></div></div>
      <label className="topbar-search"><Search size={15}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={workspace ? '搜索 Memo…' : '导入后可搜索'} disabled={!workspace}/><kbd>⌘ K</kbd></label>
      <div className="toolbar-actions">
        <input ref={fileRef} className="visually-hidden" type="file" accept=".json,application/json" aria-label="导入 ToMemo 配置" onChange={(e) => { if (e.target.files?.[0]) void loadFile(e.target.files[0]); e.target.value = '' }}/>
        <button className="button secondary" onClick={() => fileRef.current?.click()}><Import size={15}/> 导入配置</button>
        <button className="button secondary" onClick={() => setConfigTextOpen(true)}><Braces size={15}/> 粘贴 JSON</button>
        <button className="button secondary" disabled={!workspace || readOnly} onClick={() => setAiOpen(true)}><FileJson size={15}/> AI 内容包</button>
        <button className="button secondary" disabled={!workspace} onClick={() => setValidation(!validation)}><ShieldCheck size={15}/> 校验</button>
        <button className="button primary" disabled={!config || readOnly} onClick={() => { if (config && window.confirm(`将导出 ${config.categories.length} 个分类、${config.notes.length} 条 Memo。结构校验已通过，继续？`)) download(`ToMemo-Export-${new Date().toISOString().slice(0,19).replaceAll(':','')}.json`, exportConfiguration(config)) }}><Download size={15}/> 导出 ToMemo</button>
      </div>
    </header>
    {error && <div className="error-banner" role="alert">{error}</div>}
    {!!workspace?.warnings.length && <div className="warning-banner" role="alert">{workspace.warnings.join('；')}。当前版本仅可查看，不能导出。</div>}
    {validation && config && <section className="validation-popover" aria-label="配置校验报告"><div className="validation-title"><ShieldCheck size={16}/> 配置校验报告<button onClick={() => setValidation(false)}><X size={14}/></button></div><strong>{workspace?.warnings.length ? '兼容性警告' : '结构校验通过'}</strong><p>{countText}；ID、颜色、时间和分类引用符合已确认规则。</p></section>}
    {!workspace ? <section className={`empty-state ${dragging ? 'dragging' : ''}`} {...drop}><div className="empty-icon"><UploadCloud size={30}/></div><h1>开始编辑 ToMemo 配置</h1><p>可以导入手机端 JSON，也可以从空白配置开始。全部处理都在当前浏览器本地完成。</p><div className="empty-actions"><button className="button primary large" onClick={() => fileRef.current?.click()}><FolderOpen size={17}/> 导入现有配置</button><button className="button secondary large" onClick={startBlank}><Plus size={17}/> 新建空白配置</button></div><div className="drop-hint">也可以将 JSON 文件拖放到这里</div><div className="privacy-note"><ShieldCheck size={14}/> 文件不会上传到服务器</div></section> :
    <section className={`workspace-grid ${dragging ? 'dragging' : ''}`} {...drop}>
      <aside className="category-pane panel"><div className="pane-header"><div><span className="eyeline">配置结构</span><h2>分类</h2></div><div className="header-tools"><button className="icon-button danger-subtle" onClick={removeCategory} aria-label="删除分类"><Trash2 size={15}/></button><button className="icon-button" onClick={addCategory} aria-label="新建分类"><Plus size={16}/></button></div></div><div className="category-list">{config!.categories.toSorted((a,b)=>a.priority-b.priority).map((item)=><button key={item.id} className={`category-row ${item.id===categoryId?'selected':''}`} onClick={()=>{setCategoryId(item.id);setNoteId(config!.notes.find((n)=>n.categoryId===item.id)?.id??null);setSelected(new Set())}} onDoubleClick={()=>{const name=window.prompt('重命名分类',item.name);if(name) commit({...config!,categories:config!.categories.map((c)=>c.id===item.id?{...c,name}:c)})}} onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>{e.stopPropagation(); if(selected.size) commit(moveNotes(config!,selected,item.id,e.altKey))}}><span className="color-dot" style={{backgroundColor:rgbaHexToCss(item.colorAsHex)}}/><span className="category-name">{item.name||'未命名分类'}</span><span className="count">{config!.notes.filter((n)=>n.categoryId===item.id).length}</span></button>)}</div><div className="pane-footer">双击分类可重命名 · 拖入 Memo 可移动</div></aside>
      <section className="memo-pane panel"><div className="pane-header memo-heading"><div><span className="eyeline">{notes.length} 条 Memo</span><h2>{category?.name}</h2></div><div className="header-tools"><button className="compact-control" onClick={()=>setAscending(!ascending)}><ListFilter size={14}/><select value={sort} onChange={(e)=>setSort(e.target.value as SortKey)}><option value="original">原始顺序</option><option value="title">标题</option><option value="createdAt">创建时间</option><option value="updatedAt">更新时间</option></select>{ascending?'↑':'↓'}</button><button className="icon-button" onClick={addMemo} aria-label="新建 Memo"><Plus size={16}/></button></div></div><div className="memo-list">{notes.map((item,index)=><button draggable key={item.id} className={`memo-row ${item.id===noteId?'selected':''} ${selected.has(item.id)?'multi-selected':''}`} onClick={(e)=>selectNote(e,item.id,index)} onDragStart={(e)=>{if(!selected.has(item.id)) setSelected(new Set([item.id]));e.dataTransfer.setData('text/plain',item.id)}} aria-label={`${item.title||'无标题'} Memo`}><span className="memo-index">{selected.has(item.id)?<Check size={13}/>:String(index+1).padStart(2,'0')}</span><span className="memo-body"><span className="memo-title">{item.title||item.content.split('\n')[0]||'无标题'}</span><span className="memo-excerpt">{item.content||'空正文'}</span><span className="memo-time">更新于 {fmt(item.updatedAt)}</span></span></button>)}</div>{selected.size>1&&<div className="batch-bar"><strong>已选择 {selected.size} 项</strong><button onClick={()=>batchMove(false)}><Move size={13}/> 移动</button><button onClick={()=>batchMove(true)}><Copy size={13}/> 复制</button><button onClick={batchAffix}>标题处理</button><button onClick={exportSelected}>导出 AI 包</button><button className="danger" onClick={batchDelete}><Trash2 size={13}/> 删除</button></div>}</section>
      <section className="detail-pane panel">{note?<><div className="pane-header detail-heading"><div><span className="eyeline">Memo 编辑</span><h2>{note.title||'无标题'}</h2></div><div className="history-tools"><button onClick={undo} disabled={!past.length}><Undo2 size={14}/></button><button onClick={redo} disabled={!future.length}><Redo2 size={14}/></button></div></div><div className="detail-form"><label className="field-label" htmlFor="memo-title">标题</label><input id="memo-title" className="text-input" value={note.title} onChange={(e)=>commit(updateNote(config!,note.id,{title:e.target.value,content:note.content,categoryId:note.categoryId}))}/><label className="field-label" htmlFor="memo-category">所属分类</label><select id="memo-category" className="select-display" value={note.categoryId} onChange={(e)=>commit(updateNote(config!,note.id,{title:note.title,content:note.content,categoryId:e.target.value}))}>{config!.categories.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select><div className="content-label-row"><label className="field-label" htmlFor="memo-content">正文</label><div className="variable-tools"><button onClick={()=>commit(updateNote(config!,note.id,{title:note.title,content:`${note.content}{{CLIPBOARD}}`,categoryId:note.categoryId}))}><Clipboard size={12}/> 剪贴板</button><button onClick={()=>commit(updateNote(config!,note.id,{title:note.title,content:`${note.content}{{CURSOR}}`,categoryId:note.categoryId}))}>⌖ 光标位置</button></div></div><textarea id="memo-content" className="content-editor" value={note.content} onChange={(e)=>commit(updateNote(config!,note.id,{title:note.title,content:e.target.value,categoryId:note.categoryId}))}/><div className="detail-actions"><button className="button secondary danger-text" onClick={()=>{if(window.confirm('删除这条 Memo？')){commit(deleteNotes(config!,new Set([note.id])));setNoteId(null)}}}><Trash2 size={14}/> 删除 Memo</button></div><div className="metadata-grid"><div><span>创建时间</span><strong>{note.createdAt}</strong></div><div><span>更新时间</span><strong>{note.updatedAt}</strong></div><div className="wide"><span>Memo ID</span><strong>{note.id}</strong></div></div></div></>:<div className="inline-empty detail-empty">选择或新建一条 Memo</div>}</section>
    </section>}
    <footer className="statusbar"><span>{countText}</span><span className="status-separator"/><span>版本 {config?.version??'—'}</span><span className="status-spacer"/>{config?<span className="valid-status"><CheckCircle2 size={13}/> 本地自动保存</span>:<span>等待导入</span>}</footer>
    {aiOpen&&<div className="modal-backdrop"><section className="modal"><header><div><span className="eyeline">AI 内容入口</span><h2>导入内容包</h2></div><button className="icon-button" onClick={()=>setAiOpen(false)}><X size={16}/></button></header><input ref={aiFileRef} type="file" className="visually-hidden" accept=".json" onChange={async(e)=>{const file=e.target.files?.[0];if(file)setAiSource(await file.text())}}/><div className="modal-toolbar"><button className="button secondary" onClick={()=>aiFileRef.current?.click()}><FolderOpen size={14}/> 上传 JSON</button><span>支持严格 JSON 与 Markdown 代码块</span></div><textarea className="ai-source" value={aiSource} onChange={(e)=>setAiSource(e.target.value)} placeholder='粘贴 tomemo-content-package JSON'/>{aiError&&<p className="modal-error" role="alert">{aiError}</p>}{aiPackage&&<div className="ai-preview"><strong>{aiPackage.packageName}</strong><span>{aiPackage.items.length} 条内容</span><label>目标分类<input value={aiTarget} onChange={(e)=>setAiTarget(e.target.value)}/></label><div className="preview-list">{aiPackage.items.map((item,i)=><div key={i}><b>{item.title||'无标题'}</b><span>{duplicateConflict(item,config!.notes).kind==='exact'?'完全重复，将跳过':item.content.slice(0,80)||'空正文'}</span></div>)}</div></div>}<footer><button className="button secondary" onClick={previewAi}>解析并预览</button><button className="button primary" disabled={!aiPackage} onClick={importAi}><Check size={14}/> 确认导入</button></footer></section></div>}
    {configTextOpen&&<div className="modal-backdrop"><section className="modal config-text-modal"><header><div><span className="eyeline">智能 JSON 入口</span><h2>粘贴 JSON</h2></div><button className="icon-button" onClick={()=>setConfigTextOpen(false)}><X size={16}/></button></header><div className="modal-toolbar"><span>自动识别完整 ToMemo 配置和 tomemo-content-package AI 内容包。</span></div><textarea aria-label="待导入 JSON" className="ai-source config-source" value={configText} onChange={(e)=>setConfigText(e.target.value)} placeholder='粘贴完整配置或 AI 内容包 JSON…'/>{configTextError&&<p className="modal-error" role="alert">{configTextError}</p>}<footer><button className="button secondary" onClick={()=>{setConfigText('');setConfigTextError(null)}}>清空</button><button className="button primary" disabled={!configText.trim()} onClick={importPastedJson}><Check size={14}/> 识别并继续</button></footer></section></div>}
  </main>
}
