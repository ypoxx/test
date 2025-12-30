function CardAlbum({ progress }) {
  const earnedCards = (progress.matchHistory || [])
    .flatMap((match) => (match.earnedCards || []).map(card => {
      if (typeof card === 'string') {
        return {
          id: card,
          name: card,
          unlockedAt: match.date
        }
      }

      return {
        ...card,
        unlockedAt: match.date
      }
    }))
    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))

  const recentCards = earnedCards.slice(0, 3)

  return (
    <div className="card p-6">
      <h3 className="text-xl font-bold text-white mb-4">
        🎴 Sticker-Album
      </h3>
      <div className="text-xs uppercase tracking-wide text-white/60 mb-3">
        Zuletzt freigeschaltet
      </div>
      {recentCards.length > 0 ? (
        <div className="space-y-2">
          {recentCards.map(card => (
            <div
              key={`${card.id}-${card.unlockedAt}`}
              className="bg-white/5 rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {card.emoji || '🎴'}
                </div>
                <div>
                  <div className="text-white font-semibold">
                    {card.name}
                  </div>
                  <div className="text-white/60 text-sm">
                    {new Date(card.unlockedAt).toLocaleDateString('de-DE')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-white/60 text-sm">
          Noch keine Karten freigeschaltet.
        </div>
      )}
    </div>
  )
}

export default CardAlbum
