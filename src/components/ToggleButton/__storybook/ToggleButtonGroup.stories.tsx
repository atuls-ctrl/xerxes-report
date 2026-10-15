import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Icon } from '../../icons'
import {
  ToggleButtonGroup,
  type ToggleButtonGroupOption,
} from '../ToggleButtonGroup'

const team: ToggleButtonGroupOption[] = [
  { value: 'supply', label: 'Supply' },
  { value: 'demand', label: 'Demand' },
]

const currency: ToggleButtonGroupOption[] = [
  { value: 'usd', label: 'USD' },
  { value: 'rub', label: 'RUB' },
]

// Stroke 1.75 on the 24px grid matches the Figma icons.
const chartType: ToggleButtonGroupOption[] = [
  {
    value: 'line',
    label: 'Line chart',
    title: 'Line chart',
    iconOnly: true,
    icon: <Icon name="linechart" strokeWidth={1.75} />,
  },
  {
    value: 'bar',
    label: 'Bar chart',
    title: 'Bar chart',
    iconOnly: true,
    icon: <Icon name="barchart" strokeWidth={1.75} />,
  },
]

const chartSplit: ToggleButtonGroupOption[] = [
  { value: 'all', label: 'All metrics' },
  { value: 'top', label: 'Top 10 by campaign' },
]

const metrics: ToggleButtonGroupOption[] = [
  { value: 'clicks', label: 'Gross clicks' },
  { value: 'installs', label: 'Gross installs' },
  { value: 'revenue', label: 'Gross revenue' },
  { value: 'cr', label: 'Gross CR %' },
  { value: 'cost', label: 'Cost (Payout)' },
]

const meta = {
  title: 'Components/ToggleButtonGroup',
  component: ToggleButtonGroup,
  tags: ['autodocs'],
  args: {
    options: team,
    defaultValue: 'demand',
    'aria-label': 'Team',
    size: 'md',
    fullWidth: false,
    disabled: false,
    onChange: fn(),
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    value: { control: 'text' },
    defaultValue: { control: 'text' },
  },
} satisfies Meta<typeof ToggleButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

const caption = {
  fontFamily: 'Outfit, system-ui, sans-serif',
  fontSize: 12,
  color: '#475467',
  fontWeight: 600,
} as const
const muted = { color: '#8a94a6', fontWeight: 400 } as const

function Cell({
  title,
  state,
  children,
}: {
  title: string
  state: string
  children: ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {children}
      <span style={caption}>
        {title}
        <span style={muted}> · {state}</span>
      </span>
    </div>
  )
}

export const Default: Story = {}

// ---- Figma examples --------------------------------------------------------
export const TeamSwitch: Story = {
  args: { options: team, defaultValue: 'demand', 'aria-label': 'Team' },
}

export const CurrencySwitch: Story = {
  args: { options: currency, defaultValue: 'usd', 'aria-label': 'Currency' },
}

export const ChartType: Story = {
  args: {
    options: chartType,
    defaultValue: 'line',
    'aria-label': 'Chart type',
  },
}

export const ChartSplit: Story = {
  args: {
    options: chartSplit,
    defaultValue: 'all',
    'aria-label': 'Chart split',
  },
}

export const MetricPicker: Story = {
  args: {
    options: metrics,
    defaultValue: 'clicks',
    label: 'Metric',
    'aria-label': undefined,
  },
}

