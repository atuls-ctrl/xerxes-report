import type { Meta, StoryObj } from '@storybook/react-vite'
import dayjs from 'dayjs'
import { useState } from 'react'
import {
  expect,
  fn,
  userEvent,
  waitFor,
  within,
  type Mock,
} from 'storybook/test'
import { DatePicker } from '../DatePicker'
import {
  CUSTOM_RANGE,
  DEFAULT_PRESETS,
  type DatePickerValue,
} from '../dateRange'

// Fixed clock so labels and tests do not depend on the day they run.
const NOW = dayjs('2026-10-13T11:59:00')
const presets = DEFAULT_PRESETS.map((preset) => ({
  ...preset,
  getRange: () => preset.getRange(NOW),
}))

const today: DatePickerValue = {
  preset: 'today',
  range: [NOW.startOf('day'), NOW],
}
const customRange: DatePickerValue = {
  preset: CUSTOM_RANGE,
  range: [dayjs('2026-10-01').startOf('day'), dayjs('2026-10-13').endOf('day')],
}

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  args: {
    presets,
    defaultValue: today,
    minDate: dayjs('2026-08-15'),
    maxDate: NOW,
    size: 'md',
    disabled: false,
    allowCustom: true,
    placement: 'bottomLeft',
    onChange: fn(),
    onOpenChange: fn(),
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    placement: {
      control: 'inline-radio',
      options: ['bottomLeft', 'bottomRight', 'topLeft', 'topRight'],
    },
    value: { control: false },
    defaultValue: { control: false },
    presets: { control: false },
    minDate: { control: false },
    maxDate: { control: false },
    locale: { control: false },
  },
  // Room for the dropdown below the trigger.
  decorators: [
    (Story) => (
      <div style={{ minHeight: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

// The dropdown is portalled to <body>, outside the story canvas.
const page = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

// First value passed to the `onChange` spy.
const firstValue = (onChange: unknown) =>
  (onChange as Mock<(value: DatePickerValue) => void>).mock.calls[0][0]

const day = (canvasElement: HTMLElement, date: string) => {
  const cell = canvasElement.ownerDocument.querySelector<HTMLElement>(
    `td[title="${date}"]`,
  )
  if (!cell) throw new Error(`No calendar cell for ${date}`)
  return cell
}

export const Default: Story = {}

// ---- Dropdown states (match the design) ------------------------------------
export const PresetList: Story = {
  args: { defaultOpen: true },
}

export const CustomRange: Story = {
  args: { defaultOpen: true, defaultValue: customRange },
}

export const WithoutCustomRange: Story = {
  args: { defaultOpen: true, allowCustom: false },
}

export const WithoutDataRange: Story = {
  args: { defaultOpen: true },
  render: ({ minDate: _minDate, maxDate: _maxDate, ...args }) => (
    <DatePicker {...args} />
  ),
}

// ---- Sizes & states --------------------------------------------------------
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <DatePicker {...args} size="sm" />
      <DatePicker {...args} size="md" />
      <DatePicker {...args} size="lg" />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const CustomLabel: Story = {
  args: {
    formatLabel: ({ range: [start, end] }) =>
      `${start.format('DD/MM/YYYY')} → ${end.format('DD/MM/YYYY')}`,
  },
}

// Long labels truncate instead of overflowing a narrow parent.
export const NarrowContainer: Story = {
  render: (args) => (
    <div style={{ width: 160 }}>
      <DatePicker {...args} />
    </div>
  ),
}

export const Controlled: Story = {
  render: function ControlledDatePicker(args) {
    const [value, setValue] = useState(today)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <DatePicker
          {...args}
          value={value}
          onChange={(next) => {
            setValue(next)
            args.onChange?.(next)
          }}
        />
        <span style={{ fontSize: 13 }}>
          Parent state: <strong>{value.preset}</strong>,{' '}
          {value.range[0].format('D MMM YYYY')} –{' '}
          {value.range[1].format('D MMM YYYY')}
        </span>
      </div>
    )
  },
}

// ---- Interaction tests -----------------------------------------------------
export const SelectsPreset: Story = {
  play: async ({ canvasElement, args }) => {
    const body = page(canvasElement)
    const trigger = within(canvasElement).getByRole('button', {
      name: /Today · 13 Oct, until 11:59/,
    })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(
      await body.findByRole('radio', { name: 'Today' }),
    ).toBeChecked()
    await expect(body.getByText('Data 15 Aug – 13 Oct')).toBeVisible()

    await userEvent.click(body.getByRole('radio', { name: 'Yesterday' }))

    await expect(args.onChange).toHaveBeenCalledTimes(1)
    const value = firstValue(args.onChange)
    await expect(value.preset).toBe('yesterday')
    await expect(value.range[0].format('YYYY-MM-DD')).toBe('2026-10-12')
    await expect(trigger).toHaveTextContent('Yesterday · 12 Oct')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toHaveFocus()
  },
}

export const AppliesCustomRange: Story = {
  play: async ({ canvasElement, args }) => {
    const body = page(canvasElement)
    const trigger = within(canvasElement).getByRole('button', {
      name: /Today/,
    })
    await userEvent.click(trigger)
    await userEvent.click(
      await body.findByRole('radio', { name: 'Custom range' }),
    )

    // Picking "Custom range" only reveals the calendar; nothing is committed.
    await expect(
      body.getByRole('radio', { name: 'Custom range' }),
    ).toBeChecked()
    await expect(body.getByRole('radio', { name: 'Today' })).not.toBeChecked()
    await expect(args.onChange).not.toHaveBeenCalled()

    const apply = body.getByRole('button', { name: 'Apply' })
    await userEvent.click(day(canvasElement, '2026-10-05'))
    await expect(apply).toBeDisabled()
    await userEvent.click(day(canvasElement, '2026-10-09'))
    await waitFor(() => expect(apply).toBeEnabled())
    await expect(body.getByText('5 Oct – 9 Oct')).toBeVisible()

    await userEvent.click(apply)

    await expect(args.onChange).toHaveBeenCalledTimes(1)
    const value = firstValue(args.onChange)
    await expect(value.preset).toBe(CUSTOM_RANGE)
    await expect(value.range[0].format('YYYY-MM-DD HH:mm')).toBe(
      '2026-10-05 00:00',
    )
    await expect(value.range[1].format('YYYY-MM-DD HH:mm')).toBe(
      '2026-10-09 23:59',
    )
    await expect(trigger).toHaveTextContent('5 Oct – 9 Oct 2026')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  },
}

// A second selection in the same session starts over from the start date.
export const ReselectsRange: Story = {
  args: { defaultValue: customRange },
  play: async ({ canvasElement }) => {
    const body = page(canvasElement)
    await userEvent.click(within(canvasElement).getByRole('button'))
    const apply = await body.findByRole('button', { name: 'Apply' })

    await userEvent.click(day(canvasElement, '2026-10-05'))
    await userEvent.click(day(canvasElement, '2026-10-09'))
    await waitFor(() => expect(apply).toBeEnabled())
    await userEvent.click(day(canvasElement, '2026-10-02'))
    await waitFor(() => expect(apply).toBeDisabled())
    await userEvent.click(day(canvasElement, '2026-10-03'))
    await waitFor(() => expect(apply).toBeEnabled())
    await expect(body.getByText('2 Oct – 3 Oct')).toBeVisible()
  },
}

export const DisablesDaysOutsideData: Story = {
  args: { defaultValue: customRange },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'))
    await page(canvasElement).findByRole('button', { name: 'Apply' })

    await expect(day(canvasElement, '2026-10-13')).not.toHaveClass(
      'ant-picker-cell-disabled',
    )
    await expect(day(canvasElement, '2026-10-14')).toHaveClass(
      'ant-picker-cell-disabled',
    )
  },
}

export const DismissesWithoutChange: Story = {
  play: async ({ canvasElement, args }) => {
    const body = page(canvasElement)
    const trigger = within(canvasElement).getByRole('button')

    // Escape closes and returns focus to the trigger.
    await userEvent.click(trigger)
    await body.findByRole('dialog', { name: 'Date range' })
    await userEvent.keyboard('{Escape}')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toHaveFocus()

    // So does a click outside, and an unapplied custom range is dropped.
    await userEvent.click(trigger)
    await userEvent.click(
      await body.findByRole('radio', { name: 'Custom range' }),
    )
    await userEvent.click(canvasElement)
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await expect(args.onChange).not.toHaveBeenCalled()
    await expect(trigger).toHaveTextContent('Today · 13 Oct, until 11:59')
  },
}

export const KeyboardNavigation: Story = {
  play: async ({ canvasElement, args }) => {
    const body = page(canvasElement)
    const trigger = within(canvasElement).getByRole('button')

    trigger.focus()
    await userEvent.keyboard('{Enter}')
    const todayOption = await body.findByRole('radio', { name: 'Today' })
    await waitFor(() => expect(todayOption).toHaveFocus())

    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    await expect(body.getByRole('radio', { name: 'Last 7 days' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')

    await expect(args.onChange).toHaveBeenCalledTimes(1)
    await expect(trigger).toHaveTextContent('Last 7 days · 7 Oct – 13 Oct')
    await expect(trigger).toHaveFocus()
  },
}

export const DisabledDoesNotOpen: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button')
    await expect(trigger).toBeDisabled()
    await userEvent.click(trigger, { pointerEventsCheck: 0 })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(args.onOpenChange).not.toHaveBeenCalled()
  },
}
