import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { ref, reactive } from 'vue'
import TheHeader from '~/components/TheHeader/TheHeader.vue'

// リアクティブな状態をモックの外部で定義
const mockAuthToken = ref<string | null>(null)
const mockRoute = reactive({ path: '/admin/cues' })

// useAuth composableをモック
vi.mock('~/composables/useAuth', () => ({
  useAuth: () => ({
    authToken: mockAuthToken,
    logout: vi.fn(),
  }),
}))

// vue-routerをモック
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    // useRouteがリアクティブなオブジェクトを返すようにする
    useRoute: () => mockRoute,
  }
})

describe('TheHeader', () => {
  // 各テストの前に状態をリセット
  beforeEach(() => {
    mockAuthToken.value = null
    mockRoute.path = '/admin/cues' // reactiveオブジェクトのプロパティを更新
    vi.clearAllMocks()
  })

  it('アプリ名「LiveSync Director」が正しく表示されていること', async () => {
    const wrapper = await mountSuspended(TheHeader)
    const h1 = wrapper.find('h1')
    const link = h1.find('a')
    expect(link.text()).toBe('LiveSync Director')
  })

  describe('ナビゲーション', () => {
    it('非認証状態では、管理者用ナビゲーションが表示されないこと', async () => {
      const wrapper = await mountSuspended(TheHeader)
      const nav = wrapper.find('nav')
      expect(nav.exists()).toBe(false)
    })

    it('認証状態では、管理者用ナビゲーションとログアウトボタンが表示されること', async () => {
      // 状態を「認証済み」に変更
      mockAuthToken.value = 'fake-token'

      const wrapper = await mountSuspended(TheHeader)

      const nav = wrapper.find('nav')
      expect(nav.exists()).toBe(true)

      const links = wrapper.findAllComponents({ name: 'NuxtLink' })
      const adminCuesLink = links.find(link => link.props('to') === '/admin/cues')
      const adminOnAirLink = links.find(link => link.props('to') === '/admin/onair')

      expect(adminCuesLink).toBeDefined()
      expect(adminOnAirLink).toBeDefined()
      expect(adminCuesLink?.text()).toBe('演出管理')
      expect(adminOnAirLink?.text()).toBe('本番操作')

      const logoutButton = wrapper.findComponent({ name: 'Button' })
      expect(logoutButton.exists()).toBe(true)
      expect(logoutButton.text()).toBe('ログアウト')
    })

    it('/admin/login ページでは、認証済みでもナビゲーションが表示されないこと', async () => {
      // 状態を「認証済み」かつ「ログインページ」に変更
      mockAuthToken.value = 'fake-token'
      mockRoute.path = '/admin/login'

      const wrapper = await mountSuspended(TheHeader)
      const nav = wrapper.find('nav')
      expect(nav.exists()).toBe(false)
    })
  })
})
