import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, reactive, nextTick } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import TheHeader from '~/components/TheHeader/TheHeader.vue'

// --- Mocks ---

// useAuth (local composable) is auto-imported by Nuxt, so we use mockNuxtImport
const mockIsAuthenticated = ref(false)
const mockLogout = vi.fn()
mockNuxtImport('useAuth', () => {
  return () => ({
    isAuthenticated: mockIsAuthenticated,
    logout: mockLogout,
  })
})

// useRoute is imported directly from 'vue-router', so we use vi.mock
const mockRoute = reactive({
  path: '/',
})
vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  // Provide a mock for other vue-router exports if needed, like NuxtLink stub
  useRouter: () => ({})
}))


// --- Tests ---

describe('TheHeader.vue', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockIsAuthenticated.value = false
    mockRoute.path = '/'
    mockLogout.mockClear()
  })

  const mountComponent = () => {
    return mountSuspended(TheHeader, {
      global: {
        stubs: {
          // Stubbing ClientOnly is still a good practice for predictability
          ClientOnly: { template: '<div><slot /></div>' },
          // Stub NuxtLink to avoid complexities with vue-router
          NuxtLink: { template: '<a><slot /></a>' }
        }
      }
    })
  }

  it('should display admin controls when authenticated on admin pages', async () => {
    const wrapper = await mountComponent()

    mockIsAuthenticated.value = true
    mockRoute.path = '/admin/cues'
    await nextTick()

    expect(wrapper.find('nav').exists()).toBe(true)
    expect(wrapper.find('button').text()).toContain('ログアウト')
  })

  it('should not display admin controls when not authenticated', async () => {
    const wrapper = await mountComponent()
    mockRoute.path = '/admin/cues'
    await nextTick()
    expect(wrapper.find('nav').exists()).toBe(false)
  })

  it('should not display admin controls on the login page even if authenticated', async () => {
    const wrapper = await mountComponent()
    mockIsAuthenticated.value = true
    mockRoute.path = '/admin/login'
    await nextTick()
    expect(wrapper.find('nav').exists()).toBe(false)
  })

  it('should call logout when logout button is clicked', async () => {
    const wrapper = await mountComponent()
    mockIsAuthenticated.value = true
    mockRoute.path = '/admin/cues'
    await nextTick()

    const logoutButton = wrapper.find('button')
    expect(logoutButton.exists()).toBe(true)
    await logoutButton.trigger('click')

    expect(mockLogout).toHaveBeenCalledOnce()
  })
})