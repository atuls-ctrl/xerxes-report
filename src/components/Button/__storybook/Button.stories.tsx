import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { fn } from 'storybook/test'
import { Button } from '../Button'
import {
  BellIcon,
  BookmarkIcon,
  ChevronUpIcon,
  ColumnsIcon,
  DownloadIcon,
  FilterIcon,
  MenuIcon,
  MoonIcon,
  ShareIcon,
} from '../icons'

const iconOptions = {
  none: undefined,
  share: <ShareIcon />,
  download: <DownloadIcon />,
  bookmark: <BookmarkIcon />,
  moon: <MoonIcon />,
  bell: <BellIcon />,
  chevronUp: <ChevronUpIcon />,
  columns: <ColumnsIcon />,
  menu: <MenuIcon />,
  filter: <FilterIcon />,
}

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Share',
    variant: 'secondary',
    size: 'md',
    icon: <ShareIcon />,
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
  args: { icon: <DownloadIcon />, children: 'Export' },
}

export const IconRight: Story = {
  args: { icon: <ChevronUpIcon />, iconPosition: 'end', children: 'Collapse' },
}

export const IconOnly: Story = {
  args: {
    icon: <MoonIcon />,
    children: undefined,
    'aria-label': 'Switch theme',
  },
}

export const WithSuffix: Story = {
  args: { icon: <ColumnsIcon />, children: 'Columns', suffix: '19 of 138' },
}

export const IconWithBadge: Story = {
  args: {
    icon: <BellIcon />,
    children: undefined,
    badge: 6,
    'aria-label': 'Alerts, 6 new',
  },
}

// ---- Colors ----------------------------------------------------------------
export const Primary: Story = {
  args: {
    variant: 'primary',
    icon: <BookmarkIcon />,
    children: 'Save as report',
  },
}

export const Secondary: Story = {
  args: { variant: 'secondary' },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    icon: <ChevronUpIcon />,
    children: undefined,
    'aria-label': 'Hide chart',
  },
}

export const Dashed: Story = {
  args: {
    variant: 'dashed',
    size: 'sm',
    icon: <FilterIcon />,
    children: 'Add filter',
  },
}

export const Colors: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} variant="primary" icon={<BookmarkIcon />}>
        Primary
      </Button>
      <Button {...args} variant="secondary" icon={<ShareIcon />}>
        Secondary
      </Button>
      <Button {...args} variant="ghost" icon={<MenuIcon />}>
        Ghost
      </Button>
      <Button {...args} variant="dashed" icon={<FilterIcon />}>
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
            icon={<BookmarkIcon />}
          >
            Save ({size})
          </Button>
          <Button {...args} size={size} icon={<ShareIcon />}>
            Share ({size})
          </Button>
          <Button {...args} size={size}>
            Text ({size})
          </Button>
          <Button
            {...args}
            size={size}
            icon={<MoonIcon />}
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
            icon={<MoonIcon />}
            aria-label="Icon default"
          >
            {undefined}
          </Button>
          <Button
            {...args}
            variant={variant}
            icon={<MoonIcon />}
            aria-label="Icon disabled"
            disabled
          >
            {undefined}
          </Button>
        </Group>
      ))}
    </div>
  ),
  args: { icon: <ShareIcon /> },
}
