import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { LineChart, type LineChartSeries } from '../LineChart'

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

const metrics: LineChartSeries[] = [
  {
    key: 'clicks',
    name: 'Gross clicks',
    data: [14400, 13400, 12900, 12300, 12800, 13700, 13800],
  },
  {
    key: 'installs',
    name: 'Gross installs',
    data: [356, 324, 312, 304, 320, 342, 345],
  },
  {
    key: 'revenue',
    name: 'Gross revenue',
    data: [404, 366, 351, 343, 360, 390, 393],
    formatValue: usd,
  },
  {
    key: 'cr',
    name: 'Gross CR %',
    data: [2.95, 2.9, 2.89, 2.9, 2.95, 2.94, 2.91],
    formatValue: percent,
  },
  {
    key: 'cost',
    name: 'Cost (Payout)',
    data: [197, 179, 171, 167, 176, 190, 192],
    formatValue: usd,
  },
]

const meta = {
  title: 'Components/Charts/LineChart',
  component: LineChart,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    series: metrics,
    categories,
    normalize: true,
    height: 270,
    curve: 'straight',
    strokeWidth: 2,
    legend: 'top',
    showTooltip: true,
    showEndMarkers: true,
    sparkline: false,
    formatTooltipTitle: (category) => `${category} 2026`,
    onHiddenSeriesChange: fn(),
  },
  argTypes: {
    curve: {
      control: 'inline-radio',
      options: ['straight', 'smooth', 'stepline'],
    },
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
          border: '1px dashed #d0d5dd',
          borderRadius: 12,
          background: '#fff',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LineChart>

export default meta
type Story = StoryObj<typeof meta>

// Every metric as a share of its own peak, as in the design.
export const Default: Story = {}

export const LegendBottom: Story = {
  args: { legend: 'bottom' },
}

export const WithoutLegend: Story = {
  args: { legend: 'none' },
}

// ---- Data & axes -----------------------------------------------------------
export const RawValues: Story = {
  args: {
    normalize: false,
    series: metrics.filter(({ key }) => key === 'clicks'),
    yMin: 0,
  },
}

export const Currency: Story = {
  args: {
    normalize: false,
    series: metrics.filter(({ key }) => key === 'revenue' || key === 'cost'),
    formatYAxis: usd,
    yMin: 0,
  },
}

export const WithGaps: Story = {
  args: {
    normalize: false,
    series: [
      {
        name: 'Gross installs',
        data: [356, 324, null, null, 320, 342, null],
      },
    ],
    yMin: 0,
  },
}

export const HiddenByDefault: Story = {
  args: { defaultHiddenSeries: ['cr', 'cost'] },
}

// ---- Look ------------------------------------------------------------------
export const Smooth: Story = {
  args: { curve: 'smooth' },
}

export const CustomColors: Story = {
  args: {
    colors: ['#aa3bff', '#101828', '#d03b3b', '#8a94a6', '#1baf7a'],
  },
}

// Anything ApexCharts supports can be layered on with `options`.
export const CustomOptions: Story = {
  args: {
    options: {
      stroke: { dashArray: [0, 0, 0, 4, 0] },
      annotations: {
        yaxis: [{ y: 90, borderColor: '#d03b3b', strokeDashArray: 4 }],
      },
    },
  },
}

export const Sparklines: Story = {
  args: {
    sparkline: true,
    height: 30,
    legend: 'none',
    showTooltip: false,
    showEndMarkers: false,
  },
  render: ({ series: _series, colors: _colors, ...args }) => (
    <div style={{ display: 'flex', gap: 40 }}>
      <div style={{ width: 96 }}>
        <LineChart
          {...args}
          series={[{ name: 'Cost', data: [9, 6, 5, 3, 4, 7, 8] }]}
          colors={['#d03b3b']}
          aria-label="Cost trend"
        />
      </div>
      <div style={{ width: 96 }}>
        <LineChart
          {...args}
          series={[{ name: 'Revenue', data: [4, 2, 5, 2, 4, 8, 6] }]}
          colors={['#1baf7a']}
          aria-label="Revenue trend"
        />
      </div>
    </div>
  ),
}

// The chart follows its parent; crowded axis labels are dropped.
export const NarrowContainer: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <LineChart {...args} height={200} />
    </div>
  ),
}

export const Controlled: Story = {
  render: function ControlledLineChart(args) {
    const [hidden, setHidden] = useState<string[]>(['cost'])
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <LineChart
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

// Hovering the plot shows the crosshair, the point markers and the tooltip.
export const Hover: Story = {
  play: async ({ canvasElement }) => {
    const plot = await waitFor(() => {
      const grid = canvasElement.querySelector('.apexcharts-grid')
      if (!grid) throw new Error('Chart is not rendered yet')
      return grid
    })
    const { left, top, width, height } = plot.getBoundingClientRect()
    const position = {
      clientX: left + width / 2,
      clientY: top + height / 2,
      bubbles: true,
    }
    plot.dispatchEvent(new MouseEvent('mousemove', position))
    await expect(
      await within(canvasElement).findByText('8 Oct 2026'),
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
