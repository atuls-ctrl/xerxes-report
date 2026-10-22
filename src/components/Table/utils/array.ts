import type { OneOrMany } from '../types'

/** Normalizes a `OneOrMany` prop to a fresh list; `undefined` gives `[]`. */
export function toArray<T>(value: OneOrMany<T> | undefined): T[] {
  if (value === undefined) return []
  return isList(value) ? [...value] : [value]
}

// `Array.isArray` does not narrow `readonly T[]` out of a union.
function isList<T>(value: OneOrMany<T>): value is readonly T[] {
  return Array.isArray(value)
}
