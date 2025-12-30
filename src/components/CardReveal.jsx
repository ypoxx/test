import { useEffect, useState } from 'react'

function CardReveal({ reward, onClose }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (reward?.card) {
      setShow(true)
    }
  }, [reward])

  if (!reward?.card || !show) return null

  const { card, fact } = reward

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-w-sm w-full rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800 border border-white/10 shadow-2xl p-5 relative">
        <div className="text-center text-white text-lg font-bold mb-3">
          Neue Sammelkarte!
        </div>

        <div className={`card-frame rarity-${card.rarity}`}>
          <div className="card-header">
            <span className="text-xs uppercase tracking-wide text-white/80">{card.title}</span>
            <span className="text-xs font-bold text-white/80">{card.rarity}</span>
          </div>
          <div className="card-body">
            <div className="text-5xl">⚽</div>
            <div className="text-xl font-bold text-white mt-2">{card.name}</div>
            <div className="text-sm text-white/80 mt-1">{card.description}</div>
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
            setShow(false)
            onClose()
          }}
        >
          Weiter
        </button>
      </div>
    </div>
  )
}

export default CardReveal
