import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type Key } from 'react'
import { fn, userEvent, within } from 'storybook/test'
import { Button } from '../../Button'
import { Icon } from '../../icons'
import { ToggleButton } from '../../ToggleButton'
import { Table, TableGroupBy, TableRowLabel, TableValue } from '..'
import type { TableColumnsType, TableProps } from '..'
import {
  ADVERTISERS,
  ADVERTISER_COLUMNS,
  ADVERTISER_TOTALS,
  CAMPAIGNS,
  CAMPAIGN_COLUMNS,
  CAMPAIGN_TOTALS,
  FRAUD_COLUMNS,
  FRAUD_ROWS,
  PUBLISHERS,
  PUBLISHER_TOTALS,
  metricColumn,
  type CampaignRow,
  type PublisherRow,
} from './tableData'

type CampaignTableProps = TableProps<CampaignRow>

const meta = {
  title: 'Components/Table',
  component: Table<CampaignRow>,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    columns: CAMPAIGN_COLUMNS,
    dataSource: CAMPAIGNS,
    totalRow: CAMPAIGN_TOTALS,
    rowNoun: 'campaign rows',
    footerHint: 'Click a row for details',
    showDensityToggle: true,
    search: true,
    defaultDensity: 'comfortable',
    loading: false,
    onRowClick: fn(),
    onChange: fn(),
    onDensityChange: fn(),
  },
  argTypes: {
    density: { control: 'inline-radio', options: ['comfortable', 'compact'] },
    defaultDensity: {
      control: 'inline-radio',
      options: ['comfortable', 'compact'],
    },
    loading: { control: 'boolean' },
    showDensityToggle: { control: 'boolean' },
    emptyText: { control: 'text' },
    rowNoun: { control: 'text' },
    footerHint: { control: 'text' },
    columns: { control: false },
    dataSource: { control: false },
    totalRow: { control: false },
  },
  // Figma table cards are 1168px wide; they shrink with the canvas.
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1168 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Table<CampaignRow>>

export default meta
type Story = StoryObj<typeof meta>

const groupBy = (
  <TableGroupBy levels={['Campaign', 'App bundle', 'Publisher']} />
)

const columnsButton = (count: string) => (
  <Button size="md" icon={<Icon name="cols" size={16} />} suffix={count}>
    Columns
  </Button>
)

// Search over the label and the muted name, keeping parents of matches.
function filterTree(rows: CampaignRow[], query: string): CampaignRow[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return rows
  return rows.flatMap((row) => {
    const children = row.children ? filterTree(row.children, needle) : []
    const matches = `${row.title} ${row.meta ?? ''}`
      .toLowerCase()
      .includes(needle)
    if (matches) return [row]
    return children.length > 0 ? [{ ...row, children }] : []
  })
}

// Full report card: group-by, search, density, columns, total row, sorting,
// pagination and a row click that marks the row whose drawer is open.
function ReportTable(args: CampaignTableProps) {
  const [query, setQuery] = useState('')
  const [activeKey, setActiveKey] = useState<Key>()
  const rows = filterTree(CAMPAIGNS, query)
  return (
    <Table<CampaignRow>
      {...args}
      dataSource={rows}
      toolbar={groupBy}
      actions={columnsButton('19 of 138')}
      search={{ value: query, onSearch: setQuery }}
      {...(activeKey !== undefined && { activeRowKey: activeKey })}
      onRowClick={(record, index, event) => {
        setActiveKey((current) =>
          current === record.key ? undefined : record.key,
        )
        args.onRowClick?.(record, index, event)
      }}
    />
  )
}

export const Default: Story = {
  render: (args) => <ReportTable {...args} />,
}

// ---- Figma: Body rows ------------------------------------------------------
// Clickable rows: hover them, Tab to focus, Enter / click to select.
export const RowStates: Story = {
  args: {
    dataSource: CAMPAIGNS.slice(0, 4),
    activeRowKey: '31023',
    search: false,
    showDensityToggle: false,
    pagination: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.hover(canvas.getByText('52011'))
  },
}

// ---- Figma: Table with two levels expanded ---------------------------------
export const TwoLevelsExpanded: Story = {
  args: {
    expandable: { defaultExpandedRowKeys: ['26389', '26389-bundle'] },
  },
  render: (args) => <ReportTable {...args} />,
}

