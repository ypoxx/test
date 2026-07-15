import { getRarity } from '../utils/rarity'
import './FutCard.css'

/**
 * FutCard — wiederverwendbare FUT-Sammelkarte im Hochformat
 * (Design-Richtung A "Flutlicht-Gold", scratchpad/design/direction-a.html).
 *
 * Die Karte skaliert komplett über ihre width (container-type: inline-size,
 * innere Maße in cqw) — der Parent bestimmt die Größe, z.B. per style={{ width: 280 }}.
 *
 * @param {Object}  props
 * @param {Object}  props.card    - Eintrag aus src/data/cards.json
 *                                  (id, name, rarity, image, rating, position, stats)
 * @param {'reveal'|'tile'|'ghost'} [props.variant='reveal']
 *                                  reveal = große Bühnen-Karte mit Statzeile,
 *                                  tile   = Album-Kachel,
 *                                  ghost  = Fehlt-Zustand (Panini-Mechanik)
 * @param {number|string} [props.serial] - Serien-Nr. der Karte (z.B. 17 -> "#017")
 */

const CREST_SRC = '/cards/msv-crest.webp'

const formatSerial = (serial) => {
  if (serial === null || serial === undefined || serial === '') return null
  const n = Number(serial)
  return Number.isFinite(n) ? `#${String(n).padStart(3, '0')}` : `#${serial}`
}

const plainSerial = (serial) => {
  if (serial === null || serial === undefined || serial === '') return null
  return String(serial).replace(/^#0*/, '')
}

const StarIcon = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
    <path
      d="M6 .6l1.6 3.4 3.8.5-2.8 2.6.7 3.7L6 9l-3.3 1.8.7-3.7L.6 4.5l3.8-.5z"
      fill="currentColor"
    />
  </svg>
)

const LockIcon = () => (
  <svg viewBox="0 0 13 15" aria-hidden="true" focusable="false">
    <rect x="1" y="6" width="11" height="8" rx="2" fill="#FFCB2D" />
    <path d="M3.5 6V4.5a3 3 0 0 1 6 0V6" fill="none" stroke="#FFCB2D" strokeWidth="1.8" />
    <circle cx="6.5" cy="9.6" r="1.2" fill="#0A1730" />
  </svg>
)

function FutCard({ card, variant = 'reveal', serial }) {
  const rarity = getRarity(card.rarity)
  const tier = rarity.tier
  const serialText = formatSerial(serial)
  const showSheen = variant !== 'ghost' && (tier === 'gold' || tier === 'holo')

  /* ---------- Fehlt-Zustand (Ghost) ---------- */
  if (variant === 'ghost') {
    const nr = plainSerial(serial)
    return (
      <div className={`fut-card fut-card--ghost fc-${tier}`}>
        <div className="fc-shell">
          <div className="fc-inner">
            <span className="fc-ghost-tag">FEHLT</span>
            <div className="fc-ghost-art">
              <img src={card.image} alt="" loading="lazy" />
            </div>
            <span className="fc-ghost-lock">
              <LockIcon />
            </span>
            <div className="fc-ghost-name" lang="de">{card.name}</div>
            <div className="fc-foot">
              <span>{rarity.label}</span>
              {nr && <span>Nr. {nr}</span>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ---------- Album-Kachel (Tile) ---------- */
  if (variant === 'tile') {
    return (
      <div className={`fut-card fut-card--tile fc-${tier}`}>
        <div className="fc-shell">
          <div className="fc-inner">
            <div className="fc-rating">
              <span className="fc-rating-num">{card.rating}</span>
              <span className="fc-rating-pos">{card.position}</span>
            </div>
            <img className="fc-crest" src={CREST_SRC} alt="" loading="lazy" />
            <div className="fc-art">
              <img src={card.image} alt="" loading="lazy" />
            </div>
            <div className="fc-name" lang="de">{card.name}</div>
            <div className="fc-foot">
              <span>{rarity.label}</span>
              {serialText && <span className="fc-serial">{serialText}</span>}
            </div>
            {showSheen && <i className="fc-sheen" aria-hidden="true" />}
          </div>
        </div>
      </div>
    )
  }

  /* ---------- Bühnen-Karte (Reveal) ---------- */
  return (
    <div className={`fut-card fut-card--reveal fc-${tier}`}>
      <div className="fc-shell">
        <div className="fc-inner">
          <div className="fc-rating">
            <span className="fc-rating-num">{card.rating}</span>
            <span className="fc-rating-pos">{card.position}</span>
          </div>
          <img className="fc-crest" src={CREST_SRC} alt="MSV-Wappen" loading="lazy" />
          <div className="fc-art">
            <img src={card.image} alt="" loading="lazy" />
          </div>
          <div className="fc-lower">
            <div className="fc-divider" />
            <div className="fc-name" lang="de">{card.name}</div>
            <span className="fc-badge">
              <StarIcon />
              {rarity.label.toUpperCase()}
            </span>
            <div className="fc-stats">
              <div className="fc-stat">
                <span className="fc-stat-k">VOK</span>
                <span className="fc-stat-v">{card.stats?.vok}</span>
              </div>
              <div className="fc-stat">
                <span className="fc-stat-k">SER</span>
                <span className="fc-stat-v">{card.stats?.ser}</span>
              </div>
              <div className="fc-stat">
                <span className="fc-stat-k">TOR</span>
                <span className="fc-stat-v">{card.stats?.tor}</span>
              </div>
            </div>
          </div>
          {serialText && (
            <div className="fc-serial">{serialText} · MSV DUISBURG</div>
          )}
          {showSheen && <i className="fc-sheen" aria-hidden="true" />}
        </div>
      </div>
    </div>
  )
}

export default FutCard
