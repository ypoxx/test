import { ACHIEVEMENTS, getRarityTier, getRarityLabel } from '../utils/achievements'
import { getRarityBadgeClass } from './zoneStyles'

/**
 * Trophy Case - displays all achievements (locked and unlocked)
 */
function TrophyCase({ unlockedAchievementIds, onClose }) {
  const achievementsArray = Object.values(ACHIEVEMENTS)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
      <div className="min-h-screen flex items-start justify-center p-4 py-8">
        <div className="w-full max-w-4xl">
          <div className="card p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">
              🏆 Deine Trophäen
            </h2>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          {/* Stats */}
          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <div className="text-center">
              <span className="text-2xl font-bold text-white">
                {unlockedAchievementIds.length} / {achievementsArray.length}
              </span>
              <span className="text-white/70 ml-2">freigeschaltet</span>
            </div>
            <div className="mt-2 w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-msv-blue to-green-500 h-full transition-all duration-500"
                style={{
                  width: `${(unlockedAchievementIds.length / achievementsArray.length) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Achievement Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievementsArray.map((achievement) => {
              const isUnlocked = unlockedAchievementIds.includes(achievement.id)

              return (
                <div
                  key={achievement.id}
                  className={`relative rounded-xl p-4 transition-all duration-300 ${
                    isUnlocked
                      ? `${getRarityBadgeClass(getRarityTier(achievement.rarity))} hover:scale-105 cursor-pointer`
                      : 'bg-white/5 opacity-50 grayscale'
                  }`}
                >
                  {/* Achievement Card */}
                  <div className="text-center">
                    {/* Emoji/Icon */}
                    <div className="text-5xl mb-2">
                      {isUnlocked ? achievement.emoji : '🔒'}
                    </div>

                    {/* Name */}
                    <div className="text-sm font-bold text-white mb-1">
                      {isUnlocked ? achievement.name : '???'}
                    </div>

                    {/* Description */}
                    <div className="text-xs text-white/70 mb-2">
                      {isUnlocked ? achievement.description : 'Noch nicht freigeschaltet'}
                    </div>

                    {/* Rarity Badge */}
                    {isUnlocked && (
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getRarityBadgeClass(getRarityTier(achievement.rarity))}`}>
                        {getRarityLabel(achievement.rarity)}
                      </div>
                    )}
                  </div>

                  {/* Shine effect for legendary unlocked */}
                  {isUnlocked && achievement.rarity === 'legendary' && (
                    <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent animate-shine" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="btn-primary w-full mt-6"
          >
            Zurück zum Stadion
          </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrophyCase
