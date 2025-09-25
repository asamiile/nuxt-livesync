import { vi, beforeEach } from 'vitest'
import { ref, computed } from 'vue'

const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  order: vi.fn().mockResolvedValue({ data: [], error: null }),
  eq: vi.fn().mockReturnThis(),
  update: vi.fn().mockResolvedValue({ error: null }),
  insert: vi.fn().mockResolvedValue({ error: null }),
  delete: vi.fn().mockResolvedValue({ error: null }),
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  })),
  removeChannel: vi.fn(),
  auth: {
    onAuthStateChange: vi.fn((callback) => {
      // The callback is expected to be a function.
      if (typeof callback === 'function') {
        callback('INITIAL_SESSION', null)
      }
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      }
    }),
  },
}

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => mockSupabaseClient),
}))

const mockUser = { id: 'user-123', email: 'test@example.com' }
const isAuthenticated = ref(false)

vi.mock('~/composables/useAuth', () => ({
  useAuth: () => ({
    user: computed(() => (isAuthenticated.value ? mockUser : null)),
    isAuthenticated,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}))

beforeEach(() => {
  isAuthenticated.value = false
  vi.clearAllMocks()
  mockSupabaseClient.from.mockReturnThis()
  mockSupabaseClient.select.mockReturnThis()
  mockSupabaseClient.order.mockResolvedValue({ data: [], error: null })
  mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
    if (typeof callback === 'function') {
      callback('INITIAL_SESSION', null)
    }
    return {
      data: { subscription: { unsubscribe: vi.fn() } },
    }
  })
})