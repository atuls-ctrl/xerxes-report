import { Fragment, useState } from 'react'
import { CheckboxGroup } from '../../Checkbox'
import { Dropdown } from '../../Dropdown'
import { Icon } from '../../icons'
import { TABLE_TEXT } from '../constants'
import { useTableActions, useTableState } from '../store/hooks'
import styles from '../Table.module.scss'
import type { TableGroupByOption, TableGroupByProps } from '../types'
import { toArray } from '../utils/array'

export type GroupByControlProps = Pick<
  TableGroupByProps,
  'options' | 'defaultValue' | 'label' | 'placeholder'
>

/**
 * Figma `div.tbar`: "Group by" label, then the picked dimensions as chips
 * joined by "›". The menu lists every dimension with its pick order; picks
 * are a draft until Apply, and Reset goes back to `defaultValue`. The
 * applied value lives in the table store.
 */
export function GroupByControl({
  options,
  defaultValue,
  label = TABLE_TEXT.groupBy,
  placeholder = TABLE_TEXT.groupByPlaceholder,
}: GroupByControlProps) {
  const { groupBy: selected } = useTableState()
  const { setGroupBy } = useTableActions()
  const [draft, setDraft] = useState(selected)

  return (
    <div className={styles.groupBy}>
      <span className={styles.groupByLabel}>
        <Icon name="layers" size={16} aria-hidden="true" />
        {label}
      </span>
      <Dropdown
        className={styles.groupByDropdown}
        variant="ghost"
        size="sm"
        title={TABLE_TEXT.groupByTitle}
        label={
          <GroupByChips
            options={options}
            selected={selected}
            placeholder={placeholder}
          />
        }
        onOpenChange={(open) => {
          // Start each visit from what is applied.
          if (open) setDraft(selected)
        }}
        clearLabel={TABLE_TEXT.groupByReset}
        onClear={() => {
          setDraft(toArray(defaultValue))
        }}
        onApply={() => {
          setGroupBy(draft)
        }}
      >
        <CheckboxGroup
          aria-label={TABLE_TEXT.groupByTitle}
          ordered
          options={options}
          value={draft}
          onChange={setDraft}
        />
      </Dropdown>
    </div>
  )
}

interface GroupByChipsProps {
  options: TableGroupByOption[]
  selected: readonly string[]
  placeholder: TableGroupByProps['placeholder']
}

/** Trigger content: "Bundle › Publisher" chips, or the placeholder. */
function GroupByChips({ options, selected, placeholder }: GroupByChipsProps) {
  const labelOf = (item: string) =>
    options.find((option) => option.value === item)?.label ?? item

  return (
    <span className={styles.groupByValue}>
      {selected.length > 0 ? (
        selected.map((item, index) => (
          <Fragment key={item}>
            {index > 0 && (
              <span className={styles.groupBySeparator} aria-hidden="true">
                ›
              </span>
            )}
            <span className={styles.groupChip}>{labelOf(item)}</span>
          </Fragment>
        ))
      ) : (
        <span className={styles.groupByPlaceholder}>{placeholder}</span>
      )}
      <Icon
        name="down"
        size={14}
        className={styles.groupByArrow}
        aria-hidden="true"
      />
    </span>
  )
}
