import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

const fixture = {
  categories: [
    { colorAsHex: '5A656FFF', id: '4BB0FABD-1B2C-4271-84F7-D617DBE49EBF', name: '终端', priority: 1 },
    { colorAsHex: '17C657FF', id: 'EF16F84C-851C-4885-89D5-04947EAE1BFA', name: '常用路径', priority: 2 },
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
    },
  ],
  version: '1.0',
}

describe('configuration import workflow', () => {
  it('shows imported Categories, Memos, and the selected Memo detail', async () => {
    const user = userEvent.setup()
    render(<App />)

    const file = new File([JSON.stringify(fixture)], 'ToMemo-Export.json', { type: 'application/json' })
    await user.upload(screen.getByLabelText('导入 ToMemo 配置'), file)

    expect((await screen.findAllByText('终端')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('常用路径').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /刚刚/ })).toBeInTheDocument()
    expect(screen.getByLabelText('正文')).toHaveValue('{{CLIPBOARD}}\n{{CURSOR}}\n')
    expect(screen.getByText('2 个分类 · 1 条 Memo')).toBeInTheDocument()
  })

  it('shows a precise error instead of replacing the current screen', async () => {
    const user = userEvent.setup()
    render(<App />)

    const file = new File(['{ nope'], 'broken.json', { type: 'application/json' })
    await user.upload(screen.getByLabelText('导入 ToMemo 配置'), file)

    expect(await screen.findByRole('alert')).toHaveTextContent('JSON 无法解析')
    expect(screen.getByText('开始编辑 ToMemo 配置')).toBeInTheDocument()
  })

  it('warns and blocks export for an unverified configuration version', async () => {
    const user = userEvent.setup()
    render(<App />)
    const unverified = { ...fixture, version: '2.0' }
    await user.upload(
      screen.getByLabelText('导入 ToMemo 配置'),
      new File([JSON.stringify(unverified)], 'future.json', { type: 'application/json' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent('配置版本 2.0 尚未验证')
    expect(screen.getByRole('button', { name: /导出 ToMemo/ })).toBeDisabled()
    expect(screen.queryByText('配置结构有效')).not.toBeInTheDocument()
  })

  it('starts a valid standalone workspace without importing a source file', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /新建空白配置/ }))
    expect(screen.getAllByText('新分类').length).toBeGreaterThan(0)
    expect(screen.getByText('1 个分类 · 0 条 Memo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /导出 ToMemo/ })).toBeEnabled()
  })

  it('imports a complete ToMemo configuration pasted as JSON text', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /粘贴 JSON/ }))
    fireEvent.change(screen.getByLabelText('待导入 JSON'), { target: { value: JSON.stringify(fixture) } })
    await user.click(screen.getByRole('button', { name: /识别并继续/ }))
    expect(await screen.findByText('2 个分类 · 1 条 Memo')).toBeInTheDocument()
    expect(screen.getByText('粘贴的配置.json')).toBeInTheDocument()
  })

  it('auto-detects a pasted AI content package and creates a blank workspace', async () => {
    const user = userEvent.setup()
    render(<App />)
    const contentPackage = {
      format: 'tomemo-content-package', version: '1.0', packageName: '开发指令列表',
      suggestedCategory: { name: '开发指令', color: '4F7CFFFF' },
      items: [{ title: '问流程', content: '/ask-matt' }],
    }
    await user.click(screen.getByRole('button', { name: /粘贴 JSON/ }))
    fireEvent.change(screen.getByLabelText('待导入 JSON'), { target: { value: JSON.stringify(contentPackage) } })
    await user.click(screen.getByRole('button', { name: /识别并继续/ }))
    expect(await screen.findByText('开发指令列表')).toBeInTheDocument()
    expect(screen.getByDisplayValue('开发指令')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /确认导入/ })).toBeEnabled()
  })
})
