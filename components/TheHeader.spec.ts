import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import TheHeader from './TheHeader.vue'

describe('TheHeader', () => {
  it('renders the application name', async () => {
    const wrapper = await mountSuspended(TheHeader)
    expect(wrapper.text()).toContain('LiveSync Director')
  })

  it('renders navigation links', async () => {
    const wrapper = await mountSuspended(TheHeader)
    const links = wrapper.findAll('a')
    const hrefs = links.map(link => link.attributes('href'))

    expect(hrefs).toContain('/')
    expect(hrefs).toContain('/admin/cues')
    expect(hrefs).toContain('/admin/onair')
    expect(hrefs).toContain('/audience')
  })
})
