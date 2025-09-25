import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import LoginPage from '~/pages/admin/login.vue'
import { nextTick, ref } from 'vue'

// --- Mocks ---
const mockRouter = {
  push: vi.fn(),
}
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

const mockToast = vi.fn()
vi.mock('@/components/ui/toast/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

const mockSignIn = vi.fn()
const mockSupabase = {
  auth: {
    signInWithPassword: mockSignIn,
  },
}
const mockUser = ref(null)

vi.mock('#imports', () => ({
  useSupabaseClient: () => mockSupabase,
  useSupabaseUser: () => mockUser,
}))
// --- End Mocks ---

describe('pages/admin/login.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRouter.push.mockClear()
    mockToast.mockClear()
    mockUser.value = null
  })

  it('フォームを送信すると、signInWithPasswordが呼ばれること', async () => {
    const wrapper = await mountSuspended(LoginPage)
    const email = 'test@example.com'
    const password = 'password123'
    await wrapper.find('input[name="email"]').setValue(email)
    await wrapper.find('input[name="password"]').setValue(password)
    await wrapper.find('form').trigger('submit.prevent')
    expect(mockSignIn).toHaveBeenCalledWith({
      email,
      password,
    })
  })

  it('ログインに成功すると、/admin/cuesにリダイレクトされること', async () => {
    mockSignIn.mockResolvedValue({ data: { user: {id: '123'} }, error: null })
    const wrapper = await mountSuspended(LoginPage)
    await wrapper.find('input[name="email"]').setValue('test@example.com')
    await wrapper.find('input[name="password"]').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    // ログイン成功をシミュレートするためにuserの値を更新
    mockUser.value = { id: '123' }
    await nextTick()
    await nextTick()

    expect(mockRouter.push).toHaveBeenCalledWith('/admin/cues')
  })

  it('ログインに失敗すると、エラーメッセージがトーストで表示されること', async () => {
    const errorMessage = 'Invalid login credentials'
    mockSignIn.mockResolvedValue({ data: { user: null }, error: { message: errorMessage } })
    const wrapper = await mountSuspended(LoginPage)
    await wrapper.find('input[name="email"]').setValue('wrong@example.com')
    await wrapper.find('input[name="password"]').setValue('wrongpassword')
    await wrapper.find('form').trigger('submit.prevent')
    await nextTick()
    await nextTick()
    expect(mockToast).toHaveBeenCalledWith({
      title: 'ログイン失敗',
      description: errorMessage,
      variant: 'destructive',
    })
    expect(mockRouter.push).not.toHaveBeenCalled()
  })
})