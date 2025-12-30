import { useEffect, useState } from 'react'

const RARITY_STYLES = {
  Common: {
    badge: 'bg-white/20 text-white',
    glow: 'card-glow-common',
    border: 'border-white/30'
  },
  Rare: {
    badge: 'bg-blue-500/30 text-blue-100',
    glow: 'card-glow-rare',
    border: 'border-blue-300/50'
  },
  Epic: {
    badge: 'bg-purple-500/30 text-purple-100',
    glow: 'card-glow-epic',
    border: 'border-purple-300/50'
  },
  Legendary: {
    badge: 'bg-yellow-500/30 text-yellow-100',
    glow: 'card-glow-legendary',
    border: 'border-yellow-300/60'
  }
}

function CardReveal({ card, isNew, reward, onClose }) {
  const [stage, setStage] = useState('closed')
  const [showReward, setShowReward] = useState(false)

  useEffect(() => {
    if (reward?.card) {
      setShowReward(true)
      return
    }
    setShowReward(false)
  }, [reward])

  if (reward?.card) {
    if (!showReward) return null
    const { card: rewardCard, fact } = reward

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="max-w-sm w-full rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800 border border-white/10 shadow-2xl p-5 relative">
          <div className="text-center text-white text-lg font-bold mb-3">
            Neue Sammelkarte!
          </div>

          <div className={`card-frame rarity-${rewardCard.rarity}`}>
            <div className="card-header">
              <span className="text-xs uppercase tracking-wide text-white/80">
                {rewardCard.title || rewardCard.name}
              </span>
              <span className="text-xs font-bold text-white/80">{rewardCard.rarity}</span>
            </div>
            <div className="card-body">
              <div className="text-5xl">{rewardCard.art || '⚽'}</div>
              <div className="text-xl font-bold text-white mt-2">{rewardCard.name}</div>
              <div className="text-sm text-white/80 mt-1">{rewardCard.description}</div>
            </div>
            <div className="card-footer">MSV Duisburg • Maurice Edition</div>
          </div>

          {fact && (
            <div className="mt-4 text-sm text-white/80 bg-white/5 rounded-lg p-3">
              <div className="font-semibold mb-1">⚡ Fußball-Fact</div>
              <div>{fact.text}</div>
            </div>
          )}

          <button
            className="btn-primary w-full mt-4"
            onClick={() => {
              setShowReward(false)
              onClose()
            }}
          >
            Weiter
          </button>
        </div>
      </div>
    )
  }

  if (!card) return null

  const styles = RARITY_STYLES[card.rarity] || RARITY_STYLES.Common

  const openPack = () => {
    if (stage !== 'closed') return
    setStage('opening')
    setTimeout(() => setStage('revealed'), 900)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 stadium-scene field-pattern relative overflow-hidden">
      <div className="floodlight top-10 left-10" />
      <div className="floodlight top-10 right-10" />

      <div className="relative z-10 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold mb-2">🎁 Kartenpack</h2>
        <p className="text-white/80 mb-8">Ziehe deine Belohnung!</p>

        {stage !== 'revealed' ? (
          <div className="flex flex-col items-center gap-6">
            <div className={`pack-shell ${stage === 'opening' ? 'pack-opening' : ''}`}>
              <div className="pack-glow" />
              <div className="text-6xl">📦</div>
              <div className="text-sm mt-2 uppercase tracking-[0.2em] text-white/70">
                MSV Pack
              </div>
            </div>
            <button
              onClick={openPack}
              className="btn-primary w-full"
            >
              Pack öffnen
            </button>
          </div>
        ) : (
          <div className={`card-reveal ${styles.glow} ${styles.border} animate-bounce-in border-2 rounded-2xl p-6 relative overflow-hidden`}>
            <div className="card-shine" />
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-widest ${styles.badge}`}>
                {card.rarity}
              </span>
              {isNew && (
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-100 uppercase tracking-widest">
                  Neu
                </span>
              )}
            </div>
            <div className="text-7xl mb-4">{card.art || '🎴'}</div>
            <h3 className="text-2xl font-bold mb-2">{card.name}</h3>
            <p className="text-white/80 mb-4">{card.description}</p>
            <div className="text-xs uppercase tracking-widest text-white/60">
              Freischaltung: {card.unlockRule}
            </div>
            <div className="glimmer-particles" />
          </div>
        )}

        {stage === 'revealed' && (
          <button
            onClick={onClose}
            className="btn-secondary w-full mt-8"
          >
            Zurück ins Stadion
          </button>
        )}
      </div>
    </div>
  )
}

export default CardReveal
