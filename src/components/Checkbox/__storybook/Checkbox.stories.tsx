import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { fn, userEvent, within } from 'storybook/test'
import { Checkbox } from '../Checkbox'

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: {
    label: 'Advertiser',
    variant: 'row',
    disabled: false,
    required: false,
    indeterminate: false,
    invalid: false,
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['row', 'button'] },
    checked: { control: 'boolean' },
    defaultChecked: { control: 'boolean' },
    label: { control: 'text' },
    description: { control: 'text' },
    helperText: { control: 'text' },
    errorMessage: { control: 'text' },
    badge: { control: 'text' },
  },
  // Single rows render at the Figma row width; `padded` grid stories opt out.
  decorators: [
    (Story, { parameters }) =>
      parameters.layout === 'padded' ? (
        <Story />
      ) : (
        <div style={{ width: 241 }}>
          <Story />
        </div>
      ),
  ],
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

const caption = {
  fontFamily: 'Outfit, system-ui, sans-serif',
  fontSize: 12,
  color: '#475467',
  fontWeight: 600,
} as const
const muted = { color: '#8a94a6', fontWeight: 400 } as const
const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 241px)',
  gap: '24px 72px',
} as const

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

export const Checked: Story = {
  args: { label: 'Campaign', defaultChecked: true },
}

export const Indeterminate: Story = {
  args: { label: 'Select all', indeterminate: true },
}

// ---- Figma: Checkbox row (group-by / filter value lists) -------------------
export const WithOrderBadge: Story = {
  args: { label: 'Campaign', defaultChecked: true, badge: 1 },
}

export const EmptyBadgeSlot: Story = {
  args: { badge: '' },
}

// Mirrors the Figma frame. Hover rows: hover them; focus: press Tab.
export const FigmaRows: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={grid}>
      <Cell title="Checkbox row" state="unchecked">
        <Checkbox {...args} label="Advertiser" badge="" />
      </Cell>
      <Cell title="Checkbox row" state="unchecked · hover">
        <Checkbox {...args} label="Advertiser" badge="" />
      </Cell>
      <Cell title="Checkbox row with order badge" state="checked">
        <Checkbox {...args} label="Campaign" defaultChecked badge={1} />
      </Cell>
      <Cell title="Checkbox row with order badge" state="checked · hover">
        <Checkbox {...args} label="Campaign" defaultChecked badge={1} />
      </Cell>
      <Cell title="Checkbox row" state="focus">
        <Checkbox {...args} label="Advertiser" />
      </Cell>
      <Cell title="Checkbox row" state="unchecked · hover">
        <Checkbox {...args} label="Advertiser" />
      </Cell>
      <Cell title="Checkbox row" state="checked">
        <Checkbox {...args} label="Campaign" defaultChecked />
      </Cell>
      <Cell title="Checkbox row" state="checked · hover">
        <Checkbox {...args} label="Campaign" defaultChecked />
      </Cell>
    </div>
  ),
}

// ---- Figma: Multiple button checkbox (day button) --------------------------
export const DayButton: Story = {
  args: { variant: 'button', label: 'D1' },
}

export const DayButtonSelected: Story = {
  args: { variant: 'button', label: 'D3', defaultChecked: true },
}

export const FigmaDayButtons: Story = {
  args: { variant: 'button' },
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={{ display: 'flex', gap: 72 }}>
      <Cell title="Day button" state="default">
        <Checkbox {...args} label="D1" />
      </Cell>
      <Cell title="Day button" state="hover (hover it)">
        <Checkbox {...args} label="D1" />
      </Cell>
      <Cell title="Day button" state="pressed (press it)">
        <Checkbox {...args} label="D1" />
      </Cell>
      <Cell title="Day button" state="focus (press Tab)">
        <Checkbox {...args} label="D1" />
      </Cell>
      <Cell title="Day button" state="selected">
        <Checkbox {...args} label="D3" defaultChecked />
      </Cell>
    </div>
  ),
}

// ---- Label extras ----------------------------------------------------------
export const WithDescription: Story = {
  args: {
    label: 'Include paused campaigns',
    description: 'Paused campaigns still count toward totals.',
  },
}

export const Required: Story = {
  args: { label: 'I accept the export terms', required: true },
}

export const WithHelperText: Story = {
  args: {
    label: 'Email me the report',
    helperText: 'Sent every Monday at 9 AM.',
  },
}

export const ErrorState: Story = {
  args: {
    label: 'I accept the export terms',
    required: true,
    errorMessage: 'Accept the terms to continue.',
  },
}

// ---- States ----------------------------------------------------------------
// Hover and focus are real pseudo-classes, so these stories trigger them.
export const Hover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByText('Advertiser'))
  },
}

export const Focus: Story = {
  play: async () => {
    await userEvent.tab()
  },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true, label: 'Campaign' },
}

export const States: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={grid}>
        <Checkbox {...args} label="Unchecked" />
        <Checkbox {...args} label="Checked" defaultChecked />
        <Checkbox {...args} label="Indeterminate" indeterminate />
        <Checkbox {...args} label="Required" required />
        <Checkbox {...args} label="Disabled" disabled />
        <Checkbox {...args} label="Disabled, checked" disabled defaultChecked />
        <Checkbox {...args} label="Disabled, mixed" disabled indeterminate />
        <Checkbox {...args} label="Invalid" errorMessage="Required." />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Checkbox {...args} variant="button" label="D1" />
        <Checkbox {...args} variant="button" label="D2" defaultChecked />
        <Checkbox {...args} variant="button" label="D3" disabled />
        <Checkbox
          {...args}
          variant="button"
          label="D4"
          disabled
          defaultChecked
        />
      </div>
    </div>
  ),
}

// ---- Controlled / uncontrolled ---------------------------------------------
export const Uncontrolled: Story = {
  args: { label: 'Campaign', defaultChecked: true },
}

export const Controlled: Story = {
  render: function ControlledCheckbox(args) {
    const [checked, setChecked] = useState(false)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Checkbox
          {...args}
          checked={checked}
          onChange={(event) => {
            setChecked(event.target.checked)
            args.onChange?.(event)
          }}
        />
        <span style={caption}>Checked: {String(checked)}</span>
      </div>
    )
  },
}

// A parent checkbox that is mixed while only some children are picked.
export const SelectAll: Story = {
  render: function SelectAllCheckbox(args) {
    const items = ['Advertiser', 'Campaign', 'Ad group', 'Creative']
    const [picked, setPicked] = useState<string[]>(['Campaign'])
    const all = picked.length === items.length
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Checkbox
          {...args}
          label="Select all"
          checked={all}
          indeterminate={picked.length > 0 && !all}
          onChange={() => {
            setPicked(all ? [] : items)
          }}
        />
        <div style={{ paddingInlineStart: 24 }}>
          {items.map((item) => (
            <Checkbox
              key={item}
              label={item}
              checked={picked.includes(item)}
              onChange={(event) => {
                setPicked((current) =>
                  event.target.checked
                    ? [...current, item]
                    : current.filter((value) => value !== item),
                )
              }}
            />
          ))}
        </div>
      </div>
    )
  },
}
