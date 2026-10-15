import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { fn, userEvent, within } from 'storybook/test'
import { Input } from '../Input'
import { Icon } from '../../icons'

const iconOptions = {
  none: undefined,
  search: <Icon name="search" />,
  filter: <Icon name="filter" />,
  link: <Icon name="link" />,
  cal: <Icon name="cal" />,
}

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    type: 'text',
    size: 'md',
    status: 'default',
    placeholder: 'Search rows',
    'aria-label': 'Search rows',
    disabled: false,
    readOnly: false,
    required: false,
    allowClear: false,
    onChange: fn(),
    onClear: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    status: {
      control: 'inline-radio',
      options: ['default', 'error', 'success'],
    },
    leadingIcon: {
      control: 'select',
      options: Object.keys(iconOptions),
      mapping: iconOptions,
    },
    trailingIcon: {
      control: 'select',
      options: Object.keys(iconOptions),
      mapping: iconOptions,
    },
    label: { control: 'text' },
    helperText: { control: 'text' },
    errorMessage: { control: 'text' },
    width: { control: 'text' },
    value: { control: 'text' },
    defaultValue: { control: 'text' },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

const column = { display: 'flex', flexDirection: 'column', gap: 24 } as const
const row = { display: 'flex', alignItems: 'flex-start', gap: 74 } as const
const caption = {
  fontFamily: 'Outfit, system-ui, sans-serif',
  fontSize: 12,
  color: '#475467',
  fontWeight: 600,
} as const

function Cell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {children}
      <span style={caption}>{title}</span>
    </div>
  )
}

export const Default: Story = {}

// ---- Figma: Search field (table toolbar) -----------------------------------
export const SearchField: Story = {
  args: {
    type: 'search',
    leadingIcon: <Icon name="search" />,
  },
}

export const SearchFieldFilled: Story = {
  args: {
    type: 'search',
    leadingIcon: <Icon name="search" />,
    defaultValue: 'Wink',
  },
}

export const SearchFieldClearable: Story = {
  args: {
    type: 'search',
    leadingIcon: <Icon name="search" />,
    defaultValue: 'Wink',
    allowClear: true,
  },
}

// Mirrors the Figma frame: with and without the search icon.
export const SearchFieldStates: Story = {
  render: (args) => (
    <div style={column}>
      {[<Icon key="search" name="search" />, undefined].map((icon, index) => (
        <div key={index} style={row}>
          <Cell title="Search field · default">
            <Input {...args} type="search" leadingIcon={icon} />
          </Cell>
          <Cell title="Search field · hover (hover it)">
            <Input {...args} type="search" leadingIcon={icon} />
          </Cell>
          <Cell title="Search field · filled">
            <Input
              {...args}
              type="search"
              leadingIcon={icon}
              defaultValue="Wink"
            />
          </Cell>
        </div>
      ))}
    </div>
  ),
}

// ---- Types -----------------------------------------------------------------
export const Types: Story = {
  args: { 'aria-label': undefined, width: 240 },
  render: (args) => (
    <div style={column}>
      <Input {...args} type="text" label="Report name" placeholder="Q3 spend" />
      <Input
        {...args}
        type="email"
        label="Email"
        placeholder="name@company.com"
        autoComplete="email"
      />
      <Input
        {...args}
        type="password"
        label="Password"
        placeholder="Enter password"
        autoComplete="current-password"
      />
      <Input
        {...args}
        type="number"
        label="Budget"
        placeholder="0"
        min={0}
        step={100}
      />
      <Input
        {...args}
        type="search"
        label="Search"
        placeholder="Search rows"
        leadingIcon={<Icon name="search" />}
        allowClear
      />
      <Input
        {...args}
        type="tel"
        label="Phone"
        placeholder="+1 555 0100"
        leadingIcon={<Icon name="phoneOutline" />}
      />
      <Input
        {...args}
        type="url"
        label="Website"
        placeholder="https://"
        leadingIcon={<Icon name="link" />}
      />
    </div>
  ),
}

export const Password: Story = {
  args: {
    type: 'password',
    label: 'Password',
    'aria-label': undefined,
    placeholder: 'Enter password',
    defaultValue: 'hunter22',
    width: 240,
  },
}

