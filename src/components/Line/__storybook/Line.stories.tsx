import type { Meta, StoryObj } from '@storybook/react-vite'
import { Line } from '../Line'

const meta = {
  title: 'Components/Line',
  component: Line,
  tags: ['autodocs'],
  args: {
    orientation: 'horizontal',
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
  },
} satisfies Meta<typeof Line>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {}

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <div style={{ display: 'flex', height: 80, gap: 16 }}>
      <span>Before</span>
      <Line {...args} />
      <span>After</span>
    </div>
  ),
}
