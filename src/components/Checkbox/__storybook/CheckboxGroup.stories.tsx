import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { fn } from 'storybook/test'
import { CheckboxGroup, type CheckboxGroupOption } from '../CheckboxGroup'
import { colors } from '../../../styles/colors'

const dimensions: CheckboxGroupOption[] = [
  { value: 'advertiser', label: 'Advertiser' },
  { value: 'campaign', label: 'Campaign' },
  { value: 'adGroup', label: 'Ad group' },
  { value: 'creative', label: 'Creative' },
  { value: 'placement', label: 'Placement', disabled: true },
]

const days: CheckboxGroupOption[] = Array.from({ length: 7 }, (_, index) => ({
  value: `d${String(index + 1)}`,
  label: `D${String(index + 1)}`,
}))

const meta = {
  title: 'Components/CheckboxGroup',
  component: CheckboxGroup,
  tags: ['autodocs'],
  args: {
    label: 'Group by',
    options: dimensions,
    defaultValue: ['campaign'],
    variant: 'row',
    ordered: false,
    disabled: false,
    required: false,
    name: 'groupBy',
    onChange: fn(),
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['row', 'button'] },
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
    },
    label: { control: 'text' },
    helperText: { control: 'text' },
    errorMessage: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 241 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CheckboxGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

// Group-by list: the badge shows the order dimensions were picked in.
export const OrderedGroupBy: Story = {
  args: {
    ordered: true,
    defaultValue: ['campaign', 'advertiser'],
    helperText: 'Rows group in the order you pick.',
  },
}

export const DayButtons: Story = {
  args: {
    label: 'Days',
    name: 'days',
    variant: 'button',
    options: days,
    defaultValue: ['d3'],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'max-content', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
}

export const WithDescriptions: Story = {
  args: {
    label: 'Include',
    defaultValue: ['paused'],
    options: [
      {
        value: 'paused',
        label: 'Paused campaigns',
        description: 'Still count toward totals.',
      },
      {
        value: 'archived',
        label: 'Archived campaigns',
        description: 'Hidden from charts by default.',
      },
    ],
  },
}

export const Required: Story = {
  args: { required: true, defaultValue: [] },
}

export const ErrorState: Story = {
  args: {
    required: true,
    defaultValue: [],
    errorMessage: 'Pick at least one dimension.',
  },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const Controlled: Story = {
  args: { ordered: true },
  render: function ControlledGroup(args) {
    const [value, setValue] = useState(['advertiser'])
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <CheckboxGroup
          {...args}
          value={value}
          onChange={(next, event) => {
            setValue(next)
            args.onChange?.(next, event)
          }}
        />
        <span
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: 12,
            color: colors.textMuted,
          }}
        >
          Value: [{value.join(', ')}]
        </span>
      </div>
    )
  },
}
