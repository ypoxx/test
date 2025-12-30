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
import { useMemo, useState } from 'react'
import cardsData from '../data/cards.json'
import { CARD_RARITIES } from '../utils/cardRewards'

const FILTERS = ['Alle', ...CARD_RARITIES]

const rarityBadgeStyles = {
  Common: 'bg-white/20 text-white',
  Rare: 'bg-blue-500/30 text-blue-100',
  Epic: 'bg-purple-500/30 text-purple-100',
  Legendary: 'bg-yellow-500/30 text-yellow-100'
}

function CardAlbum({ progress, onClose }) {
  const [activeFilter, setActiveFilter] = useState('Alle')
  const unlockedCards = progress.unlockedCards || []

  const cards = useMemo(() => {
    if (activeFilter === 'Alle') {
      return cardsData
    }
    return cardsData.filter(card => card.rarity === activeFilter)
  }, [activeFilter])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-4xl card p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold">📘 Kartenalbum</h2>
          <p className="text-white/70">Sammle alle MSV-Momente!</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeFilter === filter
                  ? 'bg-msv-blue text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards.map(card => {
            const unlocked = unlockedCards.includes(card.id)
            return (
              <div
                key={card.id}
                className={`rounded-xl border border-white/10 p-4 text-center transition-all ${
                  unlocked ? 'bg-white/10 hover:scale-105' : 'bg-black/30 card-silhouette'
                }`}
              >
                <div className="text-4xl mb-3">
                  {unlocked ? card.art : '❔'}
                </div>
                <h3 className="text-lg font-bold mb-1">
                  {unlocked ? card.name : 'Unbekannt'}
                </h3>
                <span
                  className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-widest ${
                    rarityBadgeStyles[card.rarity]
                  } ${unlocked ? '' : 'opacity-50'}`}
                >
                  {card.rarity}
                </span>
                <p className="text-xs text-white/70 mt-3">
                  {unlocked ? card.description : 'Diese Karte fehlt dir noch.'}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CardAlbum
