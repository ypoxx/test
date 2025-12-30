import cards from '../data/cards.json'

function CardAlbum({ unlockedCards, onClose }) {
  const unlockedSet = new Set(unlockedCards)

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="max-w-3xl w-full bg-slate-900/95 rounded-2xl border border-white/10 p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">🎴 Maurice' Sammelalbum</h2>
          <button className="btn-secondary" onClick={onClose}>Schließen</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {cards.map(card => {
            const isUnlocked = unlockedSet.has(card.id)
            return (
              <div
                key={card.id}
                className={`card-frame rarity-${card.rarity} ${isUnlocked ? '' : 'card-locked'}`}
              >
                <div className="card-header">
                  <span className="text-xs uppercase tracking-wide text-white/80">{card.title}</span>
                  <span className="text-xs font-bold text-white/80">{card.rarity}</span>
                </div>
                <div className="card-body">
                  <div className="text-4xl">⚽</div>
                  <div className="text-base font-bold text-white mt-2">
                    {isUnlocked ? card.name : '???'}
                  </div>
                  <div className="text-xs text-white/70 mt-1">
                    {isUnlocked ? card.description : 'Diese Karte fehlt noch.'}
                  </div>
                </div>
                <div className="card-footer">MSV Duisburg • Maurice Edition</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CardAlbum
