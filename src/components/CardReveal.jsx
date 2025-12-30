import { useEffect } from 'react'
import soundManager from '../utils/sounds'

function CardReveal({
  rarity = 'common',
  playSound = false,
  sound = 'achievement',
  className = '',
  children
}) {
  useEffect(() => {
    if (!playSound || !soundManager.initialized) return

    if (sound === 'legendary') {
      soundManager.playLegendaryFanfare()
      return
    }

    soundManager.playAchievement(rarity)
  }, [playSound, rarity, sound])

  return (
    <div className={`relative rounded-2xl p-1 rarity-${rarity} ${className}`}>
      <div className="relative rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 overflow-hidden">
        {children}
        {rarity === 'legendary' && (
          <div className="rarity-particles" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <span key={index} className="rarity-particle" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CardReveal
