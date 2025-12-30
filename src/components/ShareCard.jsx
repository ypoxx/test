import { useMemo, useState } from 'react'

const buildShareSvg = ({ summary, reward }) => {
  const title = summary?.title || 'Maurices Spiel'
  const message = summary?.message || 'Stark gespielt!'
  const accuracy = summary?.accuracy ?? '0'
  const score = summary?.score || '0:0'
  const cardName = reward?.card?.name || 'Neue Sammelkarte'
  const fact = reward?.fact?.text || 'Weiter so, Maurice!'

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0b1c3d"/>
          <stop offset="50%" stop-color="#101827"/>
          <stop offset="100%" stop-color="#05070f"/>
        </linearGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#22d3ee"/>
        </linearGradient>
      </defs>
      <rect width="1080" height="1350" fill="url(#bg)"/>
      <rect x="60" y="60" width="960" height="1230" rx="48" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" stroke-width="4"/>
      <text x="540" y="150" font-family="Arial, sans-serif" font-size="40" fill="#93c5fd" text-anchor="middle">Maurice' Vokabel-Match</text>
      <text x="540" y="240" font-family="Arial, sans-serif" font-size="72" fill="#ffffff" text-anchor="middle">${title}</text>
      <text x="540" y="330" font-family="Arial, sans-serif" font-size="36" fill="#e5e7eb" text-anchor="middle">${message}</text>
      <rect x="180" y="380" width="720" height="160" rx="28" fill="rgba(255,255,255,0.08)" />
      <text x="540" y="460" font-family="Arial, sans-serif" font-size="38" fill="#ffffff" text-anchor="middle">Genauigkeit: ${accuracy}% · Ergebnis: ${score}</text>
      <rect x="140" y="590" width="800" height="360" rx="32" fill="url(#accent)" opacity="0.15"/>
      <text x="540" y="660" font-family="Arial, sans-serif" font-size="32" fill="#cbd5f5" text-anchor="middle">Neue Sammelkarte</text>
      <text x="540" y="740" font-family="Arial, sans-serif" font-size="54" fill="#ffffff" text-anchor="middle">${cardName}</text>
      <text x="540" y="820" font-family="Arial, sans-serif" font-size="30" fill="#e2e8f0" text-anchor="middle">⚽</text>
      <rect x="160" y="940" width="760" height="230" rx="28" fill="rgba(255,255,255,0.08)"/>
      <text x="540" y="1020" font-family="Arial, sans-serif" font-size="28" fill="#e2e8f0" text-anchor="middle">${fact}</text>
      <text x="540" y="1240" font-family="Arial, sans-serif" font-size="26" fill="#94a3b8" text-anchor="middle">MSV Duisburg • Ruhrgebiet • 7. Klasse</text>
    </svg>
  `.trim()
}

function ShareCard({ summary, reward }) {
  const [sharing, setSharing] = useState(false)
  const svg = useMemo(() => buildShareSvg({ summary, reward }), [summary, reward])

  const handleShare = async () => {
    setSharing(true)

    try {
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      const image = new Image()
      const blob = await new Promise(resolve => {
        image.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = 1080
          canvas.height = 1350
          const ctx = canvas.getContext('2d')
          ctx.drawImage(image, 0, 0)
          canvas.toBlob(resolve, 'image/png')
          URL.revokeObjectURL(url)
        }
        image.src = url
      })
      const file = new File([blob], 'maurice-erfolg.png', { type: 'image/png' })

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'Maurices Erfolgskarte',
          text: 'Maurice hat wieder Vokabeln gespielt! ⚽',
          files: [file]
        })
      } else {
        const downloadUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = 'maurice-erfolg.png'
        link.click()
        URL.revokeObjectURL(downloadUrl)
      }
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="card p-4 mt-6">
      <div className="text-center text-xl font-bold mb-4">📲 Erfolgskarte teilen</div>

      <div className="share-card">
        <div className="share-card-header">
          <div className="text-sm uppercase tracking-wide text-white/70">Maurice' Vokabel-Match</div>
          <div className="text-3xl font-bold">{summary?.title}</div>
        </div>
        <div className="share-card-body">
          <div className="text-lg font-semibold">{summary?.message}</div>
          <div className="text-sm text-white/80 mt-2">
            Genauigkeit: {summary?.accuracy}% · Ergebnis: {summary?.score}
          </div>
        </div>
        <div className="share-card-reward">
          <div className="text-sm text-white/70">Neue Karte</div>
          <div className="text-lg font-bold">{reward?.card?.name || '—'}</div>
          <div className="text-xs text-white/70">{reward?.fact?.text || 'Weiter so!'}</div>
        </div>
        <div className="share-card-footer">MSV Duisburg • Ruhrgebiet • 7. Klasse</div>
      </div>

      <button className="btn-primary w-full mt-4" onClick={handleShare} disabled={sharing}>
        {sharing ? 'Teilen läuft...' : 'Jetzt teilen'}
      </button>
    </div>
  )
}

export default ShareCard
