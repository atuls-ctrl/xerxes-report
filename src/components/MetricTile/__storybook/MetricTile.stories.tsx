import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'
import { MetricTile, type MetricTileProps } from '../MetricTile'
import { chartColors } from '../../../styles/colors'

const falling = [28, 15.3, 9.8, 2, 7.3, 19.4, 20.9]
const rising = [5.4, 2, 20.7, 10.8, 16.1, 28, 20.3]
const flat = [28, 12.8, 12.8, 2, 12.8, 23.7, 28]

// The tiles of the design, left to right.
const tiles: MetricTileProps[] = [
  {
    label: 'Gross clicks',
    value: '93.1K',
    color: chartColors[0],
    status: 'low',
    badge: '1.9%',
    data: falling,
  },
  {
    label: 'Fraud %',
    value: '8.6%',
    color: chartColors[1],
    status: 'high',
    badge: '1.5%',
    data: rising,
  },
  {
    label: 'Gross event',
    value: '707',
    color: chartColors[2],
    status: 'neutral',
    badge: '0.0 pp',
    data: flat,
  },
]

const meta = {
  title: 'Components/MetricTile',
  component: MetricTile,
  tags: ['autodocs'],
  args: {
    label: 'Gross clicks',
    value: '93.1K',
    color: chartColors[0],
    status: 'low',
    badge: '1.9%',
    showChart: true,
    data: falling,
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['high', 'low', 'neutral'] },
    label: { control: 'text' },
    value: { control: 'text' },
    badge: { control: 'text' },
    color: { control: 'color' },
    chartColor: { control: 'color' },
    data: { control: 'object' },
  },
  // The tile fills its parent; this is the widest tile of the design.
  parameters: { tileWidth: 283 },
  decorators: [
    (Story, { parameters }) => (
      <div style={{ width: parameters.tileWidth as number | string }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MetricTile>

export default meta
type Story = StoryObj<typeof meta>

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 283px)',
  gap: 16,
} as const

export const Default: Story = {}

// ---- Status ----------------------------------------------------------------
export const High: Story = {
  args: { ...tiles[1] },
}

export const Low: Story = {
  args: { ...tiles[0] },
}

export const Neutral: Story = {
  args: { ...tiles[2] },
}

// ---- Optional parts --------------------------------------------------------
export const WithoutChart: Story = {
  args: { showChart: false },
}

export const WithoutBadge: Story = {
  args: { badge: undefined },
}

export const WithoutChartAndBadge: Story = {
  args: { showChart: false, badge: undefined },
}

export const WithoutDot: Story = {
  render: ({ color: _color, ...args }) => <MetricTile {...args} />,
}

// No sparkline is drawn without data, even with `showChart` on.
export const WithoutData: Story = {
  render: ({ data: _data, ...args }) => <MetricTile {...args} />,
}

export const CustomChartColor: Story = {
  args: { chartColor: chartColors[5] },
}

// ---- Combinations ----------------------------------------------------------
// Every status with and without the sparkline and the badge.
export const AllVariants: Story = {
  parameters: { layout: 'padded', tileWidth: 'auto' },
  render: () => (
    <div style={grid}>
      {tiles.map((tile) => (
        <MetricTile key={`full-${String(tile.status)}`} {...tile} />
      ))}
      {tiles.map((tile) => (
        <MetricTile
          key={`no-chart-${String(tile.status)}`}
          {...tile}
          showChart={false}
        />
      ))}
      {tiles.map((tile) => (
        <MetricTile
          key={`no-badge-${String(tile.status)}`}
          {...tile}
          badge={undefined}
        />
      ))}
      {tiles.map((tile) => (
        <MetricTile
          key={`bare-${String(tile.status)}`}
          {...tile}
          showChart={false}
          badge={undefined}
        />
      ))}
    </div>
  ),
}

// Tiles share a row and shrink with it; long text truncates.
export const Responsive: Story = {
  parameters: { layout: 'padded', tileWidth: 'auto' },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 12,
        maxWidth: 520,
      }}
    >
      {tiles.map((tile) => (
        <MetricTile key={String(tile.status)} {...tile} />
      ))}
      <MetricTile
        label="Gross revenue after fraud deductions"
        value="$1,234,567.89"
        color={chartColors[3]}
        status="high"
        badge="12.4%"
        data={rising}
      />
    </div>
  ),
}

// ---- Rendering tests -------------------------------------------------------
export const RendersParts: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Gross clicks')).toBeVisible()
    await expect(canvas.getByText('93.1K')).toBeVisible()
    await expect(canvas.getByText('1.9%')).toBeVisible()
    await expect(canvas.getByText('Down')).toBeInTheDocument()
    await waitFor(() =>
      expect(
        canvasElement.querySelector('.apexcharts-series'),
      ).toBeInTheDocument(),
    )
  },
}

export const HidesOptionalParts: Story = {
  args: { showChart: false, badge: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('93.1K')).toBeVisible()
    await expect(canvas.queryByText('Down')).not.toBeInTheDocument()
    await expect(
      canvasElement.querySelector('.apexcharts-canvas'),
    ).not.toBeInTheDocument()
  },
}
