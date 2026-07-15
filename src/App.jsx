import { useState, useEffect, lazy, Suspense } from 'react'
import Welcome from './components/Welcome'
import Stadium from './components/Stadium'
import Match from './components/Match'
import { loadProgress, loadSoundPreference, saveSoundPreference } from './utils/localStorage'
import soundManager from './utils/sounds'

// Dev-Galerie (Phase 3, ZUT-Umbau) — lazy, damit sie nicht ins Haupt-Bundle drückt
const ZutGallery = lazy(() => import('./components/ZutGallery'))

function App() {
  // Dev-Galerie hinter Query-Param (?zut-gallery) — vor allen Hooks, der
  // Query-Param ändert sich innerhalb einer Mount-Lebenszeit nie.
  if (new URLSearchParams(window.location.search).has('zut-gallery')) {
    return (
      <Suspense fallback={null}>
        <ZutGallery />
      </Suspense>
    )
  }

  const [gameState, setGameState] = useState('welcome') // 'welcome', 'stadium', or 'match'
  const [progress, setProgress] = useState(null)
  const [matchOptions, setMatchOptions] = useState(null)
  // Ask about sound only once — afterwards the stored preference applies
  // (it can still be changed anytime in the settings menu).
  const [soundPromptVisible, setSoundPromptVisible] = useState(() => loadSoundPreference() === null)

  useEffect(() => {
    // Load user progress on mount
    const savedProgress = loadProgress()
    setProgress(savedProgress)

    // Apply stored sound preference. iOS still requires a user gesture to
    // unlock audio — soundManager.init() runs on the first tap in a match.
    const soundPreference = loadSoundPreference()
    if (soundPreference !== null) {
      soundManager.setEnabled(soundPreference)
    }
  }, [])

  const startStadium = () => {
    setGameState('stadium')
  }

  const startMatch = (options) => {
    setMatchOptions(options || null)
    setGameState('match')
  }

  const endMatch = () => {
    setGameState('stadium')
    // Progress will be updated by Match component
    const updatedProgress = loadProgress()
    setProgress(updatedProgress)
  }

  const refreshProgress = () => {
    setProgress(loadProgress())
  }

  const handleProgressReset = () => {
    const freshProgress = loadProgress()
    setProgress(freshProgress)
    setGameState('welcome')
  }

  if (!progress) {
    return (
      <div className="flex items-center justify-center min-h-screen stadium-bg">
        <div className="text-2xl text-white">Lade Spiel...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen stadium-bg">
      {soundPromptVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-sm rounded-2xl bg-white/95 p-6 text-center shadow-xl">
            <h2 className="text-xl font-bold text-gray-900">Sound aktivieren?</h2>
            <p className="mt-2 text-sm text-gray-600">
              Du kannst das später jederzeit in den Einstellungen ⚙️ ändern.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <button
                className="rounded-full bg-blue-600 px-6 py-3 text-white shadow-md transition hover:bg-blue-700"
                onClick={() => {
                  soundManager.setEnabled(true)
                  saveSoundPreference(true)
                  soundManager.init().then(() => {
                    soundManager.playIntro()
                  })
                  setSoundPromptVisible(false)
                }}
              >
                Sound aktivieren
              </button>
              <button
                className="rounded-full bg-gray-100 px-6 py-3 text-gray-700 shadow-sm transition hover:bg-gray-200"
                onClick={() => {
                  soundManager.setEnabled(false)
                  saveSoundPreference(false)
                  setSoundPromptVisible(false)
                }}
              >
                Weiter ohne Sound
              </button>
            </div>
          </div>
        </div>
      )}
      {gameState === 'welcome' ? (
        <Welcome onStart={startStadium} />
      ) : gameState === 'stadium' ? (
        <Stadium
          progress={progress}
          onStartMatch={startMatch}
          onProgressReset={handleProgressReset}
          onProgressRefresh={refreshProgress}
        />
      ) : (
        <Match
          progress={progress}
          onMatchEnd={endMatch}
          filters={matchOptions ? { category: matchOptions.category, difficulty: matchOptions.difficulty } : null}
          mode={matchOptions?.mode || 'training'}
          seasonOpponent={matchOptions?.opponent || null}
          seasonMatchday={matchOptions?.matchday || null}
        />
      )}
    </div>
  )
}

export default App
