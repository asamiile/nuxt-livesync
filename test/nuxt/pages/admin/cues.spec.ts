import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CuesPage from '~/pages/admin/cues.vue'
import type { Cue } from '~/types/cue'
import { nextTick } from 'vue'

// DialogコンポーネントはTeleportを使っており、テストが複雑になるため
// DialogContentの表示を追跡しやすくするためにモック化も検討できるが、
// 今回はradix-vueの動作を信頼し、DOMの存在チェックで進める。

describe('pages/admin/cues.vue', () => {
  it('ダミーの演出リストを渡した際に、Tableが正しい行数で描画されること', async () => {
    const wrapper = await mountSuspended(CuesPage, {
      // shallow: true, // 子コンポーネントをスタブ化してテストを分離する場合
    })

    const dummyCues: Cue[] = [
      { id: 'c1', name: 'Test Cue 1', type: 'color', value: '#111111' },
      { id: 'c2', name: 'Test Cue 2', type: 'animation', value: 'url1' },
      { id: 'c3', name: 'Test Cue 3', type: 'color', value: '#222222' },
    ]

    // defineExposeで公開されたcues refの値を直接書き換える
    wrapper.vm.cues.value = dummyCues
    await nextTick()

    // tbody内のtr要素を数えるのが確実
    const bodyRows = wrapper.findAll('tbody tr')
    expect(bodyRows.length).toBe(dummyCues.length)
  })

  it('「新規演出を追加」ボタンをクリックすると、isDialogOpenの状態がtrueに変わること', async () => {
    const wrapper = await mountSuspended(CuesPage)

    // 初期状態はfalseであること
    expect(wrapper.vm.isDialogOpen.value).toBe(false)

    // ボタンをクリック
    const addButton = wrapper.find('button', { text: '新規演出を追加' })
    await addButton.trigger('click')
    await nextTick()

    // 状態がtrueに変わることを確認
    expect(wrapper.vm.isDialogOpen.value).toBe(true)
  })
})
