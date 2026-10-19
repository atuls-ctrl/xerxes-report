import { useState, type Key } from 'react'
import {
  DEFAULT_COLORS,
  LineChart,
  type LineChartSeries,
} from '../../components/Charts/LineChart'
import { MetricTile, type MetricTileStatus } from '../../components/MetricTile'
import { Table } from '../../components/Table'
// Placeholder rows shared with the Table stories until the API is wired up.
import {
  CAMPAIGNS,
  CAMPAIGN_COLUMNS,
  CAMPAIGN_TOTALS,
  type CampaignRow,
} from '../../components/Table/__storybook/tableData'
import styles from './Home.module.scss'

// Placeholder data until the reports API is wired up.
const categories = [
  '5 Oct',
  '6 Oct',
  '7 Oct',
  '8 Oct',
  '9 Oct',
  '10 Oct',
  '11 Oct',
]

const usd = (value: number) => `$${String(Math.round(value))}`
const percent = (value: number) => `${value.toFixed(1)}%`

interface Metric extends LineChartSeries {
  key: string
  color: string
  value: string
  status: MetricTileStatus
  badge: string
}

// Tiles and chart lines share one color per metric.
const metrics: Metric[] = [
  {
    key: 'clicks',
    name: 'Gross clicks',
    data: [14400, 13400, 12900, 12300, 12800, 13700, 13800],
    color: DEFAULT_COLORS[0],
    value: '93.1K',
    status: 'low',
    badge: '1.9%',
  },
  {
    key: 'installs',
    name: 'Gross installs',
    data: [356, 324, 312, 304, 320, 342, 345],
    color: DEFAULT_COLORS[1],
    value: '2.3K',
    status: 'high',
    badge: '1.5%',
  },
  {
    key: 'revenue',
    name: 'Gross revenue',
    data: [404, 366, 351, 343, 360, 390, 393],
    formatValue: usd,
    color: DEFAULT_COLORS[2],
    value: '$2.6K',
    status: 'high',
    badge: '2.4%',
  },
  {
    key: 'cr',
    name: 'Gross CR %',
    data: [2.95, 2.9, 2.4, 2, 2.4, 2.9, 2.95],
    formatValue: percent,
    color: DEFAULT_COLORS[3],
    value: '2.9%',
    status: 'neutral',
    badge: '0.0 pp',
  },
  {
    key: 'cost',
    name: 'Cost (Payout)',
    data: [197, 179, 171, 167, 176, 190, 192],
    formatValue: usd,
    color: DEFAULT_COLORS[4],
    value: '$1.3K',
    status: 'low',
    badge: '0.8%',
  },
]

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

export function HomePage() {
  const [query, setQuery] = useState('')
  const [activeKey, setActiveKey] = useState<Key>()
  const rows = filterTree(CAMPAIGNS, query)

  return (
    <div className={styles.root}>
      <section className={styles.tiles} aria-label="Key metrics">
        {metrics.map(({ key, name, value, color, status, badge, data }) => (
          <MetricTile
            key={key}
            label={name}
            value={value}
            color={color}
            status={status}
            badge={badge}
            data={data}
          />
        ))}
      </section>

      <section className={styles.chartCard} aria-label="Metric trends">
        <div className={styles.title_main}>
          <div className={styles.heading}>
            All metrics over time
          </div>
          <div className={styles.subtext}>
            Last 7 days · 12 Oct – 18 Oct · each line is scaled to its own peak; hover for the real values</div>
        </div>
        <LineChart
          series={metrics}
          categories={categories}
          normalize
          height={270}
        />
      </section>

      <section aria-label="Campaign report">
        <Table<CampaignRow>
          columns={CAMPAIGN_COLUMNS}
          dataSource={rows}
          totalRow={CAMPAIGN_TOTALS}
          rowNoun="campaign rows"
          footerHint="Click a row for details"
          showDensityToggle
          search={{ value: query, onSearch: setQuery }}
          {...(activeKey !== undefined && { activeRowKey: activeKey })}
          onRowClick={(record) => {
            setActiveKey((current) =>
              current === record.key ? undefined : record.key,
            )
          }}
        />
      </section>
    </div>
  )
}
