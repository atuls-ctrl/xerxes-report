import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { Button } from '../../Button'
import { Drawer, type DrawerProps } from '../Drawer'

const COLUMNS = [
  'Gross clicks',
  'Gross installs',
  'Gross revenue',
  'Gross CR %',
  'Cost (Payout)',
  'Fraud %',
]

const list = { display: 'flex', flexDirection: 'column', gap: 12 } as const
const option = { display: 'flex', alignItems: 'center', gap: 10 } as const

const columnList = (
  <div style={list}>
    {COLUMNS.map((name) => (
      <label key={name} style={option}>
        <input type="checkbox" defaultChecked />
        {name}
      </label>
    ))}
  </div>
)

// The parent owns `open`; a button opens the drawer as it would in the app.
function DrawerDemo(args: DrawerProps) {
  const [open, setOpen] = useState(args.open)
  return (
    <>
      <Button
        variant="primary"
        onClick={() => {
          setOpen(true)
        }}
      >
        Open drawer
      </Button>
      <Drawer
        {...args}
        open={open}
        onClose={() => {
          setOpen(false)
          args.onClose()
        }}
      />
    </>
  )
}

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  args: {
    open: false,
    eyebrow: 'Performance',
    title: 'Campaign 26389 Wink · OEM Icon',
    children: 'Campaign details go here.',
    placement: 'right',
    width: 500,
    overlay: true,
    headerDivider: true,
    padded: true,
    showCloseButton: true,
    closeOnOverlayClick: true,
    closeOnEscape: true,
    closeLabel: 'Close',
    onClose: fn(),
  },
  argTypes: {
    placement: { control: 'inline-radio', options: ['left', 'right'] },
    title: { control: 'text' },
    eyebrow: { control: 'text' },
    subtitle: { control: 'text' },
    children: { control: false },
    header: { control: false },
    footer: { control: false },
    actions: { control: false },
    secondaryActions: { control: false },
  },
  render: (args) => <DrawerDemo {...args} />,
  // An open drawer is inlined on the docs page without this.
  parameters: { docs: { story: { inline: false, iframeHeight: 520 } } },
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

const columnsArgs = {
  title: 'Columns',
  subtitle: '19 of 138 selected',
  headerDivider: false,
  width: 680,
  children: columnList,
  secondaryActions: [
    { key: 'reset', label: 'Reset', onClick: fn() },
    { key: 'clear', label: 'Clear all', onClick: fn() },
  ],
  actions: [
    {
      key: 'apply',
      label: 'Apply 19 columns',
      onClick: fn(),
      closeOnClick: true,
    },
  ],
} satisfies Partial<DrawerProps>

export const Default: Story = {}

// ---- Drawers of the design -------------------------------------------------
export const Details: Story = {
  args: { open: true },
}

export const WithFooter: Story = {
  args: { ...columnsArgs, open: true },
  render: ({ eyebrow: _eyebrow, ...args }) => <DrawerDemo {...args} />,
}

// ---- Options ---------------------------------------------------------------
export const PlacementLeft: Story = {
  args: { open: true, placement: 'left' },
}

export const WithoutOverlay: Story = {
  args: { open: true, overlay: false },
}

export const CustomHeader: Story = {
  args: {
    open: true,
    'aria-label': 'Filters',
    header: <strong style={{ fontSize: 15 }}>Filters · 3 active</strong>,
  },
}

export const CustomFooter: Story = {
  args: {
    open: true,
    footer: <span style={{ fontSize: 12 }}>Last synced 2 minutes ago</span>,
  },
}

// The header and footer stay put; only the content scrolls.
export const LongContent: Story = {
  args: {
    ...columnsArgs,
    open: true,
    children: (
      <div style={list}>
        {Array.from({ length: 60 }, (_, index) => (
          <label key={index} style={option}>
            <input type="checkbox" />
            Column {index + 1}
          </label>
        ))}
      </div>
    ),
  },
  render: ({ eyebrow: _eyebrow, ...args }) => <DrawerDemo {...args} />,
}

