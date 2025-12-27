/**
 * Sound System for Maurice's Vocab Trainer
 * Uses Web Audio API for game sounds
 */

class SoundManager {
  constructor() {
    this.audioContext = null
    this.sounds = {}
    this.enabled = true
    this.masterVolume = 0.3

    // Initialize on user interaction (required by browsers)
    this.initialized = false
  }

  /**
   * Initialize audio context (must be called after user interaction)
   * Returns a promise that resolves when AudioContext is ready
   */
  async init() {
    if (this.initialized) {
      console.log('🔊 Sound already initialized')
      return true
    }

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.initialized = true
      console.log('🔊 Sound System initialized!')
      console.log('   - State:', this.audioContext.state)
      console.log('   - Sample Rate:', this.audioContext.sampleRate)

      // iOS FIX: Immediately resume AudioContext and play silent sound
      if (this.audioContext.state === 'suspended') {
        console.log('🔊 iOS detected - resuming AudioContext immediately...')
        await this.audioContext.resume()
        console.log('✅ AudioContext resumed! State:', this.audioContext.state)
      }

      // iOS FIX: Play a silent sound to "unlock" audio
      // This is a well-known iOS Safari workaround
      const silentOscillator = this.audioContext.createOscillator()
      const silentGain = this.audioContext.createGain()
      silentGain.gain.value = 0.001 // Almost silent
      silentOscillator.connect(silentGain)
      silentGain.connect(this.audioContext.destination)
      silentOscillator.start(this.audioContext.currentTime)
      silentOscillator.stop(this.audioContext.currentTime + 0.001)
      console.log('🔊 Silent sound played to unlock iOS audio')

      return true
    } catch (error) {
      console.error('❌ Web Audio API not supported:', error)
      this.enabled = false
      return false
    }
  }

  /**
   * Ensure AudioContext is running (critical for iOS Safari)
   * Must be called before playing any sound
   */
  async ensureRunning() {
    if (!this.enabled || !this.initialized || !this.audioContext) {
      return false
    }

    if (this.audioContext.state === 'suspended') {
      console.log('🔊 AudioContext suspended, resuming...')
      try {
        await this.audioContext.resume()
        console.log('✅ AudioContext resumed! State:', this.audioContext.state)
      } catch (error) {
        console.error('❌ Failed to resume AudioContext:', error)
        return false
      }
    }

    return this.audioContext.state === 'running'
  }

  /**
   * Play a beep tone
   */
  playTone(frequency, duration, type = 'sine', volume = 1.0) {
    if (!this.enabled || !this.initialized) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type
    gainNode.gain.value = volume * this.masterVolume

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  /**
   * Play goal celebration sound (ascending melody)
   */
  async playGoal() {
    if (!this.enabled || !this.initialized) {
      console.warn('🔇 Sound not playing - not initialized yet')
      return
    }

    // Ensure AudioContext is running (critical for iOS)
    const isRunning = await this.ensureRunning()
    if (!isRunning) {
      console.warn('🔇 AudioContext not running, cannot play sound')
      return
    }

    console.log('🎵 Playing goal sound!')
    const now = this.audioContext.currentTime
    const melody = [
      { freq: 523.25, time: 0, duration: 0.15 },      // C5
      { freq: 659.25, time: 0.15, duration: 0.15 },   // E5
      { freq: 783.99, time: 0.3, duration: 0.3 }      // G5
    ]

    melody.forEach(note => {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.value = note.freq
      oscillator.type = 'sine'

      // Envelope
      gainNode.gain.setValueAtTime(0, now + note.time)
      gainNode.gain.linearRampToValueAtTime(0.3 * this.masterVolume, now + note.time + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration)

      oscillator.start(now + note.time)
      oscillator.stop(now + note.time + note.duration)
    })
  }

  /**
   * Play wrong answer sound (descending tone)
   */
  async playWrong() {
    if (!this.enabled || !this.initialized) return

    // Ensure AudioContext is running (critical for iOS)
    const isRunning = await this.ensureRunning()
    if (!isRunning) return

    const now = this.audioContext.currentTime
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(200, now)
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.3)

    gainNode.gain.setValueAtTime(0.2 * this.masterVolume, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3)

    oscillator.start(now)
    oscillator.stop(now + 0.3)
  }

  /**
   * Play streak sound (exciting rising tone)
   */
  async playStreak(streakLevel = 1) {
    if (!this.enabled || !this.initialized) return

    // Ensure AudioContext is running (critical for iOS)
    const isRunning = await this.ensureRunning()
    if (!isRunning) return

    const now = this.audioContext.currentTime
    const baseFreq = 400 + (streakLevel * 100)

    for (let i = 0; i < 3; i++) {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.value = baseFreq + (i * 200)
      oscillator.type = 'square'

      const startTime = now + (i * 0.08)
      gainNode.gain.setValueAtTime(0.15 * this.masterVolume, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.15)
    }
  }

  /**
   * Play achievement unlock sound (magical chime)
   */
  async playAchievement(rarity = 'common') {
    if (!this.enabled || !this.initialized) return

    // Ensure AudioContext is running (critical for iOS)
    const isRunning = await this.ensureRunning()
    if (!isRunning) return

    const now = this.audioContext.currentTime
    const rarityMultiplier = {
      common: 1,
      rare: 1.5,
      epic: 2,
      legendary: 3
    }[rarity] || 1

    // Magical ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.value = freq
      oscillator.type = 'sine'

      const startTime = now + (i * 0.1 / rarityMultiplier)
      const duration = 0.4 * rarityMultiplier

      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.25 * this.masterVolume, startTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
    })
  }

  /**
   * Play victory fanfare (triumphant melody)
   */
  async playVictory() {
    if (!this.enabled || !this.initialized) return

    // Ensure AudioContext is running (critical for iOS)
    const isRunning = await this.ensureRunning()
    if (!isRunning) return

    const now = this.audioContext.currentTime
    const melody = [
      { freq: 523.25, time: 0, duration: 0.2 },       // C5
      { freq: 659.25, time: 0.2, duration: 0.2 },     // E5
      { freq: 783.99, time: 0.4, duration: 0.2 },     // G5
      { freq: 1046.50, time: 0.6, duration: 0.5 }     // C6
    ]

    melody.forEach(note => {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.value = note.freq
      oscillator.type = 'triangle'

      gainNode.gain.setValueAtTime(0, now + note.time)
      gainNode.gain.linearRampToValueAtTime(0.35 * this.masterVolume, now + note.time + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration)

      oscillator.start(now + note.time)
      oscillator.stop(now + note.time + note.duration)
    })
  }

  /**
   * Play defeat sound (sad trombone)
   */
  async playDefeat() {
    if (!this.enabled || !this.initialized) return

    // Ensure AudioContext is running (critical for iOS)
    const isRunning = await this.ensureRunning()
    if (!isRunning) return

    const now = this.audioContext.currentTime
    const melody = [
      { freq: 392, time: 0, duration: 0.3 },
      { freq: 349.23, time: 0.3, duration: 0.3 },
      { freq: 329.63, time: 0.6, duration: 0.3 },
      { freq: 293.66, time: 0.9, duration: 0.5 }
    ]

    melody.forEach(note => {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.value = note.freq
      oscillator.type = 'sawtooth'

      gainNode.gain.setValueAtTime(0.2 * this.masterVolume, now + note.time)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration)

      oscillator.start(now + note.time)
      oscillator.stop(now + note.time + note.duration)
    })
  }

  /**
   * Play crowd cheer sound (noise burst)
   */
  async playCrowd() {
    if (!this.enabled || !this.initialized) return

    // Ensure AudioContext is running (critical for iOS)
    const isRunning = await this.ensureRunning()
    if (!isRunning) return

    const now = this.audioContext.currentTime
    const bufferSize = this.audioContext.sampleRate * 0.5
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const data = buffer.getChannelData(0)

    // Generate pink noise for crowd sound
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3
    }

    const noise = this.audioContext.createBufferSource()
    const filter = this.audioContext.createBiquadFilter()
    const gainNode = this.audioContext.createGain()

    noise.buffer = buffer
    filter.type = 'lowpass'
    filter.frequency.value = 1000

    noise.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.15 * this.masterVolume, now + 0.1)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5)

    noise.start(now)
    noise.stop(now + 0.5)
  }

  /**
   * Toggle sound on/off
   */
  toggle() {
    this.enabled = !this.enabled
    return this.enabled
  }

  /**
   * Set master volume (0.0 - 1.0)
   */
  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
  }
}

// Export singleton instance
const soundManager = new SoundManager()
export default soundManager
