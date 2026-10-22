import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Table, useTableActions, useTableState } from '.'
import type { TableColumnsType, TableProps } from '.'

interface Row {
  key: string
  name: string
  clicks: number
  children?: Row[]
}

const ROWS: Row[] = [
  { key: 'a', name: 'Alpha', clicks: 20 },
  { key: 'b', name: 'Bravo', clicks: 5 },
  { key: 'c', name: 'Charlie', clicks: 12 },
]

const COLUMNS: TableColumnsType<Row> = [
  { key: 'name', dataIndex: 'name', title: 'Name' },
  {
    key: 'clicks',
    dataIndex: 'clicks',
    title: 'Clicks',
    sorter: (x, y) => x.clicks - y.clicks,
  },
]

function renderTable(props: Partial<TableProps<Row>> = {}) {
  return render(<Table<Row> columns={COLUMNS} dataSource={ROWS} {...props} />)
}

/** Body rows only (Ant Design adds hidden measure rows). */
const bodyRows = () =>
  Array.from(document.querySelectorAll<HTMLElement>('tr[data-row-key]'))

const rowNames = () =>
  bodyRows().map((row) => row.querySelector('td')?.textContent ?? '')

const rowByKey = (key: string) => {
  const row = document.querySelector<HTMLElement>(`tr[data-row-key="${key}"]`)
  if (!row) throw new Error(`No row with key ${key}`)
  return row
}

/** Toolbar content that reads the store, like a real "3 selected" label. */
function SelectionSummary() {
  const { selectedRowKeys, density, groupBy } = useTableState()
  return (
    <span data-testid="summary">
      {selectedRowKeys.join(',')}|{density}|{groupBy.join('>')}
    </span>
  )
}

function SelectButton({ keys }: { keys: string | string[] }) {
  const { setSelectedRowKeys, clearSelection } = useTableActions()
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSelectedRowKeys(keys)
        }}
      >
        select
      </button>
      <button type="button" onClick={clearSelection}>
        clear
      </button>
    </>
  )
}

const summary = () => screen.getByTestId('summary').textContent

