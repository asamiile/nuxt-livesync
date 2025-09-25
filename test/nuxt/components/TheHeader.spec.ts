import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { nextTick } from 'vue'
import TheHeader from '~/components/TheHeader/TheHeader.vue'
import { useSupabaseUser, useSupabaseClient } from '#imports'

const mockRoute = { path: '/' }
vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
}))

describe('TheHeader', () => {
  const user = useSupabaseUser()
  const client = useSupabaseClient()

  beforeEach(() => {
    vi.clearAllMocks()
    user.value = null
    mockRoute.path = '/admin/cues'
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
      user.value = { id: 'user-123', email: 'test@example.com' }
      const wrapper = await mountSuspended(TheHeader)
      await nextTick()

      const nav = wrapper.find('nav')
      expect(nav.exists()).toBe(true)

      const logoutButton = wrapper.find('button')
      expect(logoutButton.text()).toBe('ログアウト')
      await logoutButton.trigger('click')
      expect(client.auth.signOut).toHaveBeenCalledTimes(1)
    })

    it('/admin/login ページでは、認証済みでもナビゲーションが表示されないこと', async () => {
      user.value = { id: 'user-123', email: 'test@example.com' }
      mockRoute.path = '/admin/login'
      const wrapper = await mountSuspended(TheHeader)
      await nextTick()

      expect(wrapper.find('nav').exists()).toBe(false)
    })
  })
})