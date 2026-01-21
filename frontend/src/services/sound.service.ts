/**
 * Sound Service
 * Manages notification sounds for the application
 */

class SoundService {
  private audio: HTMLAudioElement | null = null
  private isEnabled: boolean = true

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio('/sounds/notification.mp3')
      this.audio.volume = 0.5 // Set default volume to 50%
    }
  }

  /**
   * Play notification sound
   */
  playNotification(): void {
    if (!this.isEnabled || !this.audio) return

    try {
      // Reset audio to start if already playing
      this.audio.currentTime = 0
      
      // Play the sound
      const playPromise = this.audio.play()
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Notification sound played successfully')
          })
          .catch((error) => {
            console.warn('Failed to play notification sound:', error)
          })
      }
    } catch (error) {
      console.error('Error playing notification sound:', error)
    }
  }

  /**
   * Enable sound notifications
   */
  enable(): void {
    this.isEnabled = true
  }

  /**
   * Disable sound notifications
   */
  disable(): void {
    this.isEnabled = false
  }

  /**
   * Check if sound is enabled
   */
  isEnabledSound(): boolean {
    return this.isEnabled
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume))
    }
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.audio?.volume || 0.5
  }
}

// Export singleton instance
const soundService = new SoundService()
export default soundService
