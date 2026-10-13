import {
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react'
import { Button, type ButtonVariant } from '../Button'
import { Icon } from '../icons'
import styles from './Drawer.module.scss'

export type DrawerPlacement = 'left' | 'right'

export interface DrawerAction {
  /** Stable id. Defaults to the position in the list. */
  key?: string
  label: ReactNode
  onClick?: () => void
  /** Button look. Defaults to `primary` for `actions`, `ghost` otherwise. */
  variant?: ButtonVariant
  icon?: ReactNode
  disabled?: boolean
  /** Closes the drawer after `onClick`. */
  closeOnClick?: boolean
}

export interface DrawerProps {
  /** Shows the drawer. */
  open: boolean
  /** Fires when the drawer asks to close: close button, Escape or overlay. */
  onClose: () => void
  /** Heading of the drawer. */
  title?: ReactNode
  /** Small text above the title, e.g. a section name. */
  eyebrow?: ReactNode
  /** Small text below the title, e.g. a count. */
  subtitle?: ReactNode
  /** Replaces the eyebrow, title and subtitle. The close button stays. */
  header?: ReactNode
  /** Line between the header and the content. */
  headerDivider?: boolean
  /** Drawer content. Scrolls when it does not fit. */
  children?: ReactNode
  /** Buttons on the right of the footer, e.g. Apply. */
  actions?: DrawerAction[]
  /** Buttons on the left of the footer, e.g. Reset. */
  secondaryActions?: DrawerAction[]
  /** Replaces the footer buttons. */
  footer?: ReactNode
  placement?: DrawerPlacement
  /** Drawer width. Numbers are pixels. Never wider than the viewport. */
  width?: number | string
  /** Dims the page behind the drawer. */
  overlay?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  /** Accessible name of the close button. */
  closeLabel?: string
  /** Padding around the content. Turn off for edge-to-edge content. */
  padded?: boolean
  /** Accessible name when there is no `title`. */
  'aria-label'?: string
  className?: string
  id?: string
}

type DrawerCssVars = CSSProperties & Record<`--drawer-${string}`, string>

export function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  subtitle,
  header,
  headerDivider = true,
  children,
  actions = [],
  secondaryActions = [],
  footer,
  placement = 'right',
  width,
  overlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  closeLabel = 'Close',
  padded = true,
  'aria-label': ariaLabel,
  className,
  id,
}: DrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  const hasTitle = title !== undefined && title !== null && title !== false
  const hasHeader = header !== undefined && header !== null && header !== false
  const hasFooter =
    (footer !== undefined && footer !== null && footer !== false) ||
    actions.length > 0 ||
    secondaryActions.length > 0

  // The native modal dialog traps focus, makes the page inert and returns
  // focus to the element that opened it.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  // Escape closes the dialog natively and `close` reports it. When Escape is
  // switched off the key is ignored (`closedby`) and `cancel` is refused.
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    if (!closeOnEscape) event.preventDefault()
  }

  // Fires for a close the parent did not ask for. Browsers can force one even
  // when `cancel` is refused; then the drawer is put straight back.
  const handleNativeClose = (event: SyntheticEvent<HTMLDialogElement>) => {
    if (!open) return
    if (closeOnEscape) onClose()
    else event.currentTarget.showModal()
  }

  // A click on the overlay targets the dialog itself, outside of its box.
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (!closeOnOverlayClick || event.target !== event.currentTarget) return
    const { left, right, top, bottom } =
      event.currentTarget.getBoundingClientRect()
    const inside =
      event.clientX >= left &&
      event.clientX <= right &&
      event.clientY >= top &&
      event.clientY <= bottom
    if (!inside) onClose()
  }

  const renderAction = (
    action: DrawerAction,
    index: number,
    defaultVariant: ButtonVariant,
  ) => (
    <Button
      key={action.key ?? index}
      variant={action.variant ?? defaultVariant}
      icon={action.icon}
      disabled={action.disabled ?? false}
      onClick={() => {
        action.onClick?.()
        if (action.closeOnClick) onClose()
      }}
    >
      {action.label}
    </Button>
  )

  const cssVars: DrawerCssVars = {}
  if (width !== undefined) {
    cssVars['--drawer-width'] =
      typeof width === 'number' ? `${String(width)}px` : width
  }

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <dialog
      {...(id !== undefined && { id })}
      ref={dialogRef}
      className={classes}
      style={cssVars}
      aria-labelledby={hasTitle && !hasHeader ? titleId : undefined}
      aria-label={ariaLabel}
      data-placement={placement}
      data-overlay={overlay}
      closedby={closeOnEscape ? 'closerequest' : 'none'}
      onCancel={handleCancel}
      onClose={handleNativeClose}
      onClick={handleClick}
    >
      <div className={styles.header} data-divider={headerDivider}>
        <div className={styles.heading}>
          {hasHeader ? (
            header
          ) : (
            <>
              {eyebrow !== undefined && (
                <div className={styles.caption}>{eyebrow}</div>
              )}
              {hasTitle && (
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
              )}
              {subtitle !== undefined && (
                <div className={styles.caption}>{subtitle}</div>
              )}
            </>
          )}
        </div>
        {showCloseButton && (
          <Button
            variant="ghost"
            icon={<Icon name="cross" />}
            aria-label={closeLabel}
            onClick={onClose}
          />
        )}
      </div>
      <div className={styles.body} data-padded={padded}>
        {children}
      </div>
      {hasFooter && (
        <div className={styles.footer}>
          {footer ?? (
            <>
              <div className={styles.secondaryActions}>
                {secondaryActions.map((action, index) =>
                  renderAction(action, index, 'ghost'),
                )}
              </div>
              <div className={styles.actions}>
                {actions.map((action, index) =>
                  renderAction(action, index, 'primary'),
                )}
              </div>
            </>
          )}
        </div>
      )}
    </dialog>
  )
}
