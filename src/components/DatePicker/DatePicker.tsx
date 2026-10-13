import { DatePicker as AntDatePicker, type GetRef } from 'antd'
import type { RangePickerProps } from 'antd/es/date-picker'
import type { PickerLocale } from 'antd/es/date-picker/generatePicker'
import enGB from 'antd/es/date-picker/locale/en_GB'
import dayjs, { type Dayjs } from 'dayjs'
import 'dayjs/locale/en-gb'
import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { Button } from '../Button'
import { Icon } from '../icons'
import {
  CUSTOM_RANGE,
  DEFAULT_PRESETS,
  formatRange,
  formatValue,
  type DatePickerPreset,
  type DatePickerValue,
} from './dateRange'
import styles from './DatePicker.module.scss'

const { RangePicker } = AntDatePicker

export type DatePickerSize = 'sm' | 'md' | 'lg'
export type DatePickerPlacement =
  'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'

export interface DatePickerProps {
  /** Controlled value. Omit to let the component manage its own state. */
  value?: DatePickerValue
  /** Initial value when uncontrolled. Defaults to the first preset. */
  defaultValue?: DatePickerValue
  /** Fires when a preset is picked or a custom range is applied. */
  onChange?: (value: DatePickerValue) => void
  /** Quick ranges listed above "Custom range". */
  presets?: DatePickerPreset[]
  /** Shows the "Custom range" option with the calendar. */
  allowCustom?: boolean
  customLabel?: string
  /** Heading of the dropdown. */
  title?: string
  applyLabel?: string
  /** Earliest / latest day with data. Days outside are disabled. */
  minDate?: Dayjs
  maxDate?: Dayjs
  size?: DatePickerSize
  disabled?: boolean
  /** Controlled dropdown visibility. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: DatePickerPlacement
  /** Overrides the text shown on the trigger. */
  formatLabel?: (value: DatePickerValue) => ReactNode
  /** Ant Design picker locale. Defaults to English with weeks starting Monday. */
  locale?: PickerLocale
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement
  className?: string
  id?: string
}

type DraftRange = [start: Dayjs | null, end: Dayjs | null]

const DEFAULT_LOCALE: PickerLocale = {
  ...enGB,
  lang: { ...enGB.lang, monthFormat: 'MMMM' },
}

const OPTION_SELECTOR = '[role="radio"]'

function getInitialValue(presets: DatePickerPreset[]): DatePickerValue {
  const now = dayjs()
  const first = presets.at(0)
  return first
    ? { preset: first.key, range: first.getRange(now) }
    : { preset: CUSTOM_RANGE, range: [now.startOf('day'), now] }
}

function getDataHint(minDate?: Dayjs, maxDate?: Dayjs) {
  if (minDate && maxDate) return `Data ${formatRange([minDate, maxDate])}`
  if (minDate) return `Data from ${formatRange([minDate, minDate])}`
  if (maxDate) return `Data until ${formatRange([maxDate, maxDate])}`
  return undefined
}

