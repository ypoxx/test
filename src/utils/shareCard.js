const SHARE_WIDTH = 1200
const SHARE_HEIGHT = 630

const escapeText = (value) => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const buildShareCardSvg = ({ summary, matchResult, opponent, streak, achievement, xpGained, level }) => {
  const highlightLabel = achievement ? 'Neuer Erfolg' : 'Neuer Boost'
  const highlightValue = achievement
    ? `${achievement.emoji} ${achievement.name}`
    : `+${xpGained} XP`
  const streakLabel = streak > 1 ? `${streak} in Folge` : 'Neue Runde'

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SHARE_WIDTH}" height="${SHARE_HEIGHT}" viewBox="0 0 ${SHARE_WIDTH} ${SHARE_HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1b3a" />
      <stop offset="50%" stop-color="#102a56" />
      <stop offset="100%" stop-color="#1a4a88" />
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#60a5fa" />
    </linearGradient>
  </defs>
  <rect width="${SHARE_WIDTH}" height="${SHARE_HEIGHT}" fill="url(#bg)" rx="48" />
  <rect x="60" y="60" width="1080" height="510" fill="rgba(255,255,255,0.06)" rx="36" />

  <text x="120" y="150" fill="#c7d2fe" font-size="24" font-family="Arial" letter-spacing="6">MSV DUISBURG</text>
  <text x="120" y="190" fill="#ffffff" font-size="48" font-family="Arial" font-weight="700">Zebra Match</text>

  <text x="880" y="160" fill="#ffffff" font-size="34" font-family="Arial" font-weight="600">🔵⚪ vs ${escapeText(opponent.logo)}</text>

  <rect x="120" y="230" width="960" height="150" fill="rgba(255,255,255,0.08)" rx="24" />
  <text x="160" y="275" fill="#cbd5f5" font-size="20" font-family="Arial">Endstand</text>
  <text x="160" y="335" fill="#ffffff" font-size="64" font-family="Arial" font-weight="700">${matchResult.msvGoals}</text>
  <text x="300" y="335" fill="#9ca3af" font-size="48" font-family="Arial" font-weight="600">:</text>
  <text x="360" y="335" fill="#ffffff" font-size="64" font-family="Arial" font-weight="700">${matchResult.opponentGoals}</text>
  <text x="160" y="365" fill="#e0e7ff" font-size="22" font-family="Arial">${escapeText(summary.title)}</text>

  <rect x="120" y="410" width="300" height="110" fill="rgba(255,255,255,0.07)" rx="18" />
  <rect x="450" y="410" width="300" height="110" fill="rgba(255,255,255,0.07)" rx="18" />
  <rect x="780" y="410" width="300" height="110" fill="rgba(255,255,255,0.07)" rx="18" />

  <text x="150" y="455" fill="#22d3ee" font-size="40" font-family="Arial" font-weight="700">${matchResult.accuracy}%</text>
  <text x="150" y="485" fill="#cbd5f5" font-size="20" font-family="Arial">Trefferquote</text>

  <text x="480" y="455" fill="#ffffff" font-size="40" font-family="Arial" font-weight="700">${escapeText(streakLabel)}</text>
  <text x="480" y="485" fill="#cbd5f5" font-size="20" font-family="Arial">Streak</text>

  <text x="810" y="455" fill="#fde68a" font-size="40" font-family="Arial" font-weight="700">Lvl ${level}</text>
  <text x="810" y="485" fill="#cbd5f5" font-size="20" font-family="Arial">Dein Level</text>

  <rect x="120" y="535" width="960" height="60" fill="url(#accent)" rx="18" />
  <text x="150" y="565" fill="#ffffff" font-size="22" font-family="Arial" letter-spacing="4">${escapeText(highlightLabel)}</text>
  <text x="150" y="595" fill="#ffffff" font-size="28" font-family="Arial" font-weight="700">${escapeText(highlightValue)}</text>
</svg>`
}

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = (error) => reject(error)
    image.src = src
  })
}

export const createShareCardBlob = async (data) => {
  const svg = buildShareCardSvg(data)
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  try {
    const image = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = SHARE_WIDTH
    canvas.height = SHARE_HEIGHT
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0, SHARE_WIDTH, SHARE_HEIGHT)

    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Karte konnte nicht erstellt werden.'))
        }
      }, 'image/png')
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}
