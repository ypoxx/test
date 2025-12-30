import { useEffect } from 'react'
import { triggerHapticFeedback } from '../utils/gameEffects'
import soundManager from '../utils/sounds'

function FactUnlocked({ fact, onClose }) {
  useEffect(() => {
    triggerHapticFeedback('victory')
    soundManager.playAchievement('rare')
  }, [])

  if (!fact) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md animate-bounce-in">
        <div className="relative rounded-2xl p-1 bg-gradient-to-r from-blue-500/70 via-cyan-400/70 to-green-400/70 shadow-2xl">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6">
            <div className="text-center mb-4">
              <div className="text-sm font-bold uppercase tracking-wider text-white/60 mb-2">
                Fakt freigeschaltet!
              </div>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white">
                {fact.category === 'msv' ? 'MSV Duisburg' : 'Bundesliga'}
              </div>
            </div>

            <div className="text-center mb-4">
              <div className="text-7xl mb-3 animate-pulse-glow">📣</div>
            </div>

            <div className="text-center mb-3">
              <h2 className="text-2xl font-bold text-white mb-2">
                {fact.title}
              </h2>
              <p className="text-white/80 text-sm leading-relaxed">
                {fact.fact}
              </p>
            </div>

            <button
              onClick={onClose}
              className="btn-primary w-full mt-4"
            >
              Weiter
            </button>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <div className="sparkle-1 absolute top-10 left-10 text-cyan-300 text-2xl animate-ping">✨</div>
          <div className="sparkle-2 absolute top-20 right-10 text-green-300 text-xl animate-ping" style={{animationDelay: '0.2s'}}>⭐</div>
          <div className="sparkle-3 absolute bottom-10 left-20 text-blue-300 text-2xl animate-ping" style={{animationDelay: '0.4s'}}>💫</div>
          <div className="sparkle-4 absolute bottom-20 right-20 text-cyan-300 text-xl animate-ping" style={{animationDelay: '0.6s'}}>✨</div>
        </div>
      </div>
    </div>
  )
}

export default FactUnlocked
