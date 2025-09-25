import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'

describe('Table', () => {
  it('renders correctly', async () => {
    const wrapper = mount({
      components: {
        Table,
        TableHeader,
        TableRow,
        TableHead,
        TableBody,
        TableCell,
      },
      template: `
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john.doe@example.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      `,
    })

    expect(wrapper.html()).toContain('John Doe')
  })
})