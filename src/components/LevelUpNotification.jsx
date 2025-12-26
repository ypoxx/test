import { useEffect } from 'react'
import { getLevelTitle, getLevelColor } from '../utils/xpSystem'
import soundManager from '../utils/sounds'
import { triggerHapticFeedback } from '../utils/gameEffects'

/**
 * Level Up Notification - Epic animation when leveling up
 */
function LevelUpNotification({ newLevel, onClose }) {
  const levelTitle = getLevelTitle(newLevel)
  const levelColor = getLevelColor(newLevel)

  useEffect(() => {
    // Play epic sound and haptic
    soundManager.playVictory()
    triggerHapticFeedback('victory')

    // Auto close after 3 seconds
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Fireworks/Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-yellow-400"
            style={{
              '--tx': `${Math.cos(i * 18 * Math.PI / 180) * 200}px`,
              '--ty': `${Math.sin(i * 18 * Math.PI / 180) * 200}px`,
              animation: 'fireworkExpand 1s ease-out forwards',
              animationDelay: `${i * 0.05}s`
            }}
          />
        ))}
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-lg mx-4 animate-bounce-in">
        <div className="card p-12 text-center bg-gradient-to-br from-purple-900/90 to-blue-900/90 border-4 border-yellow-400">
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent animate-shine pointer-events-none rounded-xl" />

          {/* Content */}
          <div className="relative z-10">
            <div className="text-6xl mb-4 animate-pulse-glow">
              🎉
            </div>

            <h2 className="text-4xl font-bold text-yellow-300 mb-2 animate-pulse">
              LEVEL UP!
            </h2>

            <div className={`text-6xl font-bold ${levelColor} mb-4`}>
              Level {newLevel}
            </div>

            <div className="text-2xl text-white/90 mb-6">
              {levelTitle}
            </div>

            <div className="text-white/70">
              Du wirst immer stärker! 💪
            </div>
          </div>

          {/* Sparkles */}
          <div className="absolute top-4 left-4 text-yellow-300 text-3xl animate-ping">✨</div>
          <div className="absolute top-4 right-4 text-yellow-300 text-3xl animate-ping" style={{animationDelay: '0.2s'}}>⭐</div>
          <div className="absolute bottom-4 left-4 text-yellow-300 text-3xl animate-ping" style={{animationDelay: '0.4s'}}>💫</div>
          <div className="absolute bottom-4 right-4 text-yellow-300 text-3xl animate-ping" style={{animationDelay: '0.6s'}}>✨</div>
        </div>

        {/* Click to close */}
        <button
          onClick={onClose}
          className="mt-4 text-white/60 hover:text-white text-sm"
        >
          Klick zum Schließen
        </button>
      </div>
    </div>
  )
}

export default LevelUpNotification
