import { describe, expect, it } from 'vitest'
import { deleteCategory } from './editor'
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
