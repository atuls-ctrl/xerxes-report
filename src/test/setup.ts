import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom lacks the layout APIs Ant Design reads on mount.

if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  })
}

if (typeof window.ResizeObserver !== 'function') {
  class ResizeObserverStub {
    observe() {
      return undefined
    }
    unobserve() {
      return undefined
    }
    disconnect() {
      return undefined
    }
  }
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: ResizeObserverStub,
  })
}

// Ant Design measures the scrollbar through `::-webkit-scrollbar`; jsdom
// logs "Not implemented" for pseudo-elements, so read the element instead.
const getComputedStyle = window.getComputedStyle.bind(window)
window.getComputedStyle = (element: Element) => getComputedStyle(element)

afterEach(() => {
  cleanup()
})
