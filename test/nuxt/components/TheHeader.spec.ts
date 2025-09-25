import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { reactive, nextTick } from 'vue'
import TheHeader from '~/components/TheHeader/TheHeader.vue'

const { useAuth } = await import('~/composables/useAuth')
const { isAuthenticated, logout } = useAuth()

const mockRoute = reactive({ path: '/admin/cues' })
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return { ...actual, useRoute: () => mockRoute }
})

describe('TheHeader', () => {
  beforeEach(() => {
    isAuthenticated.value = false
    mockRoute.path = '/admin/cues'
    vi.clearAllMocks()
  })

  it('アプリ名「LiveSync Director」が正しく表示されていること', async () => {
    const wrapper = await mountSuspended(TheHeader)
    expect(wrapper.find('a').text()).toBe('LiveSync Director')
  })

  describe('ナビゲーション', () => {
    it('非認証状態では、管理者用ナビゲーションが表示されないこと', async () => {
      const wrapper = await mountSuspended(TheHeader)
      expect(wrapper.find('nav').exists()).toBe(false)
    })

    it('認証状態では、管理者用ナビゲーションとログアウトボタンが表示されること', async () => {
      isAuthenticated.value = true
      await nextTick()

      const wrapper = await mountSuspended(TheHeader)
      expect(wrapper.vm.isAuthenticated.value).toBe(true)

      const nav = wrapper.find('nav')
      expect(nav.exists()).toBe(true)

      const logoutButton = wrapper.find('button', { text: 'ログアウト' })
      await logoutButton.trigger('click')
      expect(logout).toHaveBeenCalledTimes(1)
    })

    it('/admin/login ページでは、認証済みでもナビゲーションが表示されないこと', async () => {
      isAuthenticated.value = true
      mockRoute.path = '/admin/login'
      await nextTick()

      const wrapper = await mountSuspended(TheHeader)
      expect(wrapper.find('nav').exists()).toBe(false)
    })
  })
})
