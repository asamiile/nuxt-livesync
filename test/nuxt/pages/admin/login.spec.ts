import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import LoginPage from '~/pages/admin/login.vue'

// --- Mocks ---

// useAuth is auto-imported by Nuxt, so we use mockNuxtImport
const mockLogin = vi.fn()
mockNuxtImport('useAuth', () => {
  return () => ({
    login: mockLogin,
  })
})

// useToast is imported from a specific path, so we use vi.mock
const mockToast = vi.fn()
vi.mock('@/components/ui/toast/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

// navigateTo is auto-imported and called on successful login, so it needs a mock.
const mockNavigateTo = vi.fn()
mockNuxtImport('navigateTo', () => {
  return (path: string) => mockNavigateTo(path)
})


// --- Tests ---

describe('pages/admin/login.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call login with email and password when form is submitted', async () => {
    const wrapper = await mountSuspended(LoginPage)

    const email = 'test@example.com'
    const password = 'password123'

    // Set input values
    await wrapper.find('input[type="email"]').setValue(email)
    await wrapper.find('input[type="password"]').setValue(password)

    // Submit the form
    await wrapper.find('form').trigger('submit.prevent')

    // Assert that login was called with correct arguments
    expect(mockLogin).toHaveBeenCalledOnce()
    expect(mockLogin).toHaveBeenCalledWith(email, password)
  })

  it('should show a toast message if fields are empty', async () => {
    const wrapper = await mountSuspended(LoginPage)

    // Submit the form with empty fields
    await wrapper.find('form').trigger('submit.prevent')

    // Assert that toast is called
    expect(mockToast).toHaveBeenCalledOnce()
    expect(mockToast).toHaveBeenCalledWith({
      title: 'エラー',
      description: 'メールアドレスとパスワードを入力してください。',
      variant: 'destructive',
    })

    // Assert that login was not called
    expect(mockLogin).not.toHaveBeenCalled()
  })
})