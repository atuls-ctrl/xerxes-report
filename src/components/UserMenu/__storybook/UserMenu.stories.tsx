import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { UserMenu } from '../UserMenu'

const meta = {
  title: 'Components/UserMenu',
  component: UserMenu,
  tags: ['autodocs'],
  args: {
    user: {
      name: 'Ops Head',
      email: 'admin@xapads.example',
      role: 'Ops Head',
      scope: 'All campaigns',
    },
    placement: 'bottomLeft',
    onSignOut: fn(),
    onOpenChange: fn(),
  },
  argTypes: {
    placement: {
      control: 'inline-radio',
      options: ['bottomLeft', 'bottomRight', 'topLeft', 'topRight'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 220, padding: 18 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UserMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Open: Story = {
  args: { defaultOpen: true },
}

/** Opens the card, signs out, and checks the card closes. */
export const SignOut: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /Ops Head/ }))
    await expect(canvas.getByText('admin@xapads.example')).toBeVisible()

    await userEvent.click(canvas.getByRole('button', { name: 'Sign out' }))
    await expect(args.onSignOut).toHaveBeenCalledOnce()
    await waitFor(async () => {
      await expect(canvas.queryByText('admin@xapads.example')).toBeNull()
    })
  },
}