// Children are fetched when a row opens; the caret spins meanwhile.
export const LazyLoadedChildren: Story = {
  args: { search: false },
  render: function LazyTable(args) {
    const [rows, setRows] = useState(() =>
      CAMPAIGNS.map((row) => ({ ...row, children: [] as CampaignRow[] })),
    )
    const [loadingKeys, setLoadingKeys] = useState<Key[]>([])

    const loadChildren = (record: CampaignRow) => {
      setLoadingKeys((keys) => [...keys, record.key])
      window.setTimeout(() => {
        const source = CAMPAIGNS.find((row) => row.key === record.key)
        setRows((current) =>
          current.map((row) =>
            row.key === record.key
              ? { ...row, children: source?.children ?? [] }
              : row,
          ),
        )
        setLoadingKeys((keys) => keys.filter((key) => key !== record.key))
      }, 1200)
    }

    return (
      <Table<CampaignRow>
        {...args}
        dataSource={rows}
        loadingRowKeys={loadingKeys}
        expandable={{
          onExpand: (expanded, record) => {
            if (expanded && record.children?.length === 0) loadChildren(record)
          },
        }}
      />
    )
  },
}

// ---- Figma: Compact density and empty state --------------------------------
export const Compact: Story = {
  args: { defaultDensity: 'compact' },
  render: (args) => <ReportTable {...args} />,
}

export const Empty: Story = {
  args: {
    dataSource: [],
    totalRow: { ...CAMPAIGN_TOTALS, caption: '· 0 campaign rows' },
  },
}

export const Loading: Story = {
  args: { loading: true },
}

// ---- Selection, sorting, filtering -----------------------------------------
export const RowSelection: Story = {
  args: { search: false, showDensityToggle: false },
  render: function SelectableTable(args) {
    const [selected, setSelected] = useState<Key[]>(['52011'])
    return (
      <Table<CampaignRow>
        {...args}
        dataSource={CAMPAIGNS.map(({ children: _children, ...row }) => row)}
        toolbar={
          <span style={{ fontSize: 12.5, color: '#475467' }}>
            {selected.length} selected
          </span>
        }
        actions={
          <Button
            size="md"
            icon={<Icon name="download" size={16} />}
            disabled={selected.length === 0}
          >
            Export
          </Button>
        }
        rowSelection={{
          selectedRowKeys: selected,
          onChange: (keys) => {
            setSelected(keys)
          },
          getCheckboxProps: (record) => ({
            disabled: record.status === 'stopped',
          }),
        }}
      />
    )
  },
}

const VERTICALS = ['Wink', 'Bank', 'C2C', 'Food', 'Shop Sale', 'Puzzle']

const filterableColumns: TableColumnsType<CampaignRow> = [
  {
    ...CAMPAIGN_COLUMNS[0],
    filters: VERTICALS.map((vertical) => ({ text: vertical, value: vertical })),
    onFilter: (value, record) =>
      record.meta?.startsWith(String(value)) ?? false,
    sorter: (a, b) => a.title.localeCompare(b.title),
  },
  ...CAMPAIGN_COLUMNS.slice(1),
]

export const SortingAndFiltering: Story = {
  args: {
    columns: filterableColumns,
    dataSource: CAMPAIGNS.map(({ children: _children, ...row }) => row),
    search: false,
  },
}

// 60 rows. "Rows per page" is an Ant Design Select; the page size is kept in
// state here to show it stays in sync with the table's pagination.
const MANY_CAMPAIGNS: CampaignRow[] = Array.from({ length: 60 }, (_, index) => {
  const { children: _children, ...source } = CAMPAIGNS[index % CAMPAIGNS.length]
  const id = String(10000 + index)
  return { ...source, key: id, title: id }
})

export const Pagination: Story = {
  args: { search: false, showDensityToggle: false },
  render: function PaginatedTable(args) {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    return (
      <Table<CampaignRow>
        {...args}
        dataSource={MANY_CAMPAIGNS}
        totalRow={{ ...CAMPAIGN_TOTALS, caption: '· 60 campaign rows' }}
        toolbar={
          <span style={{ fontSize: 12.5, color: '#475467' }}>
            Page {page} · {pageSize} rows per page
          </span>
        }
        pagination={{
          current: page,
          pageSize,
          pageSizeOptions: [10, 25, 50, 100],
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage)
            setPageSize(nextPageSize)
          },
        }}
      />
    )
  },
}

