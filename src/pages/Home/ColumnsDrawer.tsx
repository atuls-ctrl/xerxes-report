import { useState } from 'react'
import { CheckboxGroup, type CheckboxGroupOption } from '../../components/Checkbox'
import { Drawer } from '../../components/Drawer'
import type { TableColumnsType } from '../../components/Table'
import styles from './ColumnsDrawer.module.scss'

interface ColumnSection {
  key: string
  title: string
  options: CheckboxGroupOption[]
}

// One section per column group. Top-level plain columns (the row label)
// always stay visible, so they are left out.
function getSections<RecordType>(
  columns: TableColumnsType<RecordType>,
): ColumnSection[] {
  return columns.flatMap((column) => {
    if (!('children' in column)) return []
    return [
      {
        key: String(column.key),
        title: typeof column.title === 'string' ? column.title : '',
        options: column.children.map((child) => ({
          value: String(child.key),
          label: typeof child.title === 'string' ? child.title : child.key,
        })),
      },
    ]
  })
}

export interface ColumnsDrawerProps<RecordType> {
  open: boolean
  onClose: () => void
  /** The table's columns. Leaf columns need a `key`. */
  columns: TableColumnsType<RecordType>
  /** Applied hidden columns; the drawer edits a copy until Apply. */
  hiddenKeys: string[]
  onApply: (hiddenKeys: string[]) => void
}

export function ColumnsDrawer<RecordType>({
  open,
  onClose,
  columns,
  hiddenKeys,
  onApply,
}: ColumnsDrawerProps<RecordType>) {
  const sections = getSections(columns)
  const allKeys = sections.flatMap((section) =>
    section.options.map((option) => option.value),
  )

  const [draft, setDraft] = useState(hiddenKeys)
  // Start from what is applied each time the drawer opens.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setDraft(hiddenKeys)
  }

  const hidden = new Set(draft)
  const visibleCount = allKeys.filter((key) => !hidden.has(key)).length

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Columns"
      subtitle={`${String(visibleCount)} of ${String(allKeys.length)} selected`}
      headerDivider={false}
      width={680}
      secondaryActions={[
        {
          key: 'reset',
          label: 'Reset',
          onClick: () => {
            setDraft([])
          },
        },
        {
          key: 'clear',
          label: 'Clear all',
          onClick: () => {
            setDraft(allKeys)
          },
        },
      ]}
      actions={[
        {
          key: 'apply',
          label: `Apply ${String(visibleCount)} columns`,
          disabled: visibleCount === 0,
          closeOnClick: true,
          onClick: () => {
            onApply(draft)
          },
        },
      ]}
    >
      <div className={styles.sections}>
        {sections.map((section) => {
          const sectionKeys = section.options.map((option) => option.value)
          return (
            <CheckboxGroup
              key={section.key}
              label={section.title}
              options={section.options}
              value={sectionKeys.filter((key) => !hidden.has(key))}
              onChange={(visible) => {
                const shown = new Set(visible)
                setDraft([
                  ...draft.filter((key) => !sectionKeys.includes(key)),
                  ...sectionKeys.filter((key) => !shown.has(key)),
                ])
              }}
            />
          )
        })}
      </div>
    </Drawer>
  )
}
