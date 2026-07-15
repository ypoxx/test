import vocabsData from '../data/vocabs.json'
import { CATEGORIES, getCategoryLabel } from '../utils/categories'
import './CategoryStats.css'

/* ---------- Inline-SVG-Glyphen (statt Emojis) ---------- */

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true
}

// Panel-Kopf: Balkendiagramm
const ChartIcon = () => (
  <svg {...svgProps}>
    <path d="M4.5 20.5h15" />
    <rect x="6" y="12.5" width="3.2" height="5.5" rx="0.8" fill="currentColor" stroke="none" />
    <rect x="10.9" y="8.5" width="3.2" height="9.5" rx="0.8" fill="currentColor" stroke="none" />
    <rect x="15.8" y="4.5" width="3.2" height="13.5" rx="0.8" fill="currentColor" stroke="none" />
  </svg>
)

// Komplett gemeistert: Stern
const StarIcon = () => (
  <svg {...svgProps}>
    <path
      d="M12 2.8l2.8 5.9 6.4 0.8-4.7 4.4 1.2 6.3-5.7-3.1-5.7 3.1 1.2-6.3-4.7-4.4 6.4-0.8z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
)

// Sport: Ball
const BallIcon = () => (
  <svg {...svgProps}>
    <circle cx="12" cy="12" r="9" />
    <path
      d="M12 8.2l3.6 2.6-1.4 4.3H9.8l-1.4-4.3z"
      fill="currentColor"
      stroke="none"
    />
    <path d="M12 3v5.2M15.6 10.8l4.9-1.6M14.2 15.1l3.1 4.2M9.8 15.1l-3.1 4.2M8.4 10.8L3.5 9.2" strokeWidth="1.5" />
  </svg>
)

// Schule: Buch
const BookIcon = () => (
  <svg {...svgProps}>
    <path d="M12 6.2C10 4.8 7 4.6 4.5 5.4v13c2.5-0.8 5.5-0.6 7.5 0.8 2-1.4 5-1.6 7.5-0.8v-13C17 4.6 14 4.8 12 6.2z" />
    <path d="M12 6.2v13" strokeWidth="1.5" />
  </svg>
)

// Familie: zwei Personen
const FamilyIcon = () => (
  <svg {...svgProps}>
    <circle cx="8.2" cy="7.4" r="2.7" />
    <path d="M3.4 18.6c0-3 2-4.9 4.8-4.9s4.8 1.9 4.8 4.9" />
    <circle cx="16.6" cy="9" r="2.1" />
    <path d="M14.6 18.6c0-2.5 0.9-4 2.9-4s2.9 1.5 2.9 4" strokeWidth="1.7" />
  </svg>
)

// Alltag: Haus
const HouseIcon = () => (
  <svg {...svgProps}>
    <path d="M4.5 11.2L12 4.5l7.5 6.7" />
    <path d="M6.5 10.5v9h11v-9" />
    <path d="M10.3 19.5v-5h3.4v5" strokeWidth="1.5" />
  </svg>
)

// Natur: Blatt
const LeafIcon = () => (
  <svg {...svgProps}>
    <path d="M19.5 4.5c-9 0-14 4.8-14 10.7 0 2.7 1.9 4.3 4.4 4.3 6.2 0 9.6-6.4 9.6-15z" />
    <path d="M5.5 19.5c3-6 7-10 11.5-12.7" strokeWidth="1.5" />
  </svg>
)

// Unregelmäßige Verben: Blitz (Aktion)
const BoltIcon = () => (
  <svg {...svgProps}>
    <path d="M13 2L3.8 13.5H12l-1 8L20.2 10H12l1-8z" fill="currentColor" stroke="none" />
  </svg>
)

// Körper & Gesundheit: Herz
const HeartIcon = () => (
  <svg {...svgProps}>
    <path d="M12 20.2C5.7 15.7 3.9 11.5 5.6 8.4 7 5.9 10.4 5.9 12 8.8c1.6-2.9 5-2.9 6.4-0.4 1.7 3.1-0.1 7.3-6.4 11.8z" />
  </svg>
)

// Medien & Technik: Chip
const ChipIcon = () => (
  <svg {...svgProps}>
    <rect x="7" y="7" width="10" height="10" rx="1.5" />
    <rect x="10.2" y="10.2" width="3.6" height="3.6" rx="0.8" fill="currentColor" stroke="none" />
    <path d="M9.5 7V4M14.5 7V4M9.5 20v-3M14.5 20v-3M7 9.5H4M7 14.5H4M20 9.5h-3M20 14.5h-3" strokeWidth="1.5" />
  </svg>
)

