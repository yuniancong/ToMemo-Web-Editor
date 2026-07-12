import { describe, expect, it } from 'vitest'
import { parseAiPackage } from './aiPackage'

describe('AI content package codec', () => {
  it('parses canonical and Markdown-fenced JSON', () => {
    const source = { format: 'tomemo-content-package', version: '1.0', packageName: '问候语', items: [{ title: '收到', content: '好的' }] }
    expect(parseAiPackage(JSON.stringify(source))).toEqual({ ok: true, value: source })
    expect(parseAiPackage(`\`\`\`json\n${JSON.stringify(source)}\n\`\`\``)).toEqual({ ok: true, value: source })
  })

  it('returns a repairable schema error', () => {
    expect(parseAiPackage('{"format":"wrong"}')).toEqual({ ok: false, error: 'format 必须是 tomemo-content-package' })
  })
})
