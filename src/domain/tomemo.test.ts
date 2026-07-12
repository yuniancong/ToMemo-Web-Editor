import { describe, expect, it } from 'vitest'
import { createBlankConfiguration, exportConfiguration, parseConfiguration } from './tomemo'
import baselineFixture from '../test/fixtures/baseline-export.json'
import changedFixture from '../test/fixtures/changed-export.json'

const observedExport = {
  categories: [
    {
      colorAsHex: '5A656FFF',
      id: '4BB0FABD-1B2C-4271-84F7-D617DBE49EBF',
      name: '终端',
      priority: 1,
      futureCategoryField: { keep: true },
    },
  ],
  exportDate: '2026-07-12T10:15:22Z',
  notes: [
    {
      categoryId: '4BB0FABD-1B2C-4271-84F7-D617DBE49EBF',
      content: '{{CLIPBOARD}}\n{{CURSOR}}\n',
      createdAt: '2026-07-12T10:14:50Z',
      id: 'D610206D-B57C-4F26-A80C-10EBEECFF569',
      title: '刚刚',
      updatedAt: '2026-07-12T10:14:50Z',
      futureMemoField: 'keep me',
    },
  ],
  version: '1.0',
  futureTopLevelField: ['keep me'],
}

describe('ToMemo configuration codec', () => {
  it('accepts an observed 1.0 export and preserves unknown fields', () => {
    const result = parseConfiguration(JSON.stringify(observedExport))

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.configuration).toEqual(observedExport)
    expect(result.warnings).toEqual([])
  })

  it('reports precise structural and referential errors', () => {
    const invalid = structuredClone(observedExport)
    invalid.categories[0].colorAsHex = '#5A656F'
    invalid.notes[0].categoryId = '00000000-0000-0000-0000-000000000000'

    const result = parseConfiguration(JSON.stringify(invalid))

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors).toEqual([
      'categories[0].colorAsHex 必须是 8 位 RRGGBBAA 十六进制颜色（不含 #）',
      'notes[0].categoryId 未引用任何现有分类',
    ])
  })

  it('refreshes exportDate without changing existing identities or timestamps', () => {
    const result = parseConfiguration(JSON.stringify(observedExport))
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const exported = exportConfiguration(
      result.configuration,
      new Date('2026-08-01T01:02:03Z'),
    )

    expect(exported.exportDate).toBe('2026-08-01T01:02:03Z')
    expect(exported.categories[0].id).toBe(observedExport.categories[0].id)
    expect(exported.notes[0].createdAt).toBe(observedExport.notes[0].createdAt)
    expect(exported.notes[0].updatedAt).toBe(observedExport.notes[0].updatedAt)
    expect(exported.futureTopLevelField).toEqual(['keep me'])
  })

  it.each([
    ['baseline real-export derivative', baselineFixture],
    ['changed real-export derivative', changedFixture],
  ])('round-trips the %s without unintended loss', (_name, fixture) => {
    const parsed = parseConfiguration(JSON.stringify(fixture))
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return

    const exported = exportConfiguration(parsed.configuration, new Date(fixture.exportDate))
    expect(exported).toEqual(fixture)
  })

  it('rejects an invalid exportDate', () => {
    const invalid = { ...observedExport, exportDate: 'not-a-date' }
    const result = parseConfiguration(JSON.stringify(invalid))
    expect(result).toEqual({ ok: false, errors: ['exportDate 必须是 UTC ISO 8601 时间'] })
  })

  it('creates a valid empty configuration for standalone generation', () => {
    const blank = createBlankConfiguration(new Date('2026-07-12T12:00:00Z'))
    expect(blank).toEqual({ categories: [], exportDate: '2026-07-12T12:00:00Z', notes: [], version: '1.0' })
    expect(parseConfiguration(JSON.stringify(blank))).toEqual({ ok: true, configuration: blank, warnings: [] })
  })
})
