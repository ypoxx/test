import { getStreakEmoji } from '../utils/gameEffects'

function ShareCard({ summary, matchResult, opponent, streak, achievement, xpGained, level }) {
  const streakLabel = streak > 1 ? `${streak} in Folge` : 'Neue Runde'
  const highlightLabel = achievement ? 'Neuer Erfolg' : 'Neuer Boost'
  const highlightValue = achievement
    ? `${achievement.emoji} ${achievement.name}`
    : `+${xpGained} XP`

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-blue-200/70">MSV Duisburg</div>
            <div className="text-2xl font-bold">Zebra Match</div>
          </div>
          <div className="flex items-center gap-2 text-xl font-bold">
            <span>🔵⚪</span>
            <span className="text-white/70">vs</span>
            <span>{opponent.logo}</span>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-white/10 p-4">
          <div className="text-sm text-white/70">Endstand</div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-4xl font-bold text-white">{matchResult.msvGoals}</div>
            <div className="text-xl text-white/60">:</div>
            <div className="text-4xl font-bold text-white">{matchResult.opponentGoals}</div>
          </div>
          <div className="mt-2 text-sm text-white/70">{summary.title}</div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg bg-white/5 p-3 text-center">
            <div className="text-2xl font-bold text-goal">{matchResult.accuracy}%</div>
            <div className="text-xs text-white/60">Trefferquote</div>
          </div>
          <div className="rounded-lg bg-white/5 p-3 text-center">
            <div className="text-2xl font-bold">{getStreakEmoji(streak)}</div>
            <div className="text-xs text-white/60">{streakLabel}</div>
          </div>
          <div className="rounded-lg bg-white/5 p-3 text-center">
            <div className="text-2xl font-bold text-yellow-300">Lvl {level}</div>
            <div className="text-xs text-white/60">Dein Level</div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-blue-400/40 bg-blue-500/20 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-blue-100/80">{highlightLabel}</div>
          <div className="mt-1 text-lg font-semibold text-white">{highlightValue}</div>
        </div>

        <div className="mt-4 text-xs text-white/60">maurice-vocab-trainer.de</div>
      </div>
    </div>
  )
}

export default ShareCard
