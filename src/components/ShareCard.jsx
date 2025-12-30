import { useMemo, useState } from 'react'

const escapeXml = (value) => (
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
)

const wrapText = (value, maxChars, maxLines = 2) => {
  const words = String(value).split(' ')
  const lines = []
  let line = ''

  words.forEach(word => {
    const nextLine = line ? `${line} ${word}` : word
    if (nextLine.length <= maxChars) {
      line = nextLine
    } else {
      if (line) lines.push(line)
      line = word
    }
  })

  if (line) lines.push(line)

  if (lines.length > maxLines) {
    const truncated = lines.slice(0, maxLines)
    const lastIndex = truncated.length - 1
    truncated[lastIndex] = `${truncated[lastIndex].replace(/\.$/, '')}…`
    return truncated
  }

  return lines
}

const getAccentColors = (rarity) => {
  switch (rarity) {
    case 'legendary':
      return ['#fbbf24', '#fb7185']
    case 'epic':
      return ['#a855f7', '#ec4899']
    case 'rare':
      return ['#38bdf8', '#6366f1']
    default:
      return ['#3b82f6', '#22d3ee']
  }
}

const getResultTheme = (summaryTitle = '') => {
  if (summaryTitle.includes('Sieg')) {
    return {
      bgStops: ['#60a5fa', '#34d399', '#fcd34d'],
      titleColor: '#0f172a',
      messageColor: '#1f2937',
      metaColor: '#0f172a',
      footerColor: '#334155'
    }
  }
  if (summaryTitle.includes('Niederlage')) {
    return {
      bgStops: ['#f87171', '#fb7185', '#fda4af'],
      titleColor: '#111827',
      messageColor: '#1f2937',
      metaColor: '#111827',
      footerColor: '#475569'
    }
  }
  return {
    bgStops: ['#38bdf8', '#a5b4fc', '#c7d2fe'],
    titleColor: '#0f172a',
    messageColor: '#1f2937',
    metaColor: '#0f172a',
    footerColor: '#334155'
  }
}