// ---- Layout ----------------------------------------------------------------
// First column stays put while the metrics scroll; the header and total row
// stay visible while the body scrolls.
export const FixedColumnAndScroll: Story = {
  args: {
    columns: [
      { ...CAMPAIGN_COLUMNS[0], fixed: 'start' },
      ...CAMPAIGN_COLUMNS.slice(1),
    ],
    scroll: { y: 260 },
    search: false,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
}

// Toolbar and footer wrap on small screens; the table scrolls sideways.
export const Responsive: Story = {
  args: {
    columns: [
      { ...CAMPAIGN_COLUMNS[0], fixed: 'start', width: 160 },
      ...CAMPAIGN_COLUMNS.slice(1),
    ],
  },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => <ReportTable {...args} />,
}

// No toolbar, no total row, no pagination: just the grid.
export const Plain: Story = {
  render: () => (
    <Table<CampaignRow>
      columns={CAMPAIGN_COLUMNS}
      dataSource={CAMPAIGNS.slice(0, 5).map(({ children: _c, ...row }) => row)}
      pagination={false}
    />
  ),
}

// ---- Figma: table cards ----------------------------------------------------
export const AdvertiserOverview: StoryObj = {
  render: () => (
    <Table
      columns={ADVERTISER_COLUMNS}
      dataSource={ADVERTISERS}
      totalRow={ADVERTISER_TOTALS}
      toolbar={
        <TableGroupBy levels={['Country', 'Sales Manager', 'Campaign']} />
      }
      actions={columnsButton('8 of 138')}
      search
      showDensityToggle
      rowNoun="country rows"
      footerHint="Click a row for details"
      onRowClick={fn()}
    />
  ),
}

export const FraudAndCtit: StoryObj = {
  render: () => (
    <Table
      columns={FRAUD_COLUMNS}
      dataSource={FRAUD_ROWS}
      toolbar={<TableGroupBy levels={['Publisher']} />}
      search
      rowNoun="publisher rows"
    />
  ),
}

// "% of installs" adds each event's share; the funnel total is tinted.
export const PublisherShareOfInstalls: StoryObj = {
  render: function PublisherTable() {
    const [showShare, setShowShare] = useState(true)

    const eventColumn = (key: keyof PublisherRow, title: string) =>
      metricColumn<PublisherRow>(key, title, 'number', {
        sorter: false,
        render: (value: number, record) => {
          const installs =
            record.installs === 0 ? 0 : (value / record.installs) * 100
          return (
            <TableValue
              value={value}
              {...(showShare && {
                share: Number.isFinite(installs) ? installs : 0,
              })}
            />
          )
        },
      })

    const columns: TableColumnsType<PublisherRow> = [
      {
        key: 'publisher',
        title: 'Publisher',
        dataIndex: 'publisher',
        width: 230,
        fixed: 'start',
        render: (_value, record) => (
          <TableRowLabel title={record.publisher} meta={record.meta} />
        ),
      },
      {
        key: 'traffic',
        title: 'Traffic',
        children: [
          metricColumn('impressions', 'Impressions'),
          metricColumn('grossClicks', 'Gross clicks', 'number', {
            defaultSortOrder: 'descend',
          }),
          metricColumn('mmpClicks', 'MMP clicks'),
          metricColumn('clicks', 'Clicks'),
        ],
      },
      {
        key: 'installs',
        title: 'Installs',
        children: [metricColumn('installs', 'MMP installs')],
      },
      {
        key: 'lowFunnel',
        title: 'Low funnel',
        children: [
          metricColumn('funnelTotal', 'Total', 'number', { highlight: true }),
          eventColumn('firstOpen', 'first_open'),
          eventColumn('appOpen', 'app_open'),
          eventColumn('login', 'login'),
          eventColumn('sessionStart', 'session_start'),
          eventColumn('viewContent', 'view_content'),
        ],
      },
    ]

    return (
      <Table<PublisherRow>
        columns={columns}
        dataSource={PUBLISHERS}
        totalRow={PUBLISHER_TOTALS}
        toolbar={<TableGroupBy levels={['Publisher']} />}
        extra={
          <ToggleButton
            size="sm"
            label="% of installs"
            labelPosition="end"
            checked={showShare}
            onChange={setShowShare}
          />
        }
        search
        showDensityToggle
        actions={columnsButton('33 of 144')}
        rowNoun="publisher rows"
        footerHint="Click a row for details"
        onRowClick={fn()}
      />
    )
  },
}
