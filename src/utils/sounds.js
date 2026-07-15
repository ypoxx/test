/**
 * Sound System for Maurice's Vocab Trainer
 * Uses Howler.js (bundled, works offline) for richer sampled game sounds.
 * The samples are high-quality stadium MP3s served from /sounds/ and
 * precached by the service worker, so they work offline after the first visit.
 */
import { Howl, Howler } from 'howler'

// Sampled stadium sounds shipped as static assets in public/sounds/.
// Served from the site root and precached by the PWA service worker.
const SOUND_FILES = {
  goal: '/sounds/goal.mp3',
  wrong: '/sounds/wrong.mp3',
  streak: '/sounds/streak.mp3',
  achievement: '/sounds/achievement.mp3',
  legendary: '/sounds/legendary.mp3',
  victory: '/sounds/victory.mp3',
  defeat: '/sounds/defeat.mp3',
  crowd: '/sounds/crowd.mp3',
  whistle: '/sounds/whistle.mp3',
  pack: '/sounds/pack.mp3',
  ambient: '/sounds/ambient.mp3'
}

class SoundManager {
  constructor() {
    this.audioContext = null
    this.sounds = {}
    this.enabled = true
    this.masterVolume = 0.3
    this.useHowler = false
    this.lastStreakAt = 0
    this.initPromise = null

    // Initialize on user interaction (required by browsers)
    this.initialized = false
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  init() {
    if (this.initPromise) {
      // Re-resume the context if iOS suspended it in the meantime
      if (this.audioContext && this.audioContext.state === 'suspended') {
        return this.audioContext.resume().catch(() => {})
      }
      return this.initPromise
    }

    this.initPromise = (async () => {
      try {
        Howler.volume(this.masterVolume)

        this.sounds = {
          goal: new Howl({ src: [SOUND_FILES.goal] }),
          wrong: new Howl({ src: [SOUND_FILES.wrong] }),
          streak: new Howl({ src: [SOUND_FILES.streak] }),
          achievement: new Howl({ src: [SOUND_FILES.achievement] }),
          legendary: new Howl({ src: [SOUND_FILES.legendary] }),
          victory: new Howl({ src: [SOUND_FILES.victory] }),
          defeat: new Howl({ src: [SOUND_FILES.defeat] }),
          crowd: new Howl({ src: [SOUND_FILES.crowd] }),
          whistle: new Howl({ src: [SOUND_FILES.whistle] }),
          pack: new Howl({ src: [SOUND_FILES.pack] }),
          ambient: new Howl({ src: [SOUND_FILES.ambient], loop: true })
        }

        this.useHowler = true
        this.audioContext = Howler.ctx

        if (this.audioContext && this.audioContext.state === 'suspended') {
          await this.audioContext.resume()
        }

        this.initialized = true
      } catch (error) {
        // Fall back to plain Web Audio synth sounds
        try {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
          if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume()
          }
          this.initialized = true
        } catch (fallbackError) {
          console.error('Web Audio API not supported:', fallbackError)
          this.enabled = false
        }
      }
    })()

    return this.initPromise
  }

