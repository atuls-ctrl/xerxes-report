import type { Meta, StoryObj } from '@storybook/react-vite'
import dayjs from 'dayjs'
import { useState } from 'react'
import { fn } from 'storybook/test'
import type { Currency, Perspective } from '../../../state/reportQuery'
import { DEFAULT_PRESETS, type DatePickerValue } from '../../DatePicker'
import { Header, type HeaderProps } from '../Header'

/** "Last 7 days" ending now, matching the app default. */
function last7(): DatePickerValue {
  const preset = DEFAULT_PRESETS.find((item) => item.key === 'last7')
  const now = dayjs()
  return {
    preset: 'last7',
    range: preset ? preset.getRange(now) : [now.subtract(6, 'day'), now],
  }
}

const meta = {
  title: 'Components/Header',
  component: Header,
  tags: ['autodocs'],
  args: {
    dateValue: last7(),
    compare: true,
    compareLabel: 'Compare previous 7 days',
    sourceLabel: 'Trackier',
    perspective: 'demand',
    currency: 'USD',
    onDateChange: fn(),
    onCompareChange: fn(),
    onPerspectiveChange: fn(),
    onCurrencyChange: fn(),
  },
  argTypes: {
    perspective: { control: 'inline-radio', options: ['supply', 'demand'] },
    currency: { control: 'inline-radio', options: ['USD', 'RUB'] },
  },
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

/** Static props; use the controls panel to change values. */
export const Default: Story = {}

/** Holds the values in local state so clicks update the bar, like `AppLayout`. */
function InteractiveHeader(args: HeaderProps) {
  const [dateValue, setDateValue] = useState(args.dateValue)
  const [compare, setCompare] = useState(args.compare)
  const [perspective, setPerspective] = useState<Perspective>(args.perspective)
  const [currency, setCurrency] = useState<Currency>(args.currency)

  return (
    <Header
      {...args}
      dateValue={dateValue}
      compare={compare}
      perspective={perspective}
      currency={currency}
      onDateChange={(value) => {
        setDateValue(value)
        args.onDateChange(value)
      }}
      onCompareChange={(next) => {
        setCompare(next)
        args.onCompareChange(next)
      }}
      onPerspectiveChange={(next) => {
        setPerspective(next)
        args.onPerspectiveChange(next)
      }}
      onCurrencyChange={(next) => {
        setCurrency(next)
        args.onCurrencyChange(next)
      }}
    />
  )
}

export const Interactive: Story = {
  render: (args) => <InteractiveHeader {...args} />,
}
