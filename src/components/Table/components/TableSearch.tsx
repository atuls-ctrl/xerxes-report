import { Icon } from '../../icons'
import { Input } from '../../Input'
import { DEFAULT_SEARCH_WIDTH, TABLE_TEXT } from '../constants'
import type { TableSearchProps } from '../types'

/** Toolbar search box. Filtering is up to the parent, via `onSearch`. */
export function TableSearch({
  value,
  defaultValue,
  placeholder = TABLE_TEXT.search,
  width = DEFAULT_SEARCH_WIDTH,
  disabled,
  onChange,
  onSearch,
}: TableSearchProps) {
  return (
    <Input
      type="search"
      size="md"
      width={width}
      placeholder={placeholder}
      aria-label={placeholder}
      leadingIcon={<Icon name="search" size={16} />}
      {...(value !== undefined && { value })}
      {...(defaultValue !== undefined && { defaultValue })}
      {...(disabled !== undefined && { disabled })}
      onChange={(event) => {
        onChange?.(event)
        onSearch?.(event.target.value)
      }}
    />
  )
}