describe('Table', () => {
  describe('rendering', () => {
    it('renders rows, the total row and the footer range', () => {
      renderTable({
        totalRow: { record: { clicks: 37 }, caption: '· 3 rows' },
        rowNoun: 'campaign rows',
        footerHint: 'Click a row',
      })
      expect(rowNames()).toEqual(['Alpha', 'Bravo', 'Charlie'])
      expect(screen.getByText('Total')).toBeTruthy()
      expect(screen.getByText('37')).toBeTruthy()
      expect(
        screen.getByText('1–3 of 3 campaign rows', { exact: false }),
      ).toBeTruthy()
      expect(screen.getByText('Click a row', { exact: false })).toBeTruthy()
    })

    it('shows the empty text when there are no rows', () => {
      renderTable({ dataSource: [], emptyText: 'Nothing here' })
      expect(screen.getByText('Nothing here')).toBeTruthy()
    })

    it('shows the loading state', () => {
      const { container } = renderTable({ loading: true })
      expect(container.querySelector('.ant-spin')).toBeTruthy()
    })

    it('hides one or several columns through columnsControl', () => {
      const { unmount } = renderTable({
        columnsControl: { hiddenKeys: 'clicks' },
      })
      expect(screen.queryByText('Clicks')).toBeNull()
      expect(screen.getByRole('button', { name: /Columns/ })).toBeTruthy()
      unmount()

      renderTable({ columnsControl: { hiddenKeys: ['clicks'] } })
      expect(screen.queryByText('Clicks')).toBeNull()
    })
  })

  describe('row clicks and active rows', () => {
    it('fires onRowClick on click and on Enter', () => {
      const onRowClick = vi.fn()
      renderTable({ onRowClick })
      fireEvent.click(screen.getByText('Bravo'))
      fireEvent.keyDown(rowByKey('c'), { key: 'Enter' })
      expect(onRowClick).toHaveBeenCalledTimes(2)
      expect(onRowClick.mock.calls[0]?.[0]).toMatchObject({ key: 'b' })
      expect(onRowClick.mock.calls[1]?.[0]).toMatchObject({ key: 'c' })
    })

    it('marks one active row', () => {
      renderTable({ onRowClick: vi.fn(), activeRowKey: 'b' })
      expect(rowByKey('a').getAttribute('aria-selected')).toBe('false')
      expect(rowByKey('b').getAttribute('aria-selected')).toBe('true')
    })

    it('marks several active rows', () => {
      renderTable({ onRowClick: vi.fn(), activeRowKey: ['a', 'c'] })
      expect(
        bodyRows().map((row) => row.getAttribute('aria-selected')),
      ).toEqual(['true', 'false', 'true'])
    })
  })

  describe('density', () => {
    it('toggles when uncontrolled and reports the change', () => {
      const onDensityChange = vi.fn()
      const { container } = renderTable({
        showDensityToggle: true,
        onDensityChange,
        toolbar: <SelectionSummary />,
      })
      const root = container.firstElementChild
      expect(root?.getAttribute('data-density')).toBe('comfortable')

      fireEvent.click(screen.getByRole('button', { name: /Compact/ }))
      expect(root?.getAttribute('data-density')).toBe('compact')
      expect(summary()).toContain('|compact|')
      expect(onDensityChange).toHaveBeenCalledWith('compact')
    })

    it('follows the prop when controlled', () => {
      const onDensityChange = vi.fn()
      const { container } = renderTable({
        showDensityToggle: true,
        density: 'comfortable',
        onDensityChange,
      })
      fireEvent.click(screen.getByRole('button', { name: /Compact/ }))
      expect(onDensityChange).toHaveBeenCalledWith('compact')
      expect(container.firstElementChild?.getAttribute('data-density')).toBe(
        'comfortable',
      )
    })
  })

  describe('selection', () => {
    it('keeps uncontrolled selection in the store', () => {
      const onChange = vi.fn()
      renderTable({
        rowSelection: { onChange },
        toolbar: <SelectionSummary />,
      })
      const checkbox = within(rowByKey('b')).getByRole('checkbox')
      fireEvent.click(checkbox)
      expect(summary().startsWith('b|')).toBe(true)
      expect(onChange).toHaveBeenCalledWith(
        ['b'],
        [expect.objectContaining({ key: 'b' })],
        expect.objectContaining({ type: 'single' }),
      )
    })

    it('selects several rows from code inside the table', () => {
      renderTable({
        rowSelection: {},
        toolbar: (
          <>
            <SelectionSummary />
            <SelectButton keys={['a', 'c']} />
          </>
        ),
      })
      fireEvent.click(screen.getByRole('button', { name: 'select' }))
      expect(summary().startsWith('a,c|')).toBe(true)
      const checkbox = within(rowByKey('c')).getByRole<HTMLInputElement>(
        'checkbox',
      )
      expect(checkbox.checked).toBe(true)

      fireEvent.click(screen.getByRole('button', { name: 'clear' }))
      expect(summary().startsWith('|')).toBe(true)
    })

    it('keeps only one key for a single (radio) selection', () => {
      const onChange = vi.fn()
      renderTable({
        rowSelection: { type: 'radio', onChange },
        toolbar: (
          <>
            <SelectionSummary />
            <SelectButton keys={['c', 'a']} />
          </>
        ),
      })
      fireEvent.click(screen.getByRole('button', { name: 'select' }))
      expect(summary().startsWith('c|')).toBe(true)
      expect(onChange).toHaveBeenCalledWith(
        ['c'],
        [expect.objectContaining({ key: 'c' })],
        { type: 'multiple' },
      )
    })

    it('leaves controlled selection to the parent', () => {
      const onChange = vi.fn()
      renderTable({
        rowSelection: { selectedRowKeys: ['a'], onChange },
        toolbar: <SelectionSummary />,
      })
      fireEvent.click(within(rowByKey('b')).getByRole('checkbox'))
      expect(onChange).toHaveBeenCalled()
      expect(summary().startsWith('a|')).toBe(true)
    })
  })

  describe('sorting and pagination', () => {
    it('sorts rows when a sortable header is clicked', () => {
      const onChange = vi.fn()
      renderTable({ onChange })
      const header = screen
        .getAllByText('Clicks')
        .find((element) => element.closest('th'))
      if (!header) throw new Error('No Clicks header')
      fireEvent.click(header)
      expect(rowNames()).toEqual(['Bravo', 'Charlie', 'Alpha'])
      expect(onChange.mock.calls[0]?.[3]).toMatchObject({ action: 'sort' })
    })

    it('pages rows and shows the range', () => {
      const many: Row[] = Array.from({ length: 30 }, (_, index) => ({
        key: String(index),
        name: `Row ${String(index)}`,
        clicks: index,
      }))
      renderTable({ dataSource: many, pagination: { pageSize: 10 } })
      expect(bodyRows()).toHaveLength(10)
      expect(screen.getByText('1–10 of 30 rows', { exact: false })).toBeTruthy()

      fireEvent.click(screen.getByTitle('2'))
      expect(rowNames()[0]).toBe('Row 10')
      expect(
        screen.getByText('11–20 of 30 rows', { exact: false }),
      ).toBeTruthy()
    })
  })

  describe('toolbar', () => {
    it('reports search text', () => {
      const onSearch = vi.fn()
      renderTable({ search: { onSearch, placeholder: 'Find' } })
      fireEvent.change(screen.getByLabelText('Find'), {
        target: { value: 'alp' },
      })
      expect(onSearch).toHaveBeenCalledWith('alp')
    })

    it('accepts one or several group-by dimensions', () => {
      const options = [
        { value: 'bundle', label: 'Bundle' },
        { value: 'publisher', label: 'Publisher' },
      ]
      const { unmount } = renderTable({
        groupBy: { options, defaultValue: 'bundle' },
        toolbar: <SelectionSummary />,
      })
      expect(summary().endsWith('|bundle')).toBe(true)
      unmount()

      renderTable({
        groupBy: { options, value: ['bundle', 'publisher'] },
        toolbar: <SelectionSummary />,
      })
      expect(summary().endsWith('|bundle>publisher')).toBe(true)
      expect(screen.getByText('Publisher')).toBeTruthy()
    })
  })

  describe('tree rows', () => {
    const tree: Row[] = [
      {
        key: 'p',
        name: 'Parent',
        clicks: 0,
        children: Array.from({ length: 12 }, (_, index) => ({
          key: `p-${String(index)}`,
          name: `Child ${String(index)}`,
          clicks: index,
        })),
      },
    ]

    it('shows a spinner for one loading row', () => {
      renderTable({ dataSource: tree, loadingRowKeys: 'p' })
      const caret = screen.getByRole('button', { name: 'Expand row' })
      expect(caret.getAttribute('aria-busy')).toBe('true')
    })

    it('expands a row and pages its children', () => {
      renderTable({ dataSource: tree, childPageSize: 5 })
      fireEvent.click(screen.getByRole('button', { name: 'Expand row' }))
      expect(rowNames()).toEqual([
        'Parent',
        'Child 0',
        'Child 1',
        'Child 2',
        'Child 3',
        'Child 4',
      ])
      expect(screen.getByText('1–5 of 12')).toBeTruthy()

      fireEvent.click(screen.getByTitle('3'))
      expect(rowNames()).toEqual(['Parent', 'Child 10', 'Child 11'])
    })

    it('starts with every row open for defaultExpandAllRows', () => {
      renderTable({
        dataSource: tree,
        expandable: { defaultExpandAllRows: true },
      })
      expect(bodyRows()).toHaveLength(13)
    })
  })
})

describe('store hooks', () => {
  it('throw outside a Table', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    expect(() => render(<SelectionSummary />)).toThrow(
      'useTableState must be used inside a Table',
    )
    consoleError.mockRestore()
  })
})