  /**
   * Play a beep tone
   */
  playTone(frequency, duration, type = 'sine', volume = 1.0) {
    if (!this.enabled || !this.initialized || !this.audioContext) return

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
   * Play intro sound after user enables audio
   */
  playIntro() {
    if (!this.enabled || !this.initialized) return

    if (this.playSample('victory')) {
      return
    }

    const now = this.audioContext.currentTime
    const notes = [
      { freq: 523.25, time: 0, duration: 0.12 },
      { freq: 659.25, time: 0.12, duration: 0.12 },
      { freq: 783.99, time: 0.24, duration: 0.2 }
    ]

    notes.forEach(note => {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.value = note.freq
      oscillator.type = 'triangle'

      gainNode.gain.setValueAtTime(0, now + note.time)
      gainNode.gain.linearRampToValueAtTime(0.25 * this.masterVolume, now + note.time + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration)

      oscillator.start(now + note.time)
      oscillator.stop(now + note.time + note.duration)
    })
  }

  /**
   * Play goal celebration sound (ascending melody)
   */
  playGoal() {
    if (this.playSample('goal')) return
    this.playGoalSynth()
  }

  /**
   * Play wrong answer sound (descending tone)
   */
  playWrong() {
    if (this.playSample('wrong')) return
    this.playWrongSynth()
  }

  /**
   * Play streak sound (exciting rising tone)
   */
  playStreak(streakLevel = 1) {
    if (!this.enabled || !this.initialized) return

    if (this.useHowler && this.sounds.streak) {
      const now = performance.now()
      if (now - this.lastStreakAt < 180) {
        return
      }
      this.lastStreakAt = now

      const rate = 1 + Math.min(3, Math.max(0, streakLevel - 1)) * 0.08
      this.sounds.streak.stop()
      const id = this.sounds.streak.play()
      this.sounds.streak.rate(rate, id)
      return
    }

    this.playStreakSynth(streakLevel)
  }

  /**
   * Play achievement unlock sound (magical chime)
   */
  playAchievement(rarity = 'common') {
    if (!this.enabled || !this.initialized) return

    if (rarity === 'legendary') {
      this.playLegendaryFanfare()
      return
    }

    if (this.useHowler && this.sounds.achievement) {
      const rarityRates = {
        common: 1,
        rare: 1.08,
        epic: 1.12
      }

      const id = this.sounds.achievement.play()
      this.sounds.achievement.rate(rarityRates[rarity] || 1, id)
      return
    }

    this.playAchievementSynth(rarity)
  }

  /**
   * Play legendary fanfare (golden shimmer)
   */
  playLegendaryFanfare() {
    if (this.playSample('legendary')) return
    this.playLegendaryFanfareSynth()
  }

  /**
   * Play victory fanfare (triumphant melody)
   */
  playVictory() {
    if (this.playSample('victory')) return
    this.playVictorySynth()
  }

  /**
   * Play defeat sound (sad trombone)
   */
  playDefeat() {
    if (this.playSample('defeat')) return
    this.playDefeatSynth()
  }

  /**
   * Play crowd cheer sound (noise burst)
   */
  playCrowd() {
    if (this.playSample('crowd')) return
    this.playCrowdSynth()
  }

  /**
   * Play referee whistle (kickoff / "LOS!")
   */
  playWhistle() {
    if (this.playSample('whistle')) return
    // Synth fallback: short sharp high tone
    this.playTone(2000, 0.15, 'square', 0.3)
  }

  /**
   * Play card-pack opening shimmer
   */
  playPack() {
    if (this.playSample('pack')) return
    this.playPackSynth()
  }

  /**
   * Start ambient loop (optional background atmosphere)
   */
  startAmbient() {
    if (!this.enabled || !this.initialized) return
    if (this.useHowler && this.sounds.ambient) {
      this.sounds.ambient.play()
    }
  }

  /**
   * Stop ambient loop
   */
  stopAmbient() {
    if (!this.enabled || !this.initialized) return
    if (this.useHowler && this.sounds.ambient) {
      this.sounds.ambient.stop()
    }
  }

  playSample(key) {
    if (!this.enabled || !this.initialized) {
      return false
    }

    if (this.useHowler && this.sounds[key]) {
      this.sounds[key].play()
      return true
    }

    return false
  }

  playGoalSynth() {
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    const melody = [
      { freq: 523.25, time: 0, duration: 0.15 },
      { freq: 659.25, time: 0.15, duration: 0.15 },
      { freq: 783.99, time: 0.3, duration: 0.3 }
    ]

    melody.forEach(note => {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.value = note.freq
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0, now + note.time)
      gainNode.gain.linearRampToValueAtTime(0.3 * this.masterVolume, now + note.time + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration)

      oscillator.start(now + note.time)
      oscillator.stop(now + note.time + note.duration)
    })
  }

  playWrongSynth() {
    if (!this.audioContext) return

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

  playStreakSynth(streakLevel = 1) {
    if (!this.audioContext) return

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

  playAchievementSynth(rarity = 'common') {
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    const rarityMultiplier = {
      common: 1,
      rare: 1.5,
      epic: 2,
      legendary: 3
    }[rarity] || 1

    const notes = [523.25, 659.25, 783.99, 1046.50]

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

  playLegendaryFanfareSynth() {
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    const melody = [
      { freq: 523.25, time: 0, duration: 0.18, type: 'triangle' },
      { freq: 659.25, time: 0.18, duration: 0.18, type: 'triangle' },
      { freq: 783.99, time: 0.36, duration: 0.18, type: 'triangle' },
      { freq: 1046.5, time: 0.54, duration: 0.35, type: 'triangle' },
      { freq: 1318.51, time: 0.72, duration: 0.4, type: 'sine' }
    ]

    melody.forEach(note => {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.value = note.freq
      oscillator.type = note.type

      const startTime = now + note.time
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.35 * this.masterVolume, startTime + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration)

      oscillator.start(startTime)
      oscillator.stop(startTime + note.duration)
    })
  }

  playVictorySynth() {
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    const melody = [
      { freq: 523.25, time: 0, duration: 0.2 },
      { freq: 659.25, time: 0.2, duration: 0.2 },
      { freq: 783.99, time: 0.4, duration: 0.2 },
      { freq: 1046.50, time: 0.6, duration: 0.5 }
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

  playDefeatSynth() {
    if (!this.audioContext) return

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

  playCrowdSynth() {
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    const bufferSize = this.audioContext.sampleRate * 0.5
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const data = buffer.getChannelData(0)

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

  playPackSynth() {
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    const notes = [659.25, 987.77, 1318.51]

    notes.forEach((freq, i) => {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.value = freq
      oscillator.type = 'triangle'

      const startTime = now + (i * 0.06)
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.2 * this.masterVolume, startTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.25)
    })
  }

  /**
   * Enable or disable sound explicitly
   */
  setEnabled(enabled) {
    this.enabled = Boolean(enabled)
    if (!this.enabled && this.useHowler) {
      Howler.stop()
    }
    return this.enabled
  }

  /**
   * Toggle sound on/off
   */
  toggle() {
    return this.setEnabled(!this.enabled)
  }

  /**
   * Set master volume (0.0 - 1.0)
   */
  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    if (this.useHowler) {
      Howler.volume(this.masterVolume)
    }
  }
}

// Export singleton instance
const soundManager = new SoundManager()
export default soundManager
