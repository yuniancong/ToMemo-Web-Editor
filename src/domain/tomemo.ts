export type JsonObject = { [key: string]: unknown }

export type ToMemoCategory = JsonObject & {
  colorAsHex: string
  id: string
  name: string
  priority: number
}

export type ToMemoNote = JsonObject & {
  categoryId: string
  content: string
  createdAt: string
  id: string
  title: string
  updatedAt: string
}

export type ToMemoConfiguration = JsonObject & {
  categories: ToMemoCategory[]
  exportDate: string
  notes: ToMemoNote[]
  version: string
}

export type ParseResult =
  | { ok: true; configuration: ToMemoConfiguration; warnings: string[] }
  | { ok: false; errors: string[] }

const uuidPattern = /^[0-9A-F]{8}-[0-9A-F]{4}-[1-5][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/
const colorPattern = /^[0-9A-F]{8}$/

const isRecord = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isIsoDate = (value: unknown): value is string =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value)) && value.endsWith('Z')

export function parseConfiguration(source: string): ParseResult {
  let value: unknown
  try {
    value = JSON.parse(source)
  } catch (error) {
    const detail = error instanceof Error ? error.message : '未知 JSON 错误'
    return { ok: false, errors: [`JSON 无法解析：${detail}`] }
  }

  if (!isRecord(value)) return { ok: false, errors: ['配置顶层必须是 JSON 对象'] }

  const errors: string[] = []
  const categories = value.categories
  const notes = value.notes

  if (!Array.isArray(categories)) errors.push('categories 必须是数组')
  if (!Array.isArray(notes)) errors.push('notes 必须是数组')
  if (!isIsoDate(value.exportDate)) errors.push('exportDate 必须是 UTC ISO 8601 时间')
  if (typeof value.version !== 'string') errors.push('version 必须是字符串')
  if (errors.length > 0 || !Array.isArray(categories) || !Array.isArray(notes)) {
    return { ok: false, errors }
  }

  const categoryIds = new Set<string>()
  categories.forEach((category, index) => {
    if (!isRecord(category)) {
      errors.push(`categories[${index}] 必须是对象`)
      return
    }
    if (typeof category.colorAsHex !== 'string' || !colorPattern.test(category.colorAsHex)) {
      errors.push(`categories[${index}].colorAsHex 必须是 8 位 RRGGBBAA 十六进制颜色（不含 #）`)
    }
    if (typeof category.id !== 'string' || !uuidPattern.test(category.id)) {
      errors.push(`categories[${index}].id 必须是大写 UUID`)
    } else if (categoryIds.has(category.id)) {
      errors.push(`categories[${index}].id 与其他分类重复`)
    } else {
      categoryIds.add(category.id)
    }
    if (typeof category.name !== 'string') errors.push(`categories[${index}].name 必须是字符串`)
    if (typeof category.priority !== 'number' || !Number.isFinite(category.priority)) {
      errors.push(`categories[${index}].priority 必须是数字`)
    }
  })

  const noteIds = new Set<string>()
  notes.forEach((note, index) => {
    if (!isRecord(note)) {
      errors.push(`notes[${index}] 必须是对象`)
      return
    }
    if (typeof note.categoryId !== 'string' || !categoryIds.has(note.categoryId)) {
      errors.push(`notes[${index}].categoryId 未引用任何现有分类`)
    }
    if (typeof note.id !== 'string' || !uuidPattern.test(note.id)) {
      errors.push(`notes[${index}].id 必须是大写 UUID`)
    } else if (noteIds.has(note.id)) {
      errors.push(`notes[${index}].id 与其他 Memo 重复`)
    } else {
      noteIds.add(note.id)
    }
    if (typeof note.title !== 'string') errors.push(`notes[${index}].title 必须是字符串`)
    if (typeof note.content !== 'string') errors.push(`notes[${index}].content 必须是字符串`)
    if (!isIsoDate(note.createdAt)) errors.push(`notes[${index}].createdAt 必须是 UTC ISO 8601 时间`)
    if (!isIsoDate(note.updatedAt)) errors.push(`notes[${index}].updatedAt 必须是 UTC ISO 8601 时间`)
  })

  if (errors.length > 0) return { ok: false, errors }

  const warnings = value.version === '1.0' ? [] : [`配置版本 ${String(value.version)} 尚未验证，仅建议查看`]
  return { ok: true, configuration: value as ToMemoConfiguration, warnings }
}

export function exportConfiguration(
  configuration: ToMemoConfiguration,
  now = new Date(),
): ToMemoConfiguration {
  return structuredClone({
    ...configuration,
    exportDate: now.toISOString().replace('.000Z', 'Z'),
  })
}

export function rgbaHexToCss(value: string): string {
  return `#${value}`
}

export function createBlankConfiguration(now = new Date()): ToMemoConfiguration {
  return {
    categories: [],
    exportDate: now.toISOString().replace('.000Z', 'Z'),
    notes: [],
    version: '1.0',
  }
}
