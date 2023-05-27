// HOW TO USE:
// the hook returns a record of booleans, where the key is the name of the breakpoint
// if the screen size is greater than or equal to the breakpoint, the value will be true
// for example if the screen size is 1024px, the value of the 'md' key will be true and the value of the 'lg' key will be true
// if you were to check if the screen is smaller than a breakpoint you would check if it is false

import { useSyncExternalStore } from 'react'
import { BREAKPOINTS } from 'theme'

const isClient = typeof window !== 'undefined'

if (isClient) {
  // set up one listener
  window.addEventListener('resize', () => {
    const newSize = getScreenSize()
    listeners.forEach((listener) => listener(newSize))
  })
}

export const navSearchInputVisibleSize = 1100

// for breakpoints that are not meant to be used except for in marginal areas of the app
// we don't want to expose the types everywhere, just make them available via this hook
const BREAKPOINTS_ADDITIONAL = {
  ...BREAKPOINTS,
  navSearchInputVisible: navSearchInputVisibleSize,
}

type ScreenSize = Record<keyof typeof BREAKPOINTS_ADDITIONAL, boolean>
type ScreenSizeListener = (size: ScreenSize) => void

export function useScreenSize(): Record<keyof typeof BREAKPOINTS_ADDITIONAL, boolean> {
  return useSyncExternalStore(
    (onChange) => {
      return resizeSubscribe(onChange)
    },
    getScreenSize,
    getScreenSize
  )
}

let cached: ScreenSize | null = null

function getScreenSize(): ScreenSize {
  const next = Object.keys(BREAKPOINTS_ADDITIONAL).reduce(
    (obj, key) =>
      Object.assign(obj, {
        [key]: isClient
          ? window.innerWidth >= BREAKPOINTS_ADDITIONAL[key as keyof typeof BREAKPOINTS_ADDITIONAL]
          : false,
      }),
    {} as Record<keyof typeof BREAKPOINTS_ADDITIONAL, boolean>
  )
  if (cached && JSON.stringify(next) === JSON.stringify(cached)) {
    return cached
  }
  cached = next
  return next
}

const listeners = new Set<ScreenSizeListener>()

const resizeSubscribe = (listener: ScreenSizeListener) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
