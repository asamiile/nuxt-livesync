import type { Meta, StoryObj } from '@storybook/vue3'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '.'

const meta = {
  title: 'UI/NavigationMenu',
  component: NavigationMenu,
  subcomponents: {
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
  },
} satisfies Meta<typeof NavigationMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  render: args => ({
    components: {
      NavigationMenu,
      NavigationMenuContent,
      NavigationMenuItem,
      NavigationMenuLink,
      NavigationMenuList,
      NavigationMenuTrigger,
    },
    setup() {
      return { args }
    },
    template: `
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul class="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li class="row-span-3">
                  <NavigationMenuLink as-child>
                    <a
                      class="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      href="/"
                    >
                      <div class="mb-2 mt-4 text-lg font-medium">
                        shadcn/ui
                      </div>
                      <p class="text-sm leading-tight text-muted-foreground">
                        Beautifully designed components built with Radix UI and
                        Tailwind CSS.
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink as-child>
                    <a href="/" class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div class="text-sm font-medium leading-none">Introduction</div>
                      <p class="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Re-usable components built using Radix UI and Tailwind CSS.
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    `,
  }),
  args: {},
} satisfies Story