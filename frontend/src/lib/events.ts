/**
 * Global event emitter for cross-component communication
 * Uses CustomEvent API for browser compatibility
 */

export type AppEvent = 
  | 'category:updated'
  | 'product:updated'
  | 'category:toggled'

export interface CategoryToggledEvent {
  categoryId: string
  isActive: boolean
  productCount: number
}

/**
 * Emit a global app event
 */
export const emitEvent = (eventName: AppEvent, detail?: any) => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent(eventName, { detail })
    window.dispatchEvent(event)
    
    // Also use localStorage to notify other tabs/windows
    localStorage.setItem('app:last-event', JSON.stringify({
      event: eventName,
      detail,
      timestamp: Date.now()
    }))
  }
}

/**
 * Listen to a global app event
 */
export const onEvent = (eventName: AppEvent, callback: (detail?: any) => void) => {
  if (typeof window !== 'undefined') {
    const handler = (e: Event) => {
      callback((e as CustomEvent).detail)
    }
    window.addEventListener(eventName, handler)
    return () => window.removeEventListener(eventName, handler)
  }
  return () => {}
}

/**
 * Listen to storage events (from other tabs)
 */
export const onStorageEvent = (callback: (eventName: AppEvent, detail?: any) => void) => {
  if (typeof window !== 'undefined') {
    const handler = (e: StorageEvent) => {
      if (e.key === 'app:last-event' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue)
          callback(data.event, data.detail)
        } catch (error) {
          console.error('Failed to parse storage event:', error)
        }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }
  return () => {}
}
