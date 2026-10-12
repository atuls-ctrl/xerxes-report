import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { fn } from 'storybook/test'
import { ToggleButton } from '../ToggleButton'

const meta = {
  title: 'Components/ToggleButton',
  component: ToggleButton,
  tags: ['autodocs'],
  args: {
    label: 'Compare previous 7 days',
    labelPosition: 'start',
    size: 'md',
    defaultChecked: true,
    disabled: false,
    loading: false,
    onChange: fn(),
    onError: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
  argTypes: {
    checked: { control: 'boolean' },
    label: { control: 'text' },
    labelPosition: { control: 'inline-radio', options: ['start', 'end'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    activeColor: { control: 'color' },
    inactiveColor: { control: 'color' },
    thumbColor: { control: 'color' },
  },
} satisfies Meta<typeof ToggleButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const On: Story = {
  args: { defaultChecked: true },
}

export const LabelOnRight: Story = {
  args: { labelPosition: 'end' },
}

export const WithoutLabel: Story = {
  args: { label: undefined, 'aria-label': 'Compare previous 7 days' },
}

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToggleButton {...args} size="sm" label="Small" />
      <ToggleButton {...args} size="md" label="Medium" />
      <ToggleButton {...args} size="lg" label="Large" />
    </div>
  ),
  args: { defaultChecked: true },
}

export const CustomColors: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToggleButton {...args} label="Brand purple" activeColor="#aa3bff" />
      <ToggleButton
        {...args}
        label="Danger"
        activeColor="#d93025"
        inactiveColor="#f3c1bd"
      />
      <ToggleButton
        {...args}
        label="Dark thumb"
        activeColor="#fbbc04"
        thumbColor="#202124"
      />
    </div>
  ),
  args: { defaultChecked: true },
}

export const Disabled: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToggleButton {...args} label="Disabled off" defaultChecked={false} />
      <ToggleButton {...args} label="Disabled on" defaultChecked />
    </div>
  ),
  args: { disabled: true },
}

export const Loading: Story = {
  args: { loading: true, defaultChecked: true },
}

export const Controlled: Story = {
  render: function ControlledToggle(args) {
    const [checked, setChecked] = useState(false)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ToggleButton
          {...args}
          checked={checked}
          onChange={(next, event) => {
            setChecked(next)
            void args.onChange?.(next, event)
          }}
        />
        <span style={{ fontSize: 13 }}>
          Parent state: <strong>{checked ? 'ON' : 'OFF'}</strong>
        </span>
      </div>
    )
  },
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

export const AsyncSuccess: Story = {
  args: {
    label: 'Saves for 1s, then succeeds',
    onChange: fn(async () => {
      await wait(1000)
    }),
  },
}

export const AsyncFailure: Story = {
  args: {
    label: 'Saves for 1s, then fails and reverts',
    onChange: fn(async () => {
      await wait(1000)
      throw new Error('Could not save preference')
    }),
  },
}
