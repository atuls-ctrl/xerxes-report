import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { TableRowLabel, TableTag, TableValue } from '..'
import { colors } from '../../../styles/colors'

const meta = {
  title: 'Components/Table/Cells',
  component: TableValue,
  tags: ['autodocs'],
  args: { value: 14715, format: 'number', warning: false },
  argTypes: {
    format: {
      control: 'inline-radio',
      options: ['number', 'percent', 'money', 'delta'],
    },
    share: { control: 'number' },
    unit: { control: 'text' },
  },
} satisfies Meta<typeof TableValue>

export default meta
type Story = StoryObj<typeof meta>

const caption = {
  fontFamily: 'Outfit, system-ui, sans-serif',
  fontSize: 12,
  color: colors.textMuted,
  fontWeight: 600,
} as const
const muted = { color: colors.textSubtle, fontWeight: 400 } as const

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
      <div
        style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: 13 }}
      >
        {children}
      </div>
      <span style={caption}>
        {title}
        <span style={muted}> · {state}</span>
      </span>
    </div>
  )
}

export const Value: Story = {}

// Mirrors the Figma "Cell types · numbers, percentages, money" frame.
export const CellTypes: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px 56px' }}>
      <Cell title="Cell · Number" state="default">
        <TableValue value={14715} />
      </Cell>
      <Cell title="Cell · Percentage" state="default">
        <TableValue value={3.2} format="percent" />
      </Cell>
      <Cell title="Cell · Money" state="default">
        <TableValue value={169.2} format="money" />
      </Cell>
      <Cell title="Cell · Money (total)" state="no cents">
        <TableValue value={1269} format="money" decimals={0} />
      </Cell>
      <Cell title="Cell · warning value" state="warn">
        <TableValue value={30.1} format="percent" warning />
      </Cell>
      <Cell title="Cell · negative change" state="negative">
        <TableValue value={-1.2} format="delta" unit="pp" />
      </Cell>
      <Cell title="Cell · positive change" state="positive">
        <TableValue value={0.8} format="delta" unit="pp" />
      </Cell>
      <Cell title="Cell · empty value" state="default">
        <TableValue value={null} />
      </Cell>
      <Cell title="Event cell with % of installs" state="toggle on">
        <TableValue value={0} share={0} />
      </Cell>
    </div>
  ),
}

export const Tags: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', gap: 56 }}>
      <Cell title="Cell · Source type tag" state="mixed">
        <TableTag>Mixed · 2</TableTag>
      </Cell>
      <Cell title="Cell · Source type tag" state="single">
        <TableTag tone="success">CTV</TableTag>
      </Cell>
    </div>
  ),
}

export const RowLabels: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px 56px' }}>
      <Cell title="Row label" state="active">
        <TableRowLabel title="26389" meta="Wink · OEM Icon" status="active" />
      </Cell>
      <Cell title="Row label" state="paused">
        <TableRowLabel
          title="26390"
          meta="Wink · Push Retarget"
          status="paused"
        />
      </Cell>
      <Cell title="Row label" state="stopped">
        <TableRowLabel title="41122" meta="Shop Sale · CPS" status="stopped" />
      </Cell>
      <Cell title="Nested row label (level 2)" state="default">
        <TableRowLabel title="ru.rt.video.app.mobile" />
      </Cell>
      <Cell title="Leaf row label (level 3)" state="default">
        <TableRowLabel title="3439" meta="P2P" />
      </Cell>
    </div>
  ),
}
