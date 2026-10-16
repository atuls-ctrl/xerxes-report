import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { BarChart, type BarChartProps, type BarChartSeries } from '../BarChart'
import { colors } from '../../../../styles/colors'

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

const metrics: BarChartSeries[] = [
  {
    key: 'clicks',
    name: 'Gross clicks',
    data: [14400, 13400, 12900, 12300, 12800, 13700, 13800],
  },
  {
    key: 'installs',
    name: 'Gross installs',
    data: [356, 324, 315, 304, 320, 342, 341],
  },
  {
    key: 'revenue',
    name: 'Gross revenue',
    data: [404, 366, 351, 343, 364, 391, 394],
    formatValue: usd,
  },
  {
    key: 'cr',
    name: 'Gross CR %',
    data: [2.94, 2.89, 2.89, 2.9, 2.95, 2.94, 2.91],
    formatValue: percent,
  },
  {
    key: 'cost',
    name: 'Cost (Payout)',
    data: [197, 179, 171, 167, 177, 190, 192],
    formatValue: usd,
  },
]

// Gross clicks of the nine biggest campaigns.
const campaigns: BarChartSeries[] = [
  {
    name: '26389 · Wink · OEM Icon',
    data: [2150, 1940, 1980, 2050, 2050, 2270, 2200],
  },
  {
    name: '52011 · Bank · Card',
    data: [1980, 1800, 1720, 1790, 1900, 2010, 2020],
  },
  {
    name: '41007 · Food · First Order',
    data: [1880, 1670, 1710, 1710, 1710, 1850, 1890],
  },
  {
    name: '31023 · C2C · Prog Android',
    data: [1900, 1750, 1670, 1770, 1840, 1930, 2020],
  },
  {
    name: '41121 · Shop Sale · CPA',
    data: [1750, 1720, 1490, 1580, 1630, 1780, 1830],
  },
  {
    name: '26390 · Wink · Push Retarget',
    data: [1340, 1280, 1250, 1290, 1350, 1410, 1430],
  },
  {
    name: '52012 · Puzzle · CPI',
    data: [1090, 1040, 1000, 1020, 1030, 1180, 1120],
  },
  {
    name: '41120 · Shop Sale · CPI',
    data: [1110, 1060, 1040, 1030, 1120, 1150, 1200],
  },
  {
    name: '31024 · C2C · Retarget',
    data: [1060, 990, 960, null, null, null, null],
  },
]