// Mirrors the Figma frame. Hover/press the unselected segments; Tab for focus.
export const FigmaExamples: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48 }}>
        <Cell title="Team switch" state="Demand selected">
          <ToggleButtonGroup
            {...args}
            options={team}
            defaultValue="demand"
            aria-label="Team"
          />
        </Cell>
        <Cell title="Currency switch" state="USD selected">
          <ToggleButtonGroup
            {...args}
            options={currency}
            defaultValue="usd"
            aria-label="Currency"
          />
        </Cell>
        <Cell title="Chart type" state="line selected">
          <ToggleButtonGroup
            {...args}
            options={chartType}
            defaultValue="line"
            aria-label="Chart type"
          />
        </Cell>
        <Cell title="Chart type" state="bar selected">
          <ToggleButtonGroup
            {...args}
            options={chartType}
            defaultValue="bar"
            aria-label="Chart type"
          />
        </Cell>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48 }}>
        <Cell title="Chart split" state="All metrics selected">
          <ToggleButtonGroup
            {...args}
            options={chartSplit}
            defaultValue="all"
            aria-label="Chart split"
          />
        </Cell>
        <Cell title="Chart split" state="Top 10 selected">
          <ToggleButtonGroup
            {...args}
            options={chartSplit}
            defaultValue="top"
            aria-label="Chart split"
          />
        </Cell>
      </div>
      <Cell title="Metric picker" state="default">
        <ToggleButtonGroup
          {...args}
          options={metrics}
          defaultValue="clicks"
          label="Metric"
          aria-label={undefined}
        />
      </Cell>
    </div>
  ),
}

// ---- States ----------------------------------------------------------------
// Hover and focus are real pseudo-classes, so these stories trigger them.
export const HoverUnselected: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(
      within(canvasElement).getByRole('radio', { name: 'Supply' }),
    )
  },
}

export const FocusUnselected: Story = {
  play: async () => {
    await userEvent.tab()
    await userEvent.keyboard('{ArrowLeft}')
  },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const DisabledOption: Story = {
  args: {
    options: [...currency, { value: 'eur', label: 'EUR', disabled: true }],
    defaultValue: 'usd',
    'aria-label': 'Currency',
  },
}

// No `defaultValue`: Tab lands on the first enabled segment.
export const NothingSelected: Story = {
  render: ({ options, onChange }) => (
    <ToggleButtonGroup
      options={options}
      aria-label="Currency"
      {...(onChange && { onChange })}
    />
  ),
  args: { options: currency },
}

// ---- Layout ----------------------------------------------------------------
export const Sizes: Story = {
  render: (args) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 16,
      }}
    >
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', gap: 12 }}>
          <ToggleButtonGroup
            {...args}
            size={size}
            options={chartSplit}
            defaultValue="all"
            aria-label={`Chart split (${size})`}
          />
          <ToggleButtonGroup
            {...args}
            size={size}
            options={chartType}
            defaultValue="line"
            aria-label={`Chart type (${size})`}
          />
        </div>
      ))}
    </div>
  ),
}

export const FullWidth: Story = {
  args: { fullWidth: true },
  render: (args) => (
    <div style={{ width: 360 }}>
      <ToggleButtonGroup {...args} />
    </div>
  ),
}

// Too narrow for every option: the track scrolls sideways.
export const NarrowContainer: Story = {
  args: {
    options: metrics,
    defaultValue: 'clicks',
    label: 'Metric',
    'aria-label': undefined,
  },
  render: (args) => (
    <div style={{ width: 280, border: '1px dashed #d0d5dd', padding: 8 }}>
      <ToggleButtonGroup {...args} />
    </div>
  ),
}

// ---- Controlled / keyboard -------------------------------------------------
export const Controlled: Story = {
  args: { options: chartType, 'aria-label': 'Chart type' },
  render: function ControlledGroup(args) {
    const [value, setValue] = useState('bar')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ToggleButtonGroup
          {...args}
          value={value}
          onChange={(next, event) => {
            setValue(next)
            args.onChange?.(next, event)
          }}
        />
        <span style={caption}>Parent state: {value}</span>
      </div>
    )
  },
}

// Arrows move focus without selecting; Space selects.
export const KeyboardSelection: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.tab()
    await expect(canvas.getByRole('radio', { name: 'Demand' })).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(canvas.getByRole('radio', { name: 'Supply' })).toHaveFocus()
    await expect(args.onChange).not.toHaveBeenCalled()
    await userEvent.keyboard(' ')
    await expect(args.onChange).toHaveBeenCalledWith(
      'supply',
      expect.anything(),
    )
    await expect(canvas.getByRole('radio', { name: 'Supply' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  },
}
