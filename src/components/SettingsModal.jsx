function SettingsModal({ settings, onClose, onUpdateSettings, onResetProgress }) {
  const handleToggle = (key) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key]
    })
  }

  const handleReset = () => {
    const confirmed = window.confirm('Willst du deinen Fortschritt wirklich zurücksetzen?')
    if (!confirmed) return
    onResetProgress()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">⚙️ Einstellungen</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl"
            aria-label="Einstellungen schließen"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
            <div>
              <div className="text-lg font-semibold text-white">🔊 Sound</div>
              <div className="text-sm text-white/60">Effekte und Jubel</div>
            </div>
            <button
              onClick={() => handleToggle('soundEnabled')}
              className={`px-4 py-2 rounded-full font-bold ${
                settings.soundEnabled
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 text-white/70'
              }`}
            >
              {settings.soundEnabled ? 'AN' : 'AUS'}
            </button>
          </div>

          <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
            <div>
              <div className="text-lg font-semibold text-white">📳 Vibration</div>
              <div className="text-sm text-white/60">Haptisches Feedback</div>
            </div>
            <button
              onClick={() => handleToggle('vibrationEnabled')}
              className={`px-4 py-2 rounded-full font-bold ${
                settings.vibrationEnabled
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 text-white/70'
              }`}
            >
              {settings.vibrationEnabled ? 'AN' : 'AUS'}
            </button>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-lg font-semibold text-white mb-1">♻️ Reset</div>
            <div className="text-sm text-white/60 mb-3">
              Setzt deinen Fortschritt zurück.
            </div>
            <button
              onClick={handleReset}
              className="w-full btn-secondary bg-red-600 hover:bg-red-700"
            >
              Fortschritt zurücksetzen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