const meta = {
  title: 'Components/Charts/BarChart',
  component: BarChart,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    series: metrics,
    categories,
    normalize: true,
    height: 270,
    stacked: false,
    columnWidth: '62%',
    borderRadius: 3,
    legend: 'top',
    showTooltip: true,
    formatTooltipTitle: (category) => `${category} 2026`,
    onHiddenSeriesChange: fn(),
  },
  argTypes: {
    legend: { control: 'inline-radio', options: ['top', 'bottom', 'none'] },
    height: { control: 'number' },
    series: { control: false },
    categories: { control: false },
    colors: { control: false },
    hiddenSeries: { control: false },
    defaultHiddenSeries: { control: false },
    options: { control: false },
  },
  // The white card the chart sits on in the design.
  decorators: [
    (Story) => (
      <div
        style={{
          padding: 24,
          border: `1px dashed ${colors.border}`,
          borderRadius: 12,
          background: colors.white,
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BarChart>

export default meta
type Story = StoryObj<typeof meta>

// Every metric as a share of its own peak, as in the design.
export const Default: Story = {}

// Real values on a shared axis: the "Top 10 split" card of the design.
export const TopCampaigns: Story = {
  args: {
    series: campaigns,
    normalize: false,
    yMax: 2500,
    yTickAmount: 5,
  },
}

export const LegendBottom: Story = {
  args: { legend: 'bottom' },
}

export const WithoutLegend: Story = {
  args: { legend: 'none' },
}

// ---- Data & axes -----------------------------------------------------------
export const SingleSeries: Story = {
  args: {
    normalize: false,
    series: metrics.filter(({ key }) => key === 'clicks'),
    columnWidth: '40%',
  },
}

export const Currency: Story = {
  args: {
    normalize: false,
    series: metrics.filter(({ key }) => key === 'revenue' || key === 'cost'),
    formatYAxis: usd,
  },
}

export const Stacked: Story = {
  args: {
    normalize: false,
    stacked: true,
    series: campaigns.slice(0, 4),
    columnWidth: '40%',
  },
}

export const HiddenByDefault: Story = {
  args: { defaultHiddenSeries: ['cr', 'cost'] },
}

// ---- Look ------------------------------------------------------------------
export const SolidBars: Story = {
  args: { gradient: false },
}

export const CustomColors: Story = {
  args: {
    colors: [
      '#aa3bff',
      colors.text,
      colors.danger,
      colors.textSubtle,
      colors.success,
    ],
  },
}

// Anything ApexCharts supports can be layered on with `options`.
export const CustomOptions: Story = {
  args: {
    options: {
      annotations: {
        yaxis: [{ y: 90, borderColor: colors.danger, strokeDashArray: 4 }],
      },
    },
  },
}

// The chart follows its parent; crowded axis labels are dropped.
export const NarrowContainer: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <BarChart {...args} height={200} />
    </div>
  ),
}

export const Controlled: Story = {
  render: function ControlledBarChart(args) {
    const [hidden, setHidden] = useState<string[]>(['cost'])
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <BarChart
          {...args}
          hiddenSeries={hidden}
          onHiddenSeriesChange={(next) => {
            setHidden(next)
            args.onHiddenSeriesChange?.(next)
          }}
        />
        <span style={{ fontSize: 13 }}>
          Hidden: <strong>{hidden.join(', ') || 'none'}</strong>
        </span>
      </div>
    )
  },
}

// ---- Horizontal layout -----------------------------------------------------
const timeToInstall = {
  categories: [
    '<10s',
    '10–30s',
    '30–60s',
    '1–5m',
    '5–30m',
    '30–60m',
    '1–6h',
    '6–24h',
    '>24h',
  ],
  series: [
    {
      name: 'Installs',
      data: [13.1, 4.2, 6.6, 22.5, 16.9, 7.1, 7.1, 1.6, 0],
      formatValue: percent,
    },
  ],
}

const fraudReasons = {
  categories: [
    'Click flooding',
    'Click injection',
    'Install hijacking',
    'Device farm / emulator',
    'Bots',
    'Duplicate device / IP',
    'Other',
  ],
  series: [{ name: 'Rejected installs', data: [12, 11, 4, 5, 2, 3, 6] }],
}
const fraudTotal = fraudReasons.series[0].data.reduce((sum, n) => sum + n, 0)

// The column of the design the rows sit in.
const narrowCard = { maxWidth: 463 }

// The rows size themselves, so the meta's fixed `height` is dropped.
const renderRows = ({ height: _height, ...args }: BarChartProps) => (
  <div style={narrowCard}>
    <BarChart {...args} />
  </div>
)

// Rows instead of columns: label, bar and value. The first bar is flagged.
export const Horizontal: Story = {
  args: {
    ...timeToInstall,
    layout: 'horizontal',
    normalize: false,
    legend: 'none',
    barColors: [colors.danger],
  },
  render: renderRows,
}

// Any text can end a row, here the share and the count.
export const HorizontalValueLabels: Story = {
  args: {
    ...fraudReasons,
    layout: 'horizontal',
    normalize: false,
    legend: 'none',
    formatValueLabel: (value) =>
      `${String(Math.round((value / fraudTotal) * 100))}% · ${String(value)}`,
  },
  render: renderRows,
}

export const HorizontalWithoutValues: Story = {
  args: { ...Horizontal.args, showValueLabels: false },
  render: renderRows,
}

// Thicker bars, taller rows, a wider label column and another color.
export const HorizontalCustomSizes: Story = {
  args: {
    ...fraudReasons,
    layout: 'horizontal',
    normalize: false,
    legend: 'none',
    colors: [colors.success],
    barHeight: 16,
    rowHeight: 32,
    labelWidth: 170,
    borderRadius: 8,
  },
  render: renderRows,
}

// Several series share a row; the legend comes back when asked for.
export const HorizontalStacked: Story = {
  args: {
    layout: 'horizontal',
    normalize: false,
    stacked: true,
    legend: 'top',
    series: campaigns.slice(0, 3),
    showValueLabels: false,
  },
  render: renderRows,
}

// Long labels truncate and the bars take what is left.
export const HorizontalNarrow: Story = {
  args: { ...HorizontalValueLabels.args },
  render: ({ height: _height, ...args }) => (
    <div style={{ width: 260 }}>
      <BarChart {...args} />
    </div>
  ),
}

export const HorizontalRows: Story = {
  args: { ...Horizontal.args },
  render: renderRows,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // One label and one value per category.
    for (const category of timeToInstall.categories) {
      await expect(canvas.getByText(category)).toBeVisible()
    }
    await expect(canvas.getByText('22.5%')).toBeVisible()
    await expect(canvas.getByText('0.0%')).toBeVisible()
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument()

    const selector = '.apexcharts-bar-area'
    await waitFor(() =>
      expect(canvasElement.querySelectorAll(selector)).toHaveLength(
        timeToInstall.categories.length,
      ),
    )
    const bars = canvasElement.querySelectorAll(selector)
    // The flagged row keeps its own color; ApexCharts writes it as rgba.
    await expect(bars[0]).toHaveAttribute('fill', 'rgba(208,59,59,1)')
    await expect(bars[1]).toHaveAttribute('fill', 'rgba(42,120,214,1)')
  },
}

// Hovering a group shows the band behind it and the tooltip.
export const Hover: Story = {
  play: async ({ canvasElement }) => {
    const plot = await waitFor(() => {
      const grid = canvasElement.querySelector('.apexcharts-grid')
      if (!grid) throw new Error('Chart is not rendered yet')
      return grid
    })
    const { left, top, width, height } = plot.getBoundingClientRect()
    const position = {
      // Middle of the third of seven groups.
      clientX: left + (width * 2.5) / 7,
      clientY: top + height / 2,
      bubbles: true,
    }
    plot.dispatchEvent(new MouseEvent('mousemove', position))
    await expect(
      await within(canvasElement).findByText('7 Oct 2026'),
    ).toBeVisible()
  },
}

// ---- Interaction tests -----------------------------------------------------
export const TogglesSeries: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const item = canvas.getByRole('button', { name: 'Gross CR %' })
    await expect(item).toHaveAttribute('aria-pressed', 'true')
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('.apexcharts-series')).toHaveLength(
        5,
      ),
    )

    await userEvent.click(item)
    await expect(item).toHaveAttribute('aria-pressed', 'false')
    await expect(args.onHiddenSeriesChange).toHaveBeenLastCalledWith(['cr'])
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('.apexcharts-series')).toHaveLength(
        4,
      ),
    )

    await userEvent.click(item)
    await expect(item).toHaveAttribute('aria-pressed', 'true')
    await expect(args.onHiddenSeriesChange).toHaveBeenLastCalledWith([])
  },
}