const buildShareSvg = ({ summary, reward }) => {
  const title = summary?.title || 'Maurices Spiel'
  const message = summary?.message || 'Stark gespielt!'
  const accuracy = summary?.accuracy ?? '0'
  const score = summary?.score || '0:0'
  const cardName = reward?.card?.name || 'Neue Sammelkarte'
  const fact = reward?.fact?.text || 'Weiter so, Maurice!'
  const rarity = reward?.card?.rarity?.toLowerCase() || 'common'
  const [accentStart, accentEnd] = getAccentColors(rarity)
  const theme = getResultTheme(title)
  const titleLines = wrapText(title, 18, 2)
  const messageLines = wrapText(message, 34, 2)
  const cardLines = wrapText(cardName, 22, 2)
  const factLines = wrapText(fact, 40, 3)

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${theme.bgStops[0]}"/>
          <stop offset="55%" stop-color="${theme.bgStops[1]}"/>
          <stop offset="100%" stop-color="${theme.bgStops[2]}"/>
        </linearGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${accentStart}"/>
          <stop offset="100%" stop-color="${accentEnd}"/>
        </linearGradient>
      </defs>
      <rect width="1080" height="1350" fill="url(#bg)"/>
      <circle cx="140" cy="180" r="90" fill="rgba(59,130,246,0.15)"/>
      <circle cx="980" cy="280" r="140" fill="rgba(34,211,238,0.12)"/>
      <circle cx="960" cy="1120" r="180" fill="rgba(168,85,247,0.12)"/>
      <circle cx="160" cy="1030" r="120" fill="rgba(250,204,21,0.12)"/>
      <rect x="60" y="60" width="960" height="1230" rx="48" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" stroke-width="4"/>
      <text x="540" y="150" font-family="Arial, sans-serif" font-size="40" fill="#93c5fd" text-anchor="middle">Maurice' Vokabel-Match</text>
      <text x="540" y="240" font-family="Arial, sans-serif" font-size="68" fill="#ffffff" text-anchor="middle">
        ${titleLines.map((line, index) => `<tspan x="540" dy="${index === 0 ? 0 : 70}">${escapeXml(line)}</tspan>`).join('')}
      </text>
      <text x="540" y="360" font-family="Arial, sans-serif" font-size="34" fill="#e5e7eb" text-anchor="middle">
        ${messageLines.map((line, index) => `<tspan x="540" dy="${index === 0 ? 0 : 48}">${escapeXml(line)}</tspan>`).join('')}
      </text>
      <rect x="180" y="380" width="720" height="160" rx="28" fill="rgba(255,255,255,0.08)" />
      <text x="540" y="460" font-family="Arial, sans-serif" font-size="38" fill="#ffffff" text-anchor="middle">Genauigkeit: ${accuracy}% · Ergebnis: ${score}</text>
      <rect x="140" y="590" width="800" height="360" rx="32" fill="url(#accent)" opacity="0.15"/>
      <text x="540" y="660" font-family="Arial, sans-serif" font-size="32" fill="#cbd5f5" text-anchor="middle">Neue Sammelkarte</text>
      <text x="540" y="740" font-family="Arial, sans-serif" font-size="52" fill="#ffffff" text-anchor="middle">
        ${cardLines.map((line, index) => `<tspan x="540" dy="${index === 0 ? 0 : 62}">${escapeXml(line)}</tspan>`).join('')}
      </text>
      <text x="540" y="830" font-family="Arial, sans-serif" font-size="30" fill="#e2e8f0" text-anchor="middle">⚽ ✨ ⚽</text>
      <rect x="160" y="940" width="760" height="230" rx="28" fill="rgba(255,255,255,0.08)"/>
      <text x="540" y="1020" font-family="Arial, sans-serif" font-size="28" fill="#e2e8f0" text-anchor="middle">
        ${factLines.map((line, index) => `<tspan x="540" dy="${index === 0 ? 0 : 40}">${escapeXml(line)}</tspan>`).join('')}
      </text>
      <text x="540" y="1240" font-family="Arial, sans-serif" font-size="26" fill="#94a3b8" text-anchor="middle">MSV Duisburg • Ruhrgebiet • 7. Klasse</text>
      <circle cx="140" cy="180" r="90" fill="rgba(255,255,255,0.3)"/>
      <circle cx="980" cy="280" r="140" fill="rgba(255,255,255,0.2)"/>
      <circle cx="960" cy="1120" r="180" fill="rgba(255,255,255,0.18)"/>
      <circle cx="160" cy="1030" r="120" fill="rgba(255,255,255,0.18)"/>
      <rect x="60" y="60" width="960" height="1230" rx="48" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.5)" stroke-width="4"/>
      <text x="540" y="150" font-family="Arial, sans-serif" font-size="40" fill="${theme.footerColor}" text-anchor="middle">Maurice' Vokabel-Match</text>
      <text x="540" y="240" font-family="Arial, sans-serif" font-size="68" fill="${theme.titleColor}" text-anchor="middle">
        ${titleLines.map((line, index) => `<tspan x="540" dy="${index === 0 ? 0 : 70}">${escapeXml(line)}</tspan>`).join('')}
      </text>
      <text x="540" y="360" font-family="Arial, sans-serif" font-size="34" fill="${theme.messageColor}" text-anchor="middle">
        ${messageLines.map((line, index) => `<tspan x="540" dy="${index === 0 ? 0 : 48}">${escapeXml(line)}</tspan>`).join('')}
      </text>
      <rect x="180" y="380" width="720" height="160" rx="28" fill="rgba(15,23,42,0.12)" />
      <text x="540" y="460" font-family="Arial, sans-serif" font-size="38" fill="${theme.metaColor}" text-anchor="middle">Vokabel-Erfolg: ${accuracy}% · Ergebnis: ${score}</text>
      <rect x="140" y="590" width="800" height="360" rx="32" fill="url(#accent)" opacity="0.25"/>
      <text x="540" y="660" font-family="Arial, sans-serif" font-size="32" fill="${theme.messageColor}" text-anchor="middle">Neue Sammelkarte</text>
      <text x="540" y="740" font-family="Arial, sans-serif" font-size="52" fill="${theme.titleColor}" text-anchor="middle">
        ${cardLines.map((line, index) => `<tspan x="540" dy="${index === 0 ? 0 : 62}">${escapeXml(line)}</tspan>`).join('')}
      </text>
      <text x="540" y="830" font-family="Arial, sans-serif" font-size="30" fill="${theme.messageColor}" text-anchor="middle">⚽ ✨ ⚽</text>
      <rect x="160" y="940" width="760" height="230" rx="28" fill="rgba(15,23,42,0.12)"/>
      <text x="540" y="1020" font-family="Arial, sans-serif" font-size="28" fill="${theme.messageColor}" text-anchor="middle">
        ${factLines.map((line, index) => `<tspan x="540" dy="${index === 0 ? 0 : 40}">${escapeXml(line)}</tspan>`).join('')}
      </text>
      <text x="540" y="1240" font-family="Arial, sans-serif" font-size="26" fill="${theme.footerColor}" text-anchor="middle">MSV Duisburg • Ruhrgebiet</text>
    </svg>
  `.trim()
}

function ShareCard({ summary, reward }) {
  const [sharing, setSharing] = useState(false)
  const svg = useMemo(() => buildShareSvg({ summary, reward }), [summary, reward])
  const rarityClass = reward?.card?.rarity ? `share-card--${reward.card.rarity.toLowerCase()}` : 'share-card--common'
  const resultClass = summary?.title?.includes('Sieg')
    ? 'share-card--success'
    : summary?.title?.includes('Niederlage')
      ? 'share-card--loss'
      : 'share-card--draw'

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

      <div className={`share-card ${rarityClass} ${resultClass}`}>
        <div className="share-card-header">
          <div className="share-card-eyebrow">Maurice' Vokabel-Match</div>
          <div className="share-card-title">{summary?.title}</div>
        </div>
        <div className="share-card-body">
          <div className="share-card-message">{summary?.message}</div>
          <div className="share-card-meta">
            Vokabel-Erfolg: {summary?.accuracy}% · Ergebnis: {summary?.score}
          </div>
        </div>
        <div className="share-card-reward">
          <div className="share-card-reward-label">Neue Karte</div>
          <div className="share-card-reward-title">{reward?.card?.name || '—'}</div>
          <div className="share-card-fact">{reward?.fact?.text || 'Weiter so!'}</div>
        </div>
        <div className="share-card-footer">MSV Duisburg • Ruhrgebiet</div>
      </div>

      <button className="btn-primary w-full mt-4" onClick={handleShare} disabled={sharing}>
        {sharing ? 'Teilen läuft...' : 'Jetzt teilen'}
      </button>
    </div>
  )
}

export default ShareCard
