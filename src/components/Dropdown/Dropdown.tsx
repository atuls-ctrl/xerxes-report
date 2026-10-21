import {
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { Button, type ButtonSize, type ButtonVariant } from '../Button'
import styles from './Dropdown.module.scss'

export type DropdownPlacement =
  'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'

export interface DropdownProps {
  /** Text or node shown on the trigger button. */
  label: ReactNode
  /** Heading of the dropdown. */
  title?: ReactNode
  /** Dropdown content. */
  children?: ReactNode
  /** Shows the footer with the Clear and Apply buttons. */
  showFooter?: boolean
  /** Replaces the default footer buttons. */
  footer?: ReactNode
  applyLabel?: ReactNode
  clearLabel?: ReactNode
  applyDisabled?: boolean
  /** Fires when Apply is clicked. The dropdown then closes (see `closeOnApply`). */
  onApply?: () => void
  /** Fires when Clear is clicked. The dropdown stays open (see `closeOnClear`). */
  onClear?: () => void
  closeOnApply?: boolean
  closeOnClear?: boolean
  /** Controlled dropdown visibility. Omit to let the component manage it. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: DropdownPlacement
  /** Dropdown width. Numbers are pixels. */
  width?: number | string
  /** Trigger button look. */
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  /** Muted text after the trigger label, e.g. a count. */
  suffix?: ReactNode
  disabled?: boolean
  className?: string
  id?: string
}

// Gap kept between the dropdown and the viewport edge. Matches the stylesheet.
const VIEWPORT_MARGIN = 8

type DropdownCssVars = CSSProperties & Record<`--dropdown-${string}`, string>

export function Dropdown({
  label,
  title,
  children,
  showFooter = true,
  footer,
  applyLabel = 'Apply',
  clearLabel = 'Clear',
  applyDisabled = false,
  onApply,
  onClear,
  closeOnApply = true,
  closeOnClear = false,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottomLeft',
  width,
  variant = 'primary',
  size = 'sm',
  icon,
  suffix,
  disabled = false,
  className,
  id,
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)

  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const titleId = useId()

  const isOpen = (open ?? internalOpen) && !disabled
  const hasTitle = title !== undefined && title !== null && title !== false

  const changeOpen = (next: boolean, restoreFocus = false) => {
    if (next !== isOpen) {
      if (open === undefined) setInternalOpen(next)
      onOpenChange?.(next)
    }
    if (restoreFocus) triggerRef.current?.focus()
  }

  const dismiss = useEffectEvent((restoreFocus: boolean) => {
    changeOpen(false, restoreFocus)
  })

  // Close on outside click and Escape.
  useEffect(() => {
    if (!isOpen) return undefined

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (rootRef.current?.contains(target)) return
      dismiss(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss(true)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Nudge the dropdown sideways when it would overflow the viewport.
  useLayoutEffect(() => {
    if (!isOpen) return undefined

    const reposition = () => {
      const panel = panelRef.current
      if (!panel) return
      panel.style.setProperty('--dropdown-shift', '0px')
      const { left, right } = panel.getBoundingClientRect()
      const viewport = document.documentElement.clientWidth
      let shift = 0
      if (right > viewport - VIEWPORT_MARGIN) {
        shift = viewport - VIEWPORT_MARGIN - right
      }
      if (left + shift < VIEWPORT_MARGIN) shift = VIEWPORT_MARGIN - left
      panel.style.setProperty('--dropdown-shift', `${String(shift)}px`)
    }

    reposition()
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('resize', reposition)
    }
  }, [isOpen, placement, width])

  // Move focus into the dropdown so keyboard users can Tab through its content.
  useEffect(() => {
    if (!isOpen) return undefined
    const frame = requestAnimationFrame(() => {
      panelRef.current?.focus({ preventScroll: true })
    })
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [isOpen])

  const cssVars: DropdownCssVars = {}
  if (width !== undefined) {
    cssVars['--dropdown-width'] =
      typeof width === 'number' ? `${String(width)}px` : width
  }

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div ref={rootRef} className={classes} style={cssVars}>
      <Button
        {...(id !== undefined && { id })}
        ref={triggerRef}
        variant={variant}
        size={size}
        icon={icon}
        className='filter_dropdown_badges'
        suffix={suffix}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={() => {
          changeOpen(!isOpen)
        }}
      >
        {label}
      </Button>
      {isOpen && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-labelledby={hasTitle ? titleId : undefined}
          tabIndex={-1}
          className={styles.panel}
          data-placement={placement}
        >
          {hasTitle && (
            <div id={titleId} className={styles.title}>
              {title}
            </div>
          )}
          <div className={styles.body}>{children}</div>
          {showFooter && (
            <div className={styles.footer}>
              {footer ?? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClear?.()
                      if (closeOnClear) changeOpen(false, true)
                    }}
                  >
                    {clearLabel}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={applyDisabled}
                    onClick={() => {
                      onApply?.()
                      if (closeOnApply) changeOpen(false, true)
                    }}
                  >
                    {applyLabel}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
