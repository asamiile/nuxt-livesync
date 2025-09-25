import { vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useSupabaseUser, useSupabaseClient } from '#imports'

// happy-domに存在しない`alert`をモック
window.alert = vi.fn()

// beforeEachフックで各テストの前にモックをリセット
beforeEach(() => {
  vi.clearAllMocks()

  // --- Mocks ---
  ;(useSupabaseUser as any).mockReturnValue(ref(null))

  const queryBuilderMock = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: null }),
    update: vi.fn().mockResolvedValue({ error: null }),
    delete: vi.fn().mockResolvedValue({ error: null }),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
  }

  const realtimeChannelMock = {
    on: vi.fn(function (this: any, event, filter, callback) {
      this.callback = callback
      return this
    }),
    subscribe: vi.fn(function (this: any, cb) {
      this._trigger = (payload: any) => {
        if (this.callback) {
          this.callback(payload)
        }
      }
      if (cb) {
        cb('SUBSCRIBED')
      }
      return this
    }),
  }

  const clientMock = {
    from: vi.fn(() => queryBuilderMock),
    channel: vi.fn(() => realtimeChannelMock),
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  }

  ;(useSupabaseClient as any).mockReturnValue(clientMock)
})