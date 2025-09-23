import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import TheHeader from '~/components/TheHeader/TheHeader.vue'

describe('TheHeader', () => {
  it('アプリ名「LiveSync Director」が正しく表示されていること', async () => {
    const wrapper = await mountSuspended(TheHeader)
    // h1タグの中にNuxtLinkがあり、そのテキストをチェックする
    const h1 = wrapper.find('h1')
    const link = h1.find('a') // NuxtLinkはaタグとしてレンダリングされる
    expect(link.text()).toBe('LiveSync Director')
  })

  it('管理者ページと観客ページへのナビゲーションリンクが存在すること', async () => {
    const wrapper = await mountSuspended(TheHeader)
    const links = wrapper.findAllComponents({ name: 'NuxtLink' })

    // to属性を元にリンクの存在を確認
    const adminCuesLink = links.find(link => link.props('to') === '/admin/cues')
    const adminOnAirLink = links.find(link => link.props('to') === '/admin/onair')
    const audienceLink = links.find(link => link.props('to') === '/audience')

    expect(adminCuesLink).toBeDefined()
    expect(adminOnAirLink).toBeDefined()
    expect(audienceLink).toBeDefined()

    // 日本語の指示に合わせて、管理者ページと観客ページへのリンクがあることを確認
    // ここではcuesとonairを管理者ページへのリンク、audienceを観客ページへのリンクとする
    expect(adminCuesLink?.text()).toBe('Cues')
    expect(adminOnAirLink?.text()).toBe('OnAir')
    expect(audienceLink?.text()).toBe('Audience View')
  })
})
