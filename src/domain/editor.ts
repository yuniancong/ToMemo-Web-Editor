import type { ToMemoCategory, ToMemoConfiguration, ToMemoNote } from './tomemo'

const nowIso = () => new Date().toISOString().replace('.000Z', 'Z')
const newId = () => crypto.randomUUID().toUpperCase()

export function createCategory(configuration: ToMemoConfiguration, name: string, colorAsHex = '5A656FFF') {
  const category: ToMemoCategory = {
    colorAsHex,
    id: newId(),
    name,
    priority: Math.max(0, ...configuration.categories.map((item) => item.priority)) + 1,
  }
  return { configuration: { ...configuration, categories: [...configuration.categories, category] }, category }
}

export function createNote(configuration: ToMemoConfiguration, categoryId: string, title = '', content = '') {
  const timestamp = nowIso()
  const note: ToMemoNote = { categoryId, content, createdAt: timestamp, id: newId(), title, updatedAt: timestamp }
  return { configuration: { ...configuration, notes: [...configuration.notes, note] }, note }
}

export function updateNote(configuration: ToMemoConfiguration, id: string, patch: Pick<ToMemoNote, 'title' | 'content' | 'categoryId'>) {
  return {
    ...configuration,
    notes: configuration.notes.map((note) => note.id === id ? { ...note, ...patch, updatedAt: nowIso() } : note),
  }
}

export function moveNotes(configuration: ToMemoConfiguration, ids: Set<string>, categoryId: string, copy = false) {
  const timestamp = nowIso()
  if (copy) {
    const copies = configuration.notes
      .filter((note) => ids.has(note.id))
      .map((note) => ({ ...note, id: newId(), categoryId, createdAt: timestamp, updatedAt: timestamp }))
    return { ...configuration, notes: [...configuration.notes, ...copies] }
  }
  return {
    ...configuration,
    notes: configuration.notes.map((note) => ids.has(note.id) ? { ...note, categoryId, updatedAt: timestamp } : note),
  }
}

export function deleteNotes(configuration: ToMemoConfiguration, ids: Set<string>) {
  return { ...configuration, notes: configuration.notes.filter((note) => !ids.has(note.id)) }
}

export function deleteCategory(configuration: ToMemoConfiguration, categoryId: string, targetCategoryId?: string) {
  return {
    ...configuration,
    categories: configuration.categories.filter((category) => category.id !== categoryId)
      .map((category, index) => ({ ...category, priority: index + 1 })),
    notes: targetCategoryId
      ? configuration.notes.map((note) => note.categoryId === categoryId ? { ...note, categoryId: targetCategoryId } : note)
      : configuration.notes.filter((note) => note.categoryId !== categoryId),
  }
}

export function duplicateConflict(note: Pick<ToMemoNote, 'title' | 'content'>, existing: ToMemoNote[]) {
  const exact = existing.find((item) => item.title === note.title && item.content === note.content)
  if (exact) return { kind: 'exact' as const, note: exact }
  const title = existing.find((item) => item.title === note.title)
  if (title) return { kind: 'title' as const, note: title }
  const content = existing.find((item) => item.content === note.content)
  if (content) return { kind: 'content' as const, note: content }
  return { kind: 'none' as const }
}

