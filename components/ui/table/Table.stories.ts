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
  title: 'UI/Table',
  component: Table,
  subcomponents: {
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const invoices = [
  {
    invoice: 'INV001',
    paymentStatus: 'Paid',
    totalAmount: '$250.00',
    paymentMethod: 'Credit Card',
  },
  {
    invoice: 'INV002',
    paymentStatus: 'Pending',
    totalAmount: '$150.00',
    paymentMethod: 'PayPal',
  },
]

export const Default = {
  render: args => ({
    components: {
      Table,
      TableBody,
      TableCaption,
      TableCell,
      TableHead,
      TableHeader,
      TableRow,
    },
    setup() {
      return { ...args, invoices }
    },
    template: `
      <Table v-bind="args">
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
          <TableRow v-for="invoice in invoices" :key="invoice.invoice">
            <TableCell class="font-medium">
              {{ invoice.invoice }}
            </TableCell>
            <TableCell>{{ invoice.paymentStatus }}</TableCell>
            <TableCell>{{ invoice.paymentMethod }}</TableCell>
            <TableCell class="text-right">
              {{ invoice.totalAmount }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    `,
  }),
  args: {},
} satisfies Story