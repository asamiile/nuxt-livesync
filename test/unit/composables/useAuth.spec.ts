import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useAuth } from '~/composables/useAuth'

// --- Mocks ---

const mockSignInWithPassword = vi.fn()
const mockSignOut = vi.fn()
const mockSupabaseClient = {
  auth: {
    signInWithPassword: mockSignInWithPassword,
    signOut: mockSignOut,
  },
}

const mockUser = ref<object | null>(null)
const mockNavigateTo = vi.fn()

// mockNuxtImportを使用して、Nuxtの自動インポートされるコンポーザブルをモックする
mockNuxtImport('useSupabaseClient', () => {
  return () => mockSupabaseClient
})

mockNuxtImport('useSupabaseUser', () => {
  return () => mockUser
})

mockNuxtImport('navigateTo', () => {
  return (path: string) => mockNavigateTo(path)
})

// --- Tests ---

describe('useAuth', () => {
  // 各テストの前にモックをリセット
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.value = null
    // mockResolvedValueをリセット
    mockSignInWithPassword.mockReset()
    mockSignOut.mockReset()
    mockNavigateTo.mockReset()
  })

  describe('login', () => {
    it('should call signInWithPassword with correct arguments on successful login', async () => {
      const { login } = useAuth()
      const email = 'test@example.com'
      const password = 'password123'

      // signInWithPasswordがエラーなしで解決するように設定
      mockSignInWithPassword.mockResolvedValue({ error: null })

      await login(email, password)

      expect(mockSignInWithPassword).toHaveBeenCalledOnce()
      expect(mockSignInWithPassword).toHaveBeenCalledWith({ email, password })
    })

    it('should throw an error on failed login', async () => {
      const { login } = useAuth()
      const email = 'wrong@example.com'
      const password = 'wrongpassword'
      const mockError = new Error('Invalid login credentials')

      // signInWithPasswordがエラーを返すように設定
      mockSignInWithPassword.mockResolvedValue({ error: mockError })

      await expect(login(email, password)).rejects.toThrow(mockError)
      expect(mockSignInWithPassword).toHaveBeenCalledWith({ email, password })
    })
  })

  describe('logout', () => {
    it('should call signOut and navigate to login page', async () => {
      const { logout } = useAuth()

      // signOutが成功するように設定
      mockSignOut.mockResolvedValue({ error: null })

      await logout()

      expect(mockSignOut).toHaveBeenCalledOnce()
      expect(mockNavigateTo).toHaveBeenCalledOnce()
      expect(mockNavigateTo).toHaveBeenCalledWith('/admin/login')
    })
  })

  describe('isAuthenticated', () => {
    it('should be true when user is authenticated', () => {
      mockUser.value = { id: '123', email: 'test@example.com' }
      const { isAuthenticated } = useAuth()
      expect(isAuthenticated.value).toBe(true)
    })

    it('should be false when user is not authenticated', () => {
      mockUser.value = null
      const { isAuthenticated } = useAuth()
      expect(isAuthenticated.value).toBe(false)
    })
  })
})