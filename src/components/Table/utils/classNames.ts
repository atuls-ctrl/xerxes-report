/** Joins the truthy class names; `undefined` when none are left. */
export const cx = (...names: (string | false | null | undefined)[]) =>
  names.filter(Boolean).join(' ') || undefined

/** Spreads `className` only when there is one (exactOptionalPropertyTypes). */
export const classNameProp = (className: string | undefined) =>
  className === undefined ? {} : { className }
