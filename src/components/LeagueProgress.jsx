import { getLeagueProgress } from '../utils/localStorage'

function LeagueProgress({ totalGoals }) {
  const leagueInfo = getLeagueProgress(totalGoals)
  const { currentLeagueInfo, nextLeagueInfo, goalsNeeded, progressPercent } = leagueInfo

  return (
    <div className="card p-6">
      {/* Current League */}
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">{currentLeagueInfo.emoji}</div>
        <h3 className="text-2xl font-bold text-white mb-1">
          {currentLeagueInfo.name}
        </h3>
        <div className="text-lg text-white/70">
          {totalGoals} Tore geschossen
        </div>
      </div>

      {/* Progress Bar */}
      {nextLeagueInfo && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-white/70 mb-2">
            <span>{currentLeagueInfo.name}</span>
            <span>{nextLeagueInfo.name}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-msv-blue to-goal transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-center text-sm text-white/70 mt-2">
            Noch {goalsNeeded} Tore bis {nextLeagueInfo.name}
          </div>
        </div>
      )}

      {/* Bundesliga Achievement */}
      {!nextLeagueInfo && (
        <div className="bg-goal/20 border-2 border-goal rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">
            🏆 Bundesliga erreicht! 🏆
          </div>
          <div className="text-white/80">
            Du bist in der höchsten Liga!
          </div>
        </div>
      )}
    </div>
  )
}

export default LeagueProgress
