import type { Meta, StoryObj } from '@storybook/react-vite'

import Icon from '../Icon'
import { ICON_NAMES } from '../iconMap'
import { colors } from '../../../styles/colors'

const meta = {
  title: 'Components/Icons',
  component: Icon,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    name: {
      control: 'select',
      options: ICON_NAMES,
    },
  },
} satisfies Meta<typeof Icon>

export default meta

type Story = StoryObj<typeof meta>

export const AllIcons: Story = {
  args: {
    name: 'react',
  },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(8rem, 1fr))',
        gap: '0.8rem',
      }}
    >
      {ICON_NAMES.map((name) => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0.8rem',
            gap: '0.8rem',
            border: `1px solid ${colors.border}`,
            borderRadius: '0.8rem',
            background: colors.white,
          }}
        >
          <Icon name={name} width={28} height={28} alt={name} />
          <span
            style={{
              fontSize: '1.2rem',
              color: colors.textMuted,
              textAlign: 'center',
              wordBreak: 'break-all',
            }}
          >
            {name}
          </span>
        </div>
      ))}
    </div>
  ),
}
