import { useState } from 'react'
import { Button } from '../Button'
import { Dropdown, type DropdownPlacement } from '../Dropdown'
import { Icon } from '../icons'
import styles from './UserMenu.module.scss'

export interface UserMenuUser {
  name: string
  email: string
  /** Role shown under the name and as a pill, e.g. "Ops Head". */
  role: string
  /** Access scope next to the role pill, e.g. "All campaigns". */
  scope?: string
  /** Avatar text. Derived from `name` when omitted. */
  initials?: string
}

export interface UserMenuProps {
  user: UserMenuUser
  onSignOut?: () => void
  /** Controlled visibility. Omit to let the component manage it. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: DropdownPlacement
  className?: string
}

const PANEL_WIDTH = 288

/** "Ops Head" -> "OH". */
function toInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

function Avatar({ text, size }: { text: string; size: 'sm' | 'lg' }) {
  return (
    <span className={styles.avatar} data-size={size} aria-hidden="true">
      {text}
    </span>
  )
}

/** Account pill in the header; opens the profile card with Sign out. */
export function UserMenu({
  user,
  onSignOut,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottomRight',
  className,
}: UserMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isOpen = open ?? internalOpen
  const initials = user.initials ?? toInitials(user.name)

  const changeOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next)
    onOpenChange?.(next)
  }

  const classes = [styles.root, className]
    .filter(Boolean)
    .join(' ')

  return (
    <Dropdown
      className={classes}
      variant="secondary"
      placement={placement}
      width={PANEL_WIDTH}
      size='lg'
      open={isOpen}
      onOpenChange={changeOpen}
      label={
        <span className={styles.trigger}>
          <Avatar text={initials} size="sm" />
          <span className={styles.triggerText}>
            <span className={styles.triggerName}>{user.name}</span>
            <span className={styles.triggerRole}>{user.role}</span>
          </span>
          <span className={styles.chevron}>
            <Icon name="down" size={14} aria-hidden="true" />
          </span>
        </span>
      }
      footer={
        <Button
          variant="ghost"
          size="sm"
          className={styles.signOut}
          icon={<Icon name="logout" aria-hidden="true" />}
          onClick={() => {
            changeOpen(false)
            onSignOut?.()
          }}
        >
          Sign out
        </Button>
      }
    >
      <div className={styles.profile}>
        <Avatar text={initials} size="lg" />
        <div className={styles.details}>
          <span className={styles.name}>{user.name}</span>
          <span className={styles.email}>{user.email}</span>
          <span className={styles.meta}>
            <span className={styles.pill}>{user.role}</span>
            {user.scope !== undefined && <span>{user.scope}</span>}
          </span>
        </div>
      </div>
    </Dropdown>
  )
}