// ---- Interaction tests -----------------------------------------------------
const closed = (canvasElement: HTMLElement) =>
  waitFor(() =>
    expect(within(canvasElement).queryByRole('dialog')).not.toBeInTheDocument(),
  )

// Browsers only act on a real Escape key press, so the tests close the dialog
// the way the browser does: natively, without the parent asking for it.
const pressEscape = (dialog: HTMLElement) => {
  ;(dialog as HTMLDialogElement).close()
}

export const OpensAndCloses: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Open drawer' })
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument()

    await userEvent.click(trigger)
    const dialog = canvas.getByRole('dialog', {
      name: 'Campaign 26389 Wink · OEM Icon',
    })
    await expect(dialog).toBeVisible()
    // Focus moves into the drawer.
    await expect(dialog).toContainElement(
      canvasElement.ownerDocument.activeElement as HTMLElement,
    )

    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
    await expect(args.onClose).toHaveBeenCalledTimes(1)
    await closed(canvasElement)
    // ...and back to the button that opened it.
    await expect(trigger).toHaveFocus()
  },
}

export const ClosesOnEscape: Story = {
  args: { open: true },
  play: async ({ canvasElement, args }) => {
    const dialog = within(canvasElement).getByRole('dialog')
    await userEvent.click(within(dialog).getByText('Campaign details go here.'))
    await expect(args.onClose).not.toHaveBeenCalled()

    pressEscape(dialog)
    // The dialog reports the close in a later task.
    await waitFor(() => expect(args.onClose).toHaveBeenCalledTimes(1))
    await closed(canvasElement)
  },
}

export const ClosesOnOverlayClick: Story = {
  args: { open: true },
  play: async ({ canvasElement, args }) => {
    const dialog = within(canvasElement).getByRole('dialog')
    // A click on the overlay targets the dialog, outside of its box.
    await userEvent.pointer({
      keys: '[MouseLeft]',
      target: dialog,
      coords: { clientX: 5, clientY: 5 },
    })
    await expect(args.onClose).toHaveBeenCalledTimes(1)
    await closed(canvasElement)
  },
}

export const KeepsOpenWhenDismissDisabled: Story = {
  args: { open: true, closeOnEscape: false, closeOnOverlayClick: false },
  play: async ({ canvasElement, args }) => {
    const dialog = within(canvasElement).getByRole('dialog')
    pressEscape(dialog)
    // Refused: the drawer is put straight back.
    await waitFor(() => expect(dialog).toBeVisible())
    await userEvent.pointer({
      keys: '[MouseLeft]',
      target: dialog,
      coords: { clientX: 5, clientY: 5 },
    })
    await expect(args.onClose).not.toHaveBeenCalled()
    await expect(dialog).toBeVisible()
  },
}

export const FooterActions: Story = {
  args: { ...columnsArgs, open: true },
  render: ({ eyebrow: _eyebrow, ...args }) => <DrawerDemo {...args} />,
  play: async ({ canvasElement, args }) => {
    const dialog = within(canvasElement).getByRole('dialog', {
      name: 'Columns',
    })
    const [reset] = columnsArgs.secondaryActions
    const [apply] = columnsArgs.actions

    // Reset runs its handler and leaves the drawer open.
    await userEvent.click(within(dialog).getByRole('button', { name: 'Reset' }))
    await expect(reset.onClick).toHaveBeenCalled()
    await expect(args.onClose).not.toHaveBeenCalled()
    await expect(dialog).toBeVisible()

    // Apply has `closeOnClick`.
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Apply 19 columns' }),
    )
    await expect(apply.onClick).toHaveBeenCalled()
    await expect(args.onClose).toHaveBeenCalledTimes(1)
    await closed(canvasElement)
  },
}
