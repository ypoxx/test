import { getXPProgressPercent, getXPToNextLevel, getLevelTitle, getLevelColor } from '../utils/xpSystem'

/**
 * XP Bar Component - Shows level progress
 */
function XPBar({ xp, level, className = '', showDetails = true }) {
  const progressPercent = getXPProgressPercent(xp, level)
  const xpToNext = getXPToNextLevel(xp, level)
  const levelTitle = getLevelTitle(level)
  const levelColor = getLevelColor(level)

  return (
    <div className={`w-full ${className}`}>
      {/* Level and Title */}
      {showDetails && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`text-2xl font-bold ${levelColor}`}>
              Level {level}
            </div>
            <div className="text-sm text-white/70">
              {levelTitle}
            </div>
          </div>
          <div className="text-sm text-white/60">
            {xpToNext} XP bis Level {level + 1}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative w-full h-8 bg-white/10 rounded-full overflow-hidden border border-white/20">
        {/* Fill */}
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
        </div>

        {/* Progress Text */}
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white drop-shadow-lg">
          {progressPercent}%
        </div>
      </div>
    </div>
  )
}

export default XPBar
