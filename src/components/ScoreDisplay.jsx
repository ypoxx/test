function ScoreDisplay({ msvGoals, opponentGoals, opponent }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
      <div className="flex items-center justify-between gap-4">
        {/* MSV Duisburg */}
        <div className="flex-1 text-center">
          <div className="text-xs text-white/70 mb-1">MSV Duisburg</div>
          <div className="text-2xl font-bold">🔵⚪</div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-3">
          <div className="text-4xl font-bold text-white">
            {msvGoals}
          </div>
          <div className="text-2xl text-white/50">:</div>
          <div className="text-4xl font-bold text-white">
            {opponentGoals}
          </div>
        </div>

        {/* Opponent */}
        <div className="flex-1 text-center">
          <div className="text-xs text-white/70 mb-1">{opponent.name}</div>
          <div className="text-2xl font-bold">{opponent.logo}</div>
        </div>
      </div>
    </div>
  )
}

export default ScoreDisplay
