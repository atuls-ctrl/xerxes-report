import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { fn } from 'storybook/test'
import { Button } from '../Button'
import { Icon } from '../../icons'

const iconOptions = {
  none: undefined,
  react: <Icon name="react" />,
}

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Share',
    variant: 'secondary',
    size: 'md',
    icon: <Icon name="react" />,
    iconPosition: 'start',
    disabled: false,
    onClick: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'ghost', 'dashed'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    iconPosition: { control: 'inline-radio', options: ['start', 'end'] },
    icon: {
      control: 'select',
      options: Object.keys(iconOptions),
      mapping: iconOptions,
    },
    children: { control: 'text' },
    suffix: { control: 'text' },
    badge: { control: 'text' },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

const column = { display: 'flex', flexDirection: 'column', gap: 16 } as const
const row = { display: 'flex', alignItems: 'center', gap: 16 } as const

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={column}>
      <strong style={{ fontSize: 12, letterSpacing: 0.9 }}>{title}</strong>
      <div style={row}>{children}</div>
    </div>
  )
}

export const Default: Story = {}

// ---- Types: text only, icon only, text with icon ---------------------------
export const TextOnly: Story = {
  args: { icon: undefined, children: 'Export' },
}

export const TextWithIcon: Story = {
  args: { icon: <Icon name="react" />, children: 'Export' },
}

export const IconRight: Story = {
  args: { icon: <Icon name="react" />, iconPosition: 'end', children: 'Collapse' },
}

export const IconOnly: Story = {
  args: {
    icon: <Icon name="react" />,
    children: undefined,
    'aria-label': 'Switch theme',
  },
}

export const WithSuffix: Story = {
  args: { icon: <Icon name="react" />, children: 'Columns', suffix: '19 of 138' },
}

export const IconWithBadge: Story = {
  args: {
    icon: <Icon name="react" />,
    children: undefined,
    badge: 6,
    'aria-label': 'Alerts, 6 new',
  },
}

// ---- Colors ----------------------------------------------------------------
export const Primary: Story = {
  args: {
    variant: 'primary',
    icon: <Icon name="react" />,
    children: 'Save as report',
  },
}

export const Secondary: Story = {
  args: { variant: 'secondary' },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    icon: <Icon name="react" />,
    children: undefined,
    'aria-label': 'Hide chart',
  },
}

export const Dashed: Story = {
  args: {
    variant: 'dashed',
    size: 'sm',
    icon: <Icon name="react" />,
    children: 'Add filter',
  },
}

export const Colors: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} variant="primary" icon={<Icon name="react" />}>
        Primary
      </Button>
      <Button {...args} variant="secondary" icon={<Icon name="react" />}>
        Secondary
      </Button>
      <Button {...args} variant="ghost" icon={<Icon name="react" />}>
        Ghost
      </Button>
      <Button {...args} variant="dashed" icon={<Icon name="react" />}>
        Dashed
      </Button>
    </div>
  ),
}

// ---- Sizes -----------------------------------------------------------------
export const Sizes: Story = {
  render: (args) => (
    <div style={column}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} style={row}>
          <Button
            {...args}
            size={size}
            variant="primary"
            icon={<Icon name="react" />}
          >
            Save ({size})
          </Button>
          <Button {...args} size={size} icon={<Icon name="react" />}>
            Share ({size})
          </Button>
          <Button {...args} size={size}>
            Text ({size})
          </Button>
          <Button
            {...args}
            size={size}
            icon={<Icon name="react" />}
            aria-label={`Theme (${size})`}
          >
            {undefined}
          </Button>
        </div>
      ))}
    </div>
  ),
}

// ---- States ----------------------------------------------------------------
// Hover / active / focus are real pseudo-classes. Use the `Pseudo states`
// toolbar addon, or interact with the buttons: hover, press, and Tab to focus.
export const Disabled: Story = {
  args: { disabled: true },
}

export const States: Story = {
  render: (args) => (
    <div style={column}>
      {(['secondary', 'primary', 'ghost', 'dashed'] as const).map((variant) => (
        <Group key={variant} title={variant.toUpperCase()}>
          <Button {...args} variant={variant}>
            Default
          </Button>
          <Button {...args} variant={variant} disabled>
            Disabled
          </Button>
          <Button
            {...args}
            variant={variant}
            icon={<Icon name="react" />}
            aria-label="Icon default"
          >
            {undefined}
          </Button>
          <Button
            {...args}
            variant={variant}
            icon={<Icon name="react" />}
            aria-label="Icon disabled"
            disabled
          >
            {undefined}
          </Button>
        </Group>
      ))}
    </div>
  ),
  args: { icon: <Icon name="react" /> },
}
