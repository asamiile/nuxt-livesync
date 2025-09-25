import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '~/components/ui/navigation-menu'

describe('NavigationMenu', () => {
  it('renders correctly', async () => {
    const wrapper = mount({
      components: {
        NavigationMenu,
        NavigationMenuList,
        NavigationMenuItem,
        NavigationMenuTrigger,
        NavigationMenuLink,
      },
      template: `
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/">
                Link
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      `,
    })

    expect(wrapper.html()).toContain('Getting started')
  })
})