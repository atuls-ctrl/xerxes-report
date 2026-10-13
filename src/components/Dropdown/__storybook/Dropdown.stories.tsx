import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { Dropdown } from '../Dropdown'
import { Icon } from '../../icons'

const MMPS = ['AppsFlyer', 'Adjust', 'Branch', 'Singular', 'Kochava']

const list = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  minHeight: 260,
} as const
const option = { display: 'flex', alignItems: 'center', gap: 10 } as const

const meta = {
  title: 'Components/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  args: {
    label: 'Open Dropdown',
    title: 'MMP',
    children: (
      <div style={list}>
        {MMPS.map((name) => (
          <label key={name} style={option}>
            <input type="checkbox" />
            {name}
          </label>
        ))}
      </div>
    ),
    showFooter: true,
    placement: 'bottomLeft',
    variant: 'primary',
    size: 'sm',
    disabled: false,
    applyDisabled: false,
    closeOnApply: true,
    closeOnClear: false,
    onApply: fn(),
    onClear: fn(),
    onOpenChange: fn(),
  },
  argTypes: {
    placement: {
      control: 'inline-radio',
      options: ['bottomLeft', 'bottomRight', 'topLeft', 'topRight'],
    },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'ghost', 'dashed'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    title: { control: 'text' },
    applyLabel: { control: 'text' },
    clearLabel: { control: 'text' },
    children: { control: false },
    footer: { control: false },
    icon: { control: false },
    open: { control: false },
  },
  // Room for the dropdown below the trigger.
  decorators: [
    (Story) => (
      <div style={{ minWidth: 360, minHeight: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dropdown>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

// ---- Dropdown states (match the design) ------------------------------------
export const WithFooter: Story = {
  args: { defaultOpen: true },
}

export const WithoutFooter: Story = {
  args: {
    defaultOpen: true,
    title: 'Alerts',
    showFooter: false,
    width: 338,
    children: <div style={{ minHeight: 360 }}>No new alerts.</div>,
  },
}

export const WithoutTitle: Story = {
  args: { defaultOpen: true, title: undefined },
}

export const CustomFooter: Story = {
  args: {
    defaultOpen: true,
    footer: <span style={{ fontSize: 12 }}>5 partners available</span>,
  },
}

export const ApplyDisabled: Story = {
  args: { defaultOpen: true, applyDisabled: true },
}

// ---- Trigger & placement ---------------------------------------------------
export const TriggerVariants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Dropdown {...args} variant="primary" label="Primary" />
      <Dropdown
        {...args}
        variant="secondary"
        size="md"
        icon={<Icon name="filter" />}
        label="Secondary"
      />
      <Dropdown {...args} variant="dashed" label="Dashed" />
    </div>
  ),
}

export const PlacementRight: Story = {
  args: { defaultOpen: true, placement: 'bottomRight' },
  render: (args) => (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Dropdown {...args} />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
}

// The dropdown shrinks to the viewport instead of overflowing it.
export const NarrowViewport: Story = {
  args: { defaultOpen: true, width: 600 },
}

export const Controlled: Story = {
  render: function ControlledDropdown(args) {
    const [open, setOpen] = useState(false)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontSize: 13 }}>
          Parent state: <strong>{open ? 'open' : 'closed'}</strong>
        </span>
        <Dropdown
          {...args}
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            args.onOpenChange?.(next)
          }}
        />
      </div>
    )
  },
}

// ---- Interaction tests -----------------------------------------------------
export const OpensAndCloses: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Open Dropdown' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument()

    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const dialog = canvas.getByRole('dialog', { name: 'MMP' })
    await expect(dialog).toBeVisible()
    await waitFor(() => expect(dialog).toHaveFocus())
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true)

    // Clicking the trigger again hides it.
    await userEvent.click(trigger)
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false)
  },
}

export const AppliesAndCloses: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Open Dropdown' })
    await userEvent.click(trigger)

    // Clicks inside the dropdown keep it open.
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Adjust' }))
    await expect(canvas.getByRole('dialog')).toBeVisible()

    await userEvent.click(canvas.getByRole('button', { name: 'Apply' }))
    await expect(args.onApply).toHaveBeenCalledTimes(1)
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument()
    await expect(trigger).toHaveFocus()
  },
}

export const ClearKeepsOpen: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Open Dropdown' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }))

    await expect(args.onClear).toHaveBeenCalledTimes(1)
    await expect(args.onApply).not.toHaveBeenCalled()
    await expect(canvas.getByRole('dialog')).toBeVisible()
  },
}

export const DismissesOnEscapeAndOutsideClick: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Open Dropdown' })

    // Escape closes and returns focus to the trigger.
    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument()
    await expect(trigger).toHaveFocus()

    // So does a click outside.
    await userEvent.click(trigger)
    await expect(canvas.getByRole('dialog')).toBeVisible()
    await userEvent.click(canvasElement.ownerDocument.body)
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument()

    await expect(args.onApply).not.toHaveBeenCalled()
  },
}

export const DisabledDoesNotOpen: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Open Dropdown' })
    await expect(trigger).toBeDisabled()
    await userEvent.click(trigger, { pointerEventsCheck: 0 })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(args.onOpenChange).not.toHaveBeenCalled()
  },
}
