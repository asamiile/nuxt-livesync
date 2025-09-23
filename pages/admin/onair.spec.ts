import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import OnAirPage from './onair.vue'
import type { Cue } from '~/types/cue'
import { nextTick } from 'vue'

// useToastをモック化
// このコンポーネントはuseToastを使用しているため、テスト環境で動作するようにモックが必要
vi.mock('@/components/ui/toast/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

describe('pages/admin/onair.vue', () => {
  // console.logをスパイする
  const consoleLogSpy = vi.spyOn(console, 'log')

  beforeEach(() => {
    // 各テストの前にスパイをリセット
    consoleLogSpy.mockClear()
  })

  afterEach(() => {
    // テスト後にスパイを復元
    consoleLogSpy.mockRestore()
  })

  it('ダミーの演出リストを渡した際に、正しい数のボタンがグリッド表示されること', async () => {
    const wrapper = await mountSuspended(OnAirPage)

    const dummyCues: Cue[] = [
      { id: 'c1', name: 'Cue 1', type: 'color', value: '#ff0000' },
      { id: 'c2', name: 'Cue 2', type: 'animation', value: 'url1' },
      { id: 'c3', name: 'Cue 3', type: 'color', value: '#00ff00' },
    ]

    // defineExposeで公開されたcues refの値を直接書き換える
    wrapper.vm.cues.value = dummyCues
    await nextTick()

    const buttons = wrapper.findAllComponents({ name: 'Button' })
    expect(buttons.length).toBe(dummyCues.length)
  })

  it('ボタンをクリックした際に、console.logが呼び出されることを確認', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log')
    const wrapper = await mountSuspended(OnAirPage)

    const dummyCues: Cue[] = [
      { id: 'c1', name: 'My Test Cue', type: 'color', value: '#ffffff' },
    ]

    // defineExposeで公開されたcues refの値を直接書き換える
    wrapper.vm.cues.value = dummyCues
    await nextTick()

    const button = wrapper.findComponent({ name: 'Button' })
    expect(button.exists()).toBe(true)

    await button.trigger('click')

    // スパイされた関数を期待する
    expect(consoleLogSpy).toHaveBeenCalledOnce()
    expect(consoleLogSpy).toHaveBeenCalledWith('Button clicked: My Test Cue')

    consoleLogSpy.mockRestore()
  })
})