// ---- Label, helper text, required ------------------------------------------
export const WithLabel: Story = {
  args: { label: 'Campaign name', 'aria-label': undefined, placeholder: '' },
}

export const WithHelperText: Story = {
  args: {
    label: 'Campaign name',
    'aria-label': undefined,
    placeholder: 'e.g. Summer sale',
    helperText: 'Shown in report headers.',
    width: 240,
  },
}

export const Required: Story = {
  args: {
    label: 'Email',
    'aria-label': undefined,
    type: 'email',
    placeholder: 'name@company.com',
    required: true,
    width: 240,
  },
}

// ---- Icons -----------------------------------------------------------------
export const LeadingIcon: Story = {
  args: { leadingIcon: <Icon name="search" /> },
}

export const TrailingIcon: Story = {
  args: {
    trailingIcon: <Icon name="cal" />,
    placeholder: 'Pick a date',
    'aria-label': 'Date',
  },
}

export const BothIcons: Story = {
  args: {
    leadingIcon: <Icon name="filter" />,
    trailingIcon: <Icon name="down" />,
    placeholder: 'Filter',
    'aria-label': 'Filter',
  },
}

// ---- Status ----------------------------------------------------------------
export const ErrorState: Story = {
  args: {
    label: 'Email',
    'aria-label': undefined,
    type: 'email',
    defaultValue: 'name@company',
    errorMessage: 'Enter a valid email address.',
    width: 240,
  },
}

export const Success: Story = {
  args: {
    label: 'Report name',
    'aria-label': undefined,
    defaultValue: 'Weekly spend',
    status: 'success',
    helperText: 'Name is available.',
    width: 240,
  },
}

// ---- States ----------------------------------------------------------------
// Hover and focus are real pseudo-classes, so these stories trigger them.
export const Hover: Story = {
  args: { leadingIcon: <Icon name="search" /> },
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('textbox'))
  },
}

export const Focus: Story = {
  args: { leadingIcon: <Icon name="search" /> },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('textbox'))
  },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Wink' },
}

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: 'Wink' },
}

export const States: Story = {
  args: { 'aria-label': undefined, leadingIcon: <Icon name="search" /> },
  render: (args) => (
    <div style={column}>
      <div style={row}>
        <Input {...args} label="Default" />
        <Input {...args} label="Filled" defaultValue="Wink" />
        <Input {...args} label="Required" required />
      </div>
      <div style={row}>
        <Input {...args} label="Disabled" disabled />
        <Input
          {...args}
          label="Disabled, filled"
          disabled
          defaultValue="Wink"
        />
        <Input {...args} label="Read-only" readOnly defaultValue="Wink" />
      </div>
      <div style={row}>
        <Input
          {...args}
          label="Error"
          defaultValue="Wink"
          errorMessage="No rows match."
        />
        <Input
          {...args}
          label="Success"
          status="success"
          defaultValue="Wink"
          helperText="12 rows found."
        />
        <Input {...args} label="Helper" helperText="Search by name or ID." />
      </div>
    </div>
  ),
}

// ---- Sizes -----------------------------------------------------------------
export const Sizes: Story = {
  render: (args) => (
    <div style={column}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Input
          {...args}
          key={size}
          size={size}
          leadingIcon={<Icon name="search" />}
          placeholder={`Search rows (${size})`}
          aria-label={`Search rows (${size})`}
        />
      ))}
    </div>
  ),
}

export const FullWidth: Story = {
  args: { width: '100%', leadingIcon: <Icon name="search" /> },
  render: (args) => (
    <div style={{ width: 480 }}>
      <Input {...args} />
    </div>
  ),
}

// ---- Controlled / uncontrolled ---------------------------------------------
export const Uncontrolled: Story = {
  args: { defaultValue: 'Wink', allowClear: true },
}

export const Controlled: Story = {
  args: {
    'aria-label': undefined,
    label: 'Controlled',
    allowClear: true,
    leadingIcon: <Icon name="search" />,
  },
  render: function ControlledInput(args) {
    const [value, setValue] = useState('Wink')
    return (
      <div style={{ ...column, gap: 8 }}>
        <Input
          {...args}
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            args.onChange?.(event)
          }}
        />
        <span style={caption}>Value: “{value}”</span>
      </div>
    )
  },
}
