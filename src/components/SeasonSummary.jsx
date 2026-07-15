import { getSeasonReward, getRankZone } from '../utils/season'

/**
 * End-of-season overlay: final rank, reward, start of the next season.
 */
function SeasonSummary({ season, onNextSeason }) {
  const { rank, points, wins, draws, losses, gf, ga } = season.completed
  const reward = getSeasonReward(rank)
  const zone = getRankZone(rank)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md card p-8 text-center animate-bounce-in">
        <div className="text-6xl mb-3">{zone.emoji}</div>
        <div className="text-sm uppercase tracking-widest text-white/60 mb-1">
          Saison {season.seasonNumber} beendet
        </div>
        <h2 className="text-3xl font-bold mb-2">{reward.title}</h2>
        <p className="text-white/80 mb-6">{reward.message}</p>

        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <div className={`text-4xl font-bold mb-1 ${zone.color}`}>Platz {rank}</div>
          <div className="text-white/70 text-sm">{points} Punkte · {gf}:{ga} Tore</div>
          <div className="text-white/60 text-xs mt-1">
            {wins} Siege · {draws} Unentschieden · {losses} Niederlagen
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-3 mb-6 border border-blue-400/40">
          <span className="text-blue-300 font-bold text-xl">+{reward.xp} XP</span>
          <span className="text-white/70 text-sm ml-2">Saison-Bonus</span>
        </div>

        <button onClick={onNextSeason} className="btn-primary btn-primary--hero w-full">
          🚀 Saison {season.seasonNumber + 1} starten
        </button>
      </div>
    </div>
  )
}

export default SeasonSummary