export function DatePicker({
  value,
  defaultValue,
  onChange,
  presets = DEFAULT_PRESETS,
  allowCustom = true,
  customLabel = 'Custom range',
  title = 'Date range',
  applyLabel = 'Apply',
  minDate,
  maxDate,
  size = 'md',
  disabled = false,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottomLeft',
  formatLabel,
  locale = DEFAULT_LOCALE,
  getPopupContainer,
  className,
  id,
}: DatePickerProps) {
  const [internalValue, setInternalValue] = useState(
    () => defaultValue ?? getInitialValue(presets),
  )
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  // What the open dropdown shows; only committed on preset click or Apply.
  const [customActive, setCustomActive] = useState(false)
  const [draft, setDraft] = useState<DraftRange>([null, null])
  const [pendingStart, setPendingStart] = useState<Dayjs | null>(null)
  const [wasOpen, setWasOpen] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const pickerRef = useRef<GetRef<typeof RangePicker>>(null)
  const panelId = useId()
  const titleId = useId()

  const current = value ?? internalValue
  const isOpen = (open ?? internalOpen) && !disabled

  // Reset the draft to the committed value every time the dropdown opens.
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen)
    if (isOpen) {
      setCustomActive(current.preset === CUSTOM_RANGE)
      setDraft(current.range)
      setPendingStart(null)
    }
  }

  const changeOpen = (next: boolean, restoreFocus = false) => {
    if (next !== isOpen) {
      if (open === undefined) setInternalOpen(next)
      onOpenChange?.(next)
    }
    if (restoreFocus) triggerRef.current?.focus()
  }

  const commit = (next: DatePickerValue) => {
    if (value === undefined) setInternalValue(next)
    onChange?.(next)
    changeOpen(false, true)
  }

  const dismiss = useEffectEvent((restoreFocus: boolean) => {
    changeOpen(false, restoreFocus)
  })

  // Ant's own open/close requests are ignored (the dropdown has to stay open
  // until Apply), so outside clicks and Escape are handled here.
  useEffect(() => {
    if (!isOpen) return undefined

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (rootRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      dismiss(false)
    }
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') dismiss(true)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Move focus into the dropdown so keyboard users land on the current option.
  useEffect(() => {
    if (!isOpen) return undefined
    const frame = requestAnimationFrame(() => {
      panelRef.current
        ?.querySelector<HTMLElement>(`${OPTION_SELECTOR}[aria-checked="true"]`)
        ?.focus({ preventScroll: true })
    })
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [isOpen])

  const handleRangeChange: RangePickerProps['onChange'] = (dates) => {
    setDraft([dates?.[0] ?? null, dates?.[1] ?? null])
    setPendingStart(null)
    // Ant leaves the end field active after a full range; hand the next click
    // back to the start field so a new selection starts over.
    if (isOpen) {
      queueMicrotask(() => {
        pickerRef.current?.focus()
      })
    }
  }

  const handleCalendarChange: RangePickerProps['onCalendarChange'] = (
    dates,
    _dateStrings,
    info,
  ) => {
    if (info.range === 'start') setPendingStart(dates[0] ?? null)
  }

  const handleOptionsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const options = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(OPTION_SELECTOR),
    )
    const index = options.findIndex((item) => item === document.activeElement)
    let next: number
    switch (event.key) {
      case 'ArrowDown':
        next = (index + 1) % options.length
        break
      case 'ArrowUp':
        next = (index - 1 + options.length) % options.length
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = options.length - 1
        break
      default:
        return
    }
    event.preventDefault()
    options[next]?.focus()
  }

  const [draftStart, draftEnd] = draft
  const completeDraft =
    draftStart && draftEnd && !pendingStart ? draft : undefined
  const selectedKey = customActive ? CUSTOM_RANGE : current.preset
  const dataHint = getDataHint(minDate, maxDate)

  let summary = dataHint
  if (customActive) {
    if (pendingStart)
      summary = `${formatRange([pendingStart, pendingStart])} – …`
    else if (draftStart && draftEnd)
      summary = formatRange([draftStart, draftEnd])
    else summary = 'Select a start date'
  }

  const renderOption = (key: string, label: string, onSelect: () => void) => {
    const checked = key === selectedKey
    return (
      <button
        key={key}
        type="button"
        role="radio"
        aria-checked={checked}
        className={styles.option}
        onClick={onSelect}
      >
        <span className={styles.checkbox} aria-hidden="true">
          {checked && <Icon name="check" />}
        </span>
        <span className={styles.optionLabel}>{label}</span>
      </button>
    )
  }

  const renderPanel = (calendar: ReactNode) => (
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-labelledby={titleId}
      className={styles.panel}
    >
      <div className={styles.body}>
        <div id={titleId} className={styles.title}>
          {title}
        </div>
        <div
          role="radiogroup"
          aria-labelledby={titleId}
          className={styles.options}
          onKeyDown={handleOptionsKeyDown}
        >
          {presets.map((preset) =>
            renderOption(preset.key, preset.label, () => {
              commit({ preset: preset.key, range: preset.getRange(dayjs()) })
            }),
          )}
          {allowCustom &&
            renderOption(CUSTOM_RANGE, customLabel, () => {
              setCustomActive(true)
            })}
        </div>
        {customActive && <div className={styles.calendar}>{calendar}</div>}
      </div>
      {(summary !== undefined || customActive) && (
        <div className={styles.footer}>
          <span className={styles.summary} aria-live="polite">
            {summary}
          </span>
          {customActive && (
            <Button
              variant="primary"
              size="sm"
              disabled={!completeDraft}
              onClick={() => {
                if (!completeDraft) return
                const [start, end] = completeDraft
                if (!start || !end) return
                commit({
                  preset: CUSTOM_RANGE,
                  range: [start.startOf('day'), end.endOf('day')],
                })
              }}
            >
              {applyLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div ref={rootRef} className={classes}>
      <Button
        {...(id !== undefined && { id })}
        ref={triggerRef}
        size={size}
        disabled={disabled}
        className={styles.trigger}
        icon={<Icon name="cal" />}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={() => {
          changeOpen(!isOpen)
        }}
      >
        <span className={styles.triggerContent}>
          <span className={styles.triggerText}>
            {formatLabel ? formatLabel(current) : formatValue(current, presets)}
          </span>
          <span className={styles.chevron} aria-hidden="true">
            <Icon name="down" />
          </span>
        </span>
      </Button>
      {/* The Ant picker only positions the dropdown and renders the calendar;
          its own inputs stay hidden behind the trigger. */}
      <div className={styles.anchor} aria-hidden="true">
        <RangePicker
          {...(minDate && { minDate })}
          {...(maxDate && { maxDate })}
          {...(getPopupContainer && { getPopupContainer })}
          ref={pickerRef}
          open={isOpen}
          value={draft}
          onChange={handleRangeChange}
          onCalendarChange={handleCalendarChange}
          panelRender={renderPanel}
          classNames={{ popup: { root: styles.popup } }}
          placement={placement}
          locale={locale}
          prevIcon={<Icon name="left" size={16} />}
          nextIcon={<Icon name="right" size={16} />}
          allowClear={false}
          inputReadOnly
          tabIndex={-1}
        />
      </div>
    </div>
  )
}
