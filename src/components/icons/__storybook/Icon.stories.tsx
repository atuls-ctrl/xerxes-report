import type { Meta, StoryObj } from '@storybook/react-vite';

import Icon, { ICON_NAMES } from '../Icon';

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
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;


export const AllIcons: Story = {
  args: {
    name: 'react',
  },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))',
        gap: '1.6rem',
      }}
    >
      {ICON_NAMES.map((name) => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.8rem',
            padding: '1.6rem',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: '0.8rem',
            background: 'var(--color-white, #fff)',
          }}
        >
          <Icon name={name} width={28} height={28} alt={name} />
          <span
            style={{
              fontSize: '1.2rem',
              color: 'var(--color-text-secondary, #6b7280)',
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
};
