import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import index from '~/pages/index.vue'

// $fetchをモックする
vi.stubGlobal('$fetch', vi.fn().mockResolvedValue([]))

// WebSocketをモックする
vi.stubGlobal('WebSocket', vi.fn(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  close: vi.fn(),
  send: vi.fn(),
})))

describe('index', () => {
  it('renders a waiting message by default', async () => {
    const wrapper = await mountSuspended(index)
    expect(wrapper.text()).toContain('待機中...')
  })
})
