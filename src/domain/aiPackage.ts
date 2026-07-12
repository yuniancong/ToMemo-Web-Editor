import { jsonrepair } from 'jsonrepair'

export type AiContentPackage = {
  format: 'tomemo-content-package'
  version: '1.0'
  packageName: string
  suggestedCategory?: { name: string; color?: string }
  items: Array<{ title: string; content: string }>
}

export type AiPackageResult = { ok: true; value: AiContentPackage } | { ok: false; error: string }

export const normalizeAiColor = (value?: string) => {
  const normalized = value?.replace(/^#/, '').toUpperCase()
  return normalized && /^[0-9A-F]{8}$/.test(normalized) ? normalized : '5A656FFF'
}

const repairUnescapedItemQuotes = (source: string) => source.replace(
  /^(\s*"(?:title|content)"\s*:\s*")(.*)("\s*,?\s*)$/gm,
  (_line, prefix: string, value: string, suffix: string) => `${prefix}${value.replace(/(?<!\\)"/g, '\\"')}${suffix}`,
)

export function parseAiPackage(source: string): AiPackageResult {
  const fenced = source.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const json = fenced?.[1]?.trim() ?? source.trim()
  let value: unknown
  try {
    value = JSON.parse(json)
  } catch (originalError) {
    try {
      value = JSON.parse(jsonrepair(repairUnescapedItemQuotes(json)))
    } catch {
      return { ok: false, error: `JSON 无法解析：${originalError instanceof Error ? originalError.message : '未知错误'}` }
    }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, error: '内容包顶层必须是对象' }
  const candidate = value as Record<string, unknown>
  if (candidate.format !== 'tomemo-content-package') return { ok: false, error: 'format 必须是 tomemo-content-package' }
  if (candidate.version !== '1.0') return { ok: false, error: '内容包 version 必须是 1.0' }
  if (typeof candidate.packageName !== 'string' || !candidate.packageName.trim()) return { ok: false, error: 'packageName 不能为空' }
  if (!Array.isArray(candidate.items) || candidate.items.length === 0) return { ok: false, error: 'items 必须是非空数组' }
  const suggested = candidate.suggestedCategory
  if (suggested !== undefined && (!suggested || typeof suggested !== 'object' || Array.isArray(suggested) || typeof (suggested as Record<string, unknown>).name !== 'string')) return { ok: false, error: 'suggestedCategory 必须包含字符串 name' }
  for (const [index, item] of candidate.items.entries()) {
    if (!item || typeof item !== 'object' || typeof item.title !== 'string' || typeof item.content !== 'string') {
      return { ok: false, error: `items[${index}] 必须包含字符串 title 和 content` }
    }
  }
  return { ok: true, value: candidate as AiContentPackage }
}
