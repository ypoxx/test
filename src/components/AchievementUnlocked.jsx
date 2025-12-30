import { getRarityColor, getRarityLabel } from '../utils/achievements'
import { triggerHapticFeedback } from '../utils/gameEffects'
import { useEffect } from 'react'
import CardReveal from './CardReveal'

function AchievementUnlocked({ achievement, onClose }) {
  useEffect(() => {
    // Trigger haptic feedback when achievement is shown
    triggerHapticFeedback('victory')
  }, [achievement.rarity])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md animate-bounce-in">
        {/* Achievement Card (Sammelkarten-Optik) */}
        <CardReveal
          rarity={achievement.rarity}
          playSound
          sound={achievement.rarity === 'legendary' ? 'legendary' : 'achievement'}
          className="shadow-2xl"
        >
            {/* Header */}
            <div className="text-center mb-4">
              <div className="text-sm font-bold uppercase tracking-wider text-white/60 mb-2">
                Achievement Freigeschaltet!
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getRarityColor(achievement.rarity)}`}>
                {getRarityLabel(achievement.rarity)}
              </div>
            </div>

            {/* Emoji/Icon */}
            <div className="text-center mb-4">
              <div className="text-8xl mb-4 animate-pulse-glow">
                {achievement.emoji}
              </div>
            </div>

            {/* Achievement Name */}
            <div className="text-center mb-3">
              <h2 className="text-3xl font-bold text-white mb-2">
                {achievement.name}
              </h2>
              <p className="text-white/80 text-sm">
                {achievement.description}
              </p>
            </div>

            {/* Rarity Shine Effect */}
            {achievement.rarity === 'legendary' && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/20 to-transparent animate-shine" />
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={onClose}
              className="btn-primary w-full mt-4"
            >
              Weiter
            </button>
        </CardReveal>

        {/* Sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="sparkle-1 absolute top-10 left-10 text-yellow-300 text-2xl animate-ping">✨</div>
          <div className="sparkle-2 absolute top-20 right-10 text-yellow-300 text-xl animate-ping" style={{animationDelay: '0.2s'}}>⭐</div>
          <div className="sparkle-3 absolute bottom-10 left-20 text-yellow-300 text-2xl animate-ping" style={{animationDelay: '0.4s'}}>💫</div>
          <div className="sparkle-4 absolute bottom-20 right-20 text-yellow-300 text-xl animate-ping" style={{animationDelay: '0.6s'}}>✨</div>
        </div>
      </div>
    </div>
  )
}

export default AchievementUnlocked
