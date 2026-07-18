import { useState } from 'react'
import soundManager from '../utils/sounds'
import { saveSoundPreference, resetProgress } from '../utils/localStorage'

/**
 * Settings modal: sound toggle + progress reset.
 */
function Settings({ onClose, onProgressReset }) {
  const [soundOn, setSoundOn] = useState(soundManager.enabled)
  const [confirmReset, setConfirmReset] = useState(false)
  const [soundTestHint, setSoundTestHint] = useState(null)

  const handleSoundToggle = () => {
    const next = !soundOn
    setSoundOn(next)
    soundManager.setEnabled(next)
    saveSoundPreference(next)
    if (next) {
      soundManager.init().then(() => soundManager.playGoal())
    }
  }

  const handleSoundTest = async () => {
    setSoundTestHint(null)
    if (!soundOn) {
      setSoundOn(true)
      soundManager.setEnabled(true)
      saveSoundPreference(true)
    }
    await soundManager.init()
    soundManager.playGoal()
    // iOS can leave the AudioContext silently suspended even after a
    // successful-looking init() — that's the hardware mute switch, which no
    // website can override, so point directly at it instead of staying quiet.
    if (soundManager.getContextState() !== 'running') {
      setSoundTestHint(
        'Kein Ton zu hören? Prüf den Stumm-Schalter an der Seite deines iPhones (er darf nicht orange sein) und die Lautstärke.'
      )
    } else {
      setSoundTestHint('Ton läuft! Falls trotzdem nichts zu hören ist, prüf die Lautstärke.')
    }
  }

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    resetProgress()
    setConfirmReset(false)
    onProgressReset()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm card p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white"
          aria-label="Schließen"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 text-center">⚙️ Einstellungen</h2>

        {/* Sound Toggle */}
        <div className="flex items-center justify-between bg-white/5 rounded-lg p-4 mb-4">
          <div>
            <div className="font-semibold text-white">Sound</div>
            <div className="text-xs text-white/60">Tore, Jubel und Fanfaren</div>
          </div>
          <button
            onClick={handleSoundToggle}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
              soundOn
                ? 'bg-emerald-500 text-white'
                : 'bg-white/10 text-white/60'
            }`}
          >
            {soundOn ? '🔊 An' : '🔇 Aus'}
          </button>
        </div>

        {/* Sound-Diagnose (v.a. für iPhone: Stumm-Schalter etc.) */}
        <div className="bg-white/5 rounded-lg p-4 mb-4">
          <button
            onClick={handleSoundTest}
            className="w-full px-4 py-2 rounded-lg font-bold text-sm bg-white/10 text-white transition-all hover:bg-white/20"
          >
            🔈 Sound testen
          </button>
          {soundTestHint && (
            <p className="text-xs text-white/70 mt-2">{soundTestHint}</p>
          )}
        </div>

        {/* Reset */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="font-semibold text-white mb-1">Neustart</div>
          <div className="text-xs text-white/60 mb-3">
            Löscht den kompletten Spielstand (Tore, Karten, Trophäen). Mach vorher ein Backup!
          </div>
          <button
            onClick={handleReset}
            className={`w-full px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              confirmReset
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-red-500/20 text-red-200 border border-red-400/40'
            }`}
          >
            {confirmReset ? 'Wirklich alles löschen? Nochmal tippen!' : '🗑️ Spielstand zurücksetzen'}
          </button>
          {confirmReset && (
            <button
              onClick={() => setConfirmReset(false)}
              className="w-full mt-2 px-4 py-2 rounded-lg text-sm text-white/70 bg-white/10"
            >
              Abbrechen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
