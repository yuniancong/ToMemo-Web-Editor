import { describe, expect, it } from 'vitest'
import { createNotesInDisplayOrder, deleteCategory, reorderCategoryNotes } from './editor'
import type { ToMemoConfiguration } from './tomemo'

describe('Category deletion', () => {
  it('deletes the Category and every Memo that belongs to it without moving them', () => {
    const configuration: ToMemoConfiguration = {
      categories: [
        { id: 'AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA', name: '删除我', colorAsHex: '5A656FFF', priority: 1 },
        { id: 'BBBBBBBB-BBBB-4BBB-8BBB-BBBBBBBBBBBB', name: '保留', colorAsHex: '4F7CFFFF', priority: 2 },
      ],
      notes: [
        { id: 'CCCCCCCC-CCCC-4CCC-8CCC-CCCCCCCCCCCC', categoryId: 'AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA', title: '一起删除', content: 'A', createdAt: '2026-07-12T00:00:00Z', updatedAt: '2026-07-12T00:00:00Z' },
        { id: 'DDDDDDDD-DDDD-4DDD-8DDD-DDDDDDDDDDDD', categoryId: 'BBBBBBBB-BBBB-4BBB-8BBB-BBBBBBBBBBBB', title: '保留', content: 'B', createdAt: '2026-07-12T00:00:00Z', updatedAt: '2026-07-12T00:00:00Z' },
      ],
      exportDate: '2026-07-12T00:00:00Z',
      version: '1.0',
    }

    const result = deleteCategory(configuration, 'AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA')
    expect(result.categories.map((item) => item.name)).toEqual(['保留'])
    expect(result.notes.map((item) => item.title)).toEqual(['保留'])
    expect(result.notes[0].categoryId).toBe('BBBBBBBB-BBBB-4BBB-8BBB-BBBBBBBBBBBB')
  })
})

describe('AI package display order', () => {
  it('assigns descending timestamps so ToMemo newest-first order matches the page', () => {
    const configuration: ToMemoConfiguration = {
      categories: [{ id: 'AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA', name: '开发指令', colorAsHex: '5A656FFF', priority: 1 }],
      notes: [], exportDate: '2026-07-12T00:00:00Z', version: '1.0',
    }
    const result = createNotesInDisplayOrder(configuration, configuration.categories[0].id, [
      { title: '第一条', content: '/first' },
      { title: '第二条', content: '/second' },
      { title: '第三条', content: '/third' },
    ], new Date('2026-07-12T12:00:00Z'))

    expect(result.notes.map((note) => note.title)).toEqual(['第一条', '第二条', '第三条'])
    expect(result.notes.map((note) => note.createdAt)).toEqual([
      '2026-07-12T12:00:00Z',
      '2026-07-12T11:59:59Z',
      '2026-07-12T11:59:58Z',
    ])
  })
})

describe('manual Memo ordering', () => {
  it('reorders only the target Category and persists newest-first timestamps', () => {
    const categoryA = 'AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA'
    const categoryB = 'BBBBBBBB-BBBB-4BBB-8BBB-BBBBBBBBBBBB'
    const makeNote = (id: string, categoryId: string, title: string) => ({ id, categoryId, title, content: title, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' })
    const configuration: ToMemoConfiguration = {
      categories: [
        { id: categoryA, name: 'A', colorAsHex: '5A656FFF', priority: 1 },
        { id: categoryB, name: 'B', colorAsHex: '4F7CFFFF', priority: 2 },
      ],
      notes: [
        makeNote('11111111-1111-4111-8111-111111111111', categoryA, 'A1'),
        makeNote('99999999-9999-4999-8999-999999999999', categoryB, 'B1'),
        makeNote('22222222-2222-4222-8222-222222222222', categoryA, 'A2'),
        makeNote('33333333-3333-4333-8333-333333333333', categoryA, 'A3'),
      ], exportDate: '2026-07-12T00:00:00Z', version: '1.0',
    }
    const result = reorderCategoryNotes(configuration, categoryA, [
      '33333333-3333-4333-8333-333333333333',
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
    ], new Date('2026-07-12T12:00:00Z'))

    expect(result.notes.map((note) => note.title)).toEqual(['A3', 'B1', 'A1', 'A2'])
    expect(result.notes.filter((note) => note.categoryId === categoryA).map((note) => note.createdAt)).toEqual([
      '2026-07-12T12:00:00Z', '2026-07-12T11:59:59Z', '2026-07-12T11:59:58Z',
    ])
    expect(result.notes.find((note) => note.categoryId === categoryB)?.createdAt).toBe('2026-01-01T00:00:00Z')
  })
})
