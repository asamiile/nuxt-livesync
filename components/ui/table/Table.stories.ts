import type { Meta, StoryObj } from '@storybook/vue3'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '.'

const meta = {
  title: 'Component/Table',
  component: Table,
  tags: ['autodocs'],
  render: (args: any) => ({
    components: {
      Table,
      TableBody,
      TableCaption,
      TableCell,
      TableHead,
      TableHeader,
      TableRow,
    },
    template: `
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[100px]">
              Invoice
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead class="text-right">
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell class="font-medium">
              INV001
            </TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Credit Card</TableCell>
            <TableCell class="text-right">
              $250.00
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    `,
  }),
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