const CATEGORY_ICONS = {
  sport: BallIcon,
  school: BookIcon,
  family: FamilyIcon,
  everyday: HouseIcon,
  nature: LeafIcon,
  verbs: BoltIcon,
  body: HeartIcon,
  media: ChipIcon
}

/**
 * Category Stats - Shows progress per vocabulary category
 * (ZUT-Panel "Flutlicht-Gold": Gold = gemeistert, Schraffur = geübt)
 */
function CategoryStats({ progress }) {
  // Calculate stats per category
  const categories = CATEGORIES.map(c => c.value)
  const categoryData = categories.map(category => {
    const categoryVocabs = vocabsData.filter(v => v.category === category)
    const totalCount = categoryVocabs.length

    let masteredCount = 0
    let totalAttempts = 0
    let correctAttempts = 0
    let attemptedCount = 0

    categoryVocabs.forEach(vocab => {
      const vocabProgress = progress.vocabProgress[vocab.id]
      if (vocabProgress) {
        const correct = vocabProgress.correct || 0
        const incorrect = vocabProgress.incorrect || 0
        totalAttempts += correct + incorrect
        correctAttempts += correct
        if (correct + incorrect > 0) {
          attemptedCount++
        }
        if (vocabProgress.mastered) {
          masteredCount++
        }
      }
    })

    const masteredPercent = Math.round((masteredCount / totalCount) * 100)
    const attemptedPercent = Math.round((attemptedCount / totalCount) * 100)
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0

    return {
      category,
      name: getCategoryLabel(category),
      totalCount,
      masteredCount,
      attemptedCount,
      attemptedPercent,
      masteredPercent,
      accuracy
    }
  })

  return (
    <section className="cs-panel">
      <div className="cs-head">
        <span className="cs-head-icon" aria-hidden="true">
          <ChartIcon />
        </span>
        <div>
          <p className="cs-kicker">Kader-Check</p>
          <h3 className="cs-title">Deine Kategorien</h3>
        </div>
      </div>
      <p className="cs-legend">
        Schraffiert = geübt · <b>Gold = gemeistert</b> (5× richtig, über 80%)
      </p>

      <ul className="cs-list">
        {categoryData.map((cat) => {
          const complete = cat.totalCount > 0 && cat.masteredCount === cat.totalCount
          const Icon = CATEGORY_ICONS[cat.category] || BookIcon
          return (
            <li
              key={cat.category}
              className={`cs-row${complete ? ' cs-row--complete' : ''}`}
            >
              <div className="cs-row-head">
                <span className={`cs-icon${complete ? ' cs-icon--gold' : ''}`} aria-hidden="true">
                  <Icon />
                </span>
                <span className="cs-name">{cat.name}</span>
                {complete && (
                  <span className="cs-star" role="img" aria-label="Komplett gemeistert">
                    <StarIcon />
                  </span>
                )}
                <span className="cs-count">
                  <b>{cat.masteredCount}/{cat.totalCount}</b>
                  <small>gemeistert</small>
                </span>
              </div>

              <div
                className="cs-bar"
                role="progressbar"
                aria-label={`Fortschritt ${cat.name}`}
                aria-valuemin={0}
                aria-valuemax={cat.totalCount}
                aria-valuenow={cat.masteredCount}
                aria-valuetext={`${cat.masteredCount} von ${cat.totalCount} Vokabeln gemeistert, ${cat.attemptedCount} von ${cat.totalCount} geübt, ${cat.accuracy}% Genauigkeit`}
              >
                <i className="cs-bar-attempted" style={{ width: `${cat.attemptedPercent}%` }} />
                <i className="cs-bar-mastered" style={{ width: `${cat.masteredPercent}%` }} />
              </div>

              <p className="cs-meta">
                <span>{cat.masteredPercent}% gemeistert</span>
                <span aria-hidden="true">·</span>
                <span>{cat.attemptedCount}/{cat.totalCount} Vokabeln geübt ({cat.attemptedPercent}%)</span>
                <span aria-hidden="true">·</span>
                <span>{cat.accuracy}% Genauigkeit</span>
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default CategoryStats
