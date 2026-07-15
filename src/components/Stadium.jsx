import { useRef, useState } from 'react'
import StadiumScene from './StadiumScene'
import ClubBadge from './ClubBadge'
import TrophyCase from './TrophyCase'
import CategoryStats from './CategoryStats'
import CardAlbum from './CardAlbum'
import Settings from './Settings'
import SeasonTable from './SeasonTable'
import SeasonSummary from './SeasonSummary'
import { getVocabStats } from '../utils/spacedRepetition'
import vocabsData from '../data/vocabs.json'
import cardsData from '../data/cards.json'
import { exportProgressData, getLeagueProgress, importProgressData, addXP } from '../utils/localStorage'
import { getXPProgressPercent, getXPToNextLevel, getLevelTitle } from '../utils/xpSystem'
import { loadSeason, getNextFixture, getRank, getRankZone, getSeasonReward, startNextSeason, MATCHDAYS } from '../utils/season'
import { getZoneStyle } from './zoneStyles'
import { OPPONENTS } from '../utils/matchLogic'
import { CATEGORIES } from '../utils/categories'
import './Stadium.css'

/**
 * Stadium — Stadion-Hub als Spielmenü "Zebra Ultimate Team"
 * (Design-Richtung A "Flutlicht-Gold"). Vertrag mit App.jsx UNVERÄNDERT:
 * <Stadium progress onStartMatch(options) onProgressReset onProgressRefresh />
 * Alle Handler/Modals (Settings, SeasonTable, SeasonSummary, TrophyCase,
 * CardAlbum, Backup-Export/Import) bleiben funktional identisch.
 */

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Alle' },
  ...CATEGORIES
]

const DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'Gemischt' },
  { value: 1, label: 'Leicht' },
  { value: 2, label: 'Mittel' },
  { value: 3, label: 'Schwer' }
]

/* ---------- Inline-SVG-Icons (statt Emojis) ---------- */
const GearIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M13.9 2l.5 2.5c.6.2 1.2.5 1.7 1l2.4-.9 1.9 3.3-1.9 1.6c.05.33.08.66.08 1s-.03.67-.08 1l1.9 1.6-1.9 3.3-2.4-.9c-.5.4-1.1.8-1.7 1L13.9 22h-3.8l-.5-2.5c-.6-.2-1.2-.5-1.7-1l-2.4.9-1.9-3.3 1.9-1.6a6.6 6.6 0 0 1 0-2L3.6 10.9l1.9-3.3 2.4.9c.5-.4 1.1-.8 1.7-1L10.1 2h3.8z"
      fill="currentColor"
    />
    <circle cx="12" cy="12" r="3" fill="#0A1730" />
  </svg>
)

const FlameIcon = () => (
  <svg viewBox="0 0 12 14" aria-hidden="true" focusable="false">
    <path
      d="M6.6.6C7 3 9.6 4.4 10.4 7c.8 2.7-.7 5.6-3.6 6.3C3.9 14 1.4 12.2 1 9.6.7 7.4 2 6 2.8 4.6c.3.9.4 1.7 1.2 2.2C4 4.4 4.7 2 6.6.6z"
      fill="currentColor"
    />
    <path
      d="M6.2 7.4c.9 1 1.7 2 1.3 3.3-.3 1.2-1.6 1.8-2.7 1.4-1-.4-1.5-1.6-1-2.6.3-.7.9-1 1.2-1.7.2.4.3.7.6.9.1-.5.3-.9.6-1.3z"
      fill="#FFF3C8"
    />
  </svg>
)

const TableIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <circle cx="2.4" cy="3.2" r="1.4" fill="currentColor" />
    <circle cx="2.4" cy="8" r="1.4" fill="currentColor" />
    <circle cx="2.4" cy="12.8" r="1.4" fill="currentColor" />
    <rect x="5.4" y="2.2" width="9.6" height="2" rx="1" fill="currentColor" />
    <rect x="5.4" y="7" width="9.6" height="2" rx="1" fill="currentColor" />
    <rect x="5.4" y="11.8" width="9.6" height="2" rx="1" fill="currentColor" />
  </svg>
)

const BallIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <circle cx="10" cy="10" r="8.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path d="M10 6.2l3.4 2.5-1.3 4H7.9l-1.3-4z" fill="currentColor" />
    <path
      d="M10 1.6v4.6M13.4 8.7l4.6-1.5M12.1 12.7l2.8 3.7M7.9 12.7l-2.8 3.7M6.6 8.7L2 7.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

const TargetIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="8" cy="8" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="8" cy="8" r="1.2" fill="currentColor" />
  </svg>
)

const CardsIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <rect
      x="2"
      y="4.5"
      width="9.5"
      height="13"
      rx="2"
      transform="rotate(-8 6.75 11)"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <rect
      x="9"
      y="3"
      width="9.5"
      height="13"
      rx="2"
      transform="rotate(7 13.75 9.5)"
      fill="currentColor"
      opacity=".85"
    />
  </svg>
)

const TrophyIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M4.2 1.6h7.6v2h2.6c0 2.6-1.3 4.3-3 4.8a4 4 0 0 1-2.4 1.9v1.5h2.2v2.6H4.8v-2.6H7V10.3a4 4 0 0 1-2.4-1.9c-1.7-.5-3-2.2-3-4.8h2.6zM2.9 4.8c.1 1.3.6 2.2 1.3 2.7V4.8zm10.2 0h-1.3v2.7c.7-.5 1.2-1.4 1.3-2.7z"
      fill="currentColor"
    />
  </svg>
)

const CheckCircleIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <circle cx="8" cy="8" r="6.8" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M5 8.3l2 2 4-4.4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const LoopIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M13.2 6.4A5.4 5.4 0 0 0 3.6 5M2.8 9.6A5.4 5.4 0 0 0 12.4 11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path d="M13.6 2.6v3.8H9.8zM2.4 13.4V9.6h3.8z" fill="currentColor" />
  </svg>
)

const BookIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M8 3.4C6.9 2.4 5.3 2 3.2 2c-.7 0-1.2.5-1.2 1.2v8.6c0 .7.5 1.2 1.2 1.2 2.1 0 3.7.4 4.8 1.4 1.1-1 2.7-1.4 4.8-1.4.7 0 1.2-.5 1.2-1.2V3.2c0-.7-.5-1.2-1.2-1.2-2.1 0-3.7.4-4.8 1.4z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M8 3.6v10.2" stroke="currentColor" strokeWidth="1.6" />
  </svg>
)

const SaveIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M8 1.6v8M4.8 6.4L8 9.6l3.2-3.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 10.4v2.6c0 .8.6 1.4 1.4 1.4h9.2c.8 0 1.4-.6 1.4-1.4v-2.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

const LoadIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M8 9.6v-8M4.8 4.8L8 1.6l3.2 3.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 10.4v2.6c0 .8.6 1.4 1.4 1.4h9.2c.8 0 1.4-.6 1.4-1.4v-2.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

/* Punkt-Icon für aktive Filter-Pills — Zustand nicht nur über Farbe */
const ActiveDot = () => (
  <svg
    className="st-pill-dot"
    viewBox="0 0 10 10"
    width="10"
    height="10"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="5" cy="5" r="4" fill="currentColor" />
  </svg>
)

/* Level-Titel aus xpSystem kommt mit Emoji-Präfix (z.B. "... Profi") —
   fürs ZUT-UI nur den Text verwenden. */
const plainLevelTitle = (level) => getLevelTitle(level).replace(/^\S+\s+/, '')

const RESULT_META = {
  win: { letter: 'S', label: 'Sieg' },
  loss: { letter: 'N', label: 'Niederlage' },
  draw: { letter: 'U', label: 'Unentschieden' }
}

function Stadium({ progress, onStartMatch, onProgressReset, onProgressRefresh }) {
  const stats = getVocabStats(vocabsData, progress)
  const [showTrophyCase, setShowTrophyCase] = useState(false)
  const leagueInfo = getLeagueProgress(progress.totalGoalsScored || 0)
  const { currentLeagueInfo, nextLeagueInfo, goalsNeeded, progressPercent } = leagueInfo
  const [showAlbum, setShowAlbum] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [backupStatus, setBackupStatus] = useState(null)
  const [category, setCategory] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const fileInputRef = useRef(null)

  // Wörter, die exakt zur gewählten Filter-Kombination passen. Unter 10
  // füllt das Match mit ähnlichen Wörtern derselben Kategorie auf
  // (padPoolToMinimum) — der Hinweis unten sagt das ehrlich an.
  const exactPoolCount = vocabsData.filter(vocab =>
    (category === 'all' || vocab.category === category) &&
    (difficulty === 'all' || vocab.difficulty === difficulty)
  ).length

  // Season state (lazily created on first visit)
  const [season, setSeason] = useState(() => loadSeason())
  const [showTable, setShowTable] = useState(false)
  const nextFixture = getNextFixture(season)
  const fixtureOpponent = nextFixture
    ? OPPONENTS.find(o => o.name === nextFixture.opponent)
    : null
  const seasonRank = getRank(season)
  const seasonZone = getRankZone(seasonRank)

  const handleNextSeason = () => {
    const reward = getSeasonReward(season.completed.rank)
    addXP(reward.xp)
    const freshSeason = startNextSeason()
    setSeason(freshSeason)
    onProgressRefresh?.()
  }

  const dailyStreak = progress.dailyStreak || 0

  // Level/XP für die Gold-Progressbar
  const level = progress.level || 1
  const xp = progress.xp || 0
  const xpPercent = getXPProgressPercent(xp, level)
  const xpToNext = getXPToNextLevel(xp, level)

  // Sammel-Fortschritt fürs Album (dedupliziert, wie im CardAlbum selbst)
  const ownedCardIds = new Set(progress.unlockedCards || [])
  const ownedCount = cardsData.filter(card => ownedCardIds.has(card.id)).length
  const albumPercent = cardsData.length
    ? Math.round((ownedCount / cardsData.length) * 100)
    : 0

  const handleExport = () => {
    const data = exportProgressData()
    if (!data) {
      setBackupStatus('Export fehlgeschlagen.')
      return
    }
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'maurice-vokabel-stand.json'
    link.click()
    URL.revokeObjectURL(url)
    setBackupStatus('Backup gespeichert.')
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImport = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const success = importProgressData(reader.result)
      setBackupStatus(success ? 'Backup geladen. Bitte Seite neu öffnen.' : 'Backup konnte nicht geladen werden.')
    }
    reader.readAsText(file)
  }

  const startSeasonMatch = () => {
    if (!nextFixture || !fixtureOpponent) return
    onStartMatch({
      mode: 'season',
      category,
      difficulty,
      opponent: fixtureOpponent,
      matchday: nextFixture.matchday
    })
  }

  const startTrainingMatch = () => {
    onStartMatch({ mode: 'training', category, difficulty })
  }

  return (
    <StadiumScene variant="default">
      <div className="st-scroll pt-safe">
        <div className="st-wrap">
          {/* Tribünen-Backdrop (rein dekorativ) */}
          <div className="st-backdrop" aria-hidden="true">
            <img
              src="/img/stadium-backdrop.webp"
              alt=""
              onError={(event) => { event.currentTarget.style.display = 'none' }}
            />
          </div>

          {/* Kopf: Titel + Settings */}
          <header className="st-head">
            <p className="st-head-kicker">MSV Duisburg Edition</p>
            <h1 className="st-title">Vokabel-Trainer</h1>

            <button
              onClick={() => setShowSettings(true)}
              className="st-settings"
              aria-label="Einstellungen"
            >
              <GearIcon />
            </button>

            {/* Daily Streak */}
            {dailyStreak > 0 && (
              <div className="st-streak">
                <FlameIcon />
                <span>
                  {dailyStreak === 1
                    ? 'Tages-Serie gestartet!'
                    : `${dailyStreak} Tage in Folge!`}
                </span>
              </div>
            )}
          </header>

          {/* Level/XP als Gold-Progressbar mit Wappen */}
          <section className="st-level" aria-label={`Level ${level}, ${xpPercent} Prozent geschafft`}>
            <span className="st-level-badge" aria-hidden="true">
              <ClubBadge short="MSV" size={40} />
            </span>
            <div className="st-level-main">
              <div className="st-level-row">
                <span className="st-level-num">Level {level}</span>
                <span className="st-level-title">{plainLevelTitle(level)}</span>
                <span className="st-level-next">{xpToNext} XP bis Lv. {level + 1}</span>
              </div>
              <span className="st-goldbar">
                <i style={{ width: `${xpPercent}%` }} />
              </span>
            </div>
          </section>

          {/* ANPFIFF: Saison-Hero mit nächstem Gegner */}
          <section className="st-panel st-hero">
            <div className="st-hero-top">
              <div>
                <p className="st-kicker">
                  Saison {season.seasonNumber} · Spieltag {Math.min(season.currentMatchday, MATCHDAYS)}/{MATCHDAYS}
                </p>
                <p className={`st-hero-rank ${getZoneStyle(seasonZone.zone).text}`}>
                  Platz {seasonRank} · <span className="st-hero-zone">{seasonZone.label}</span>
                </p>
              </div>
              <button onClick={() => setShowTable(true)} className="st-tablebtn">
                <TableIcon />
                Tabelle
              </button>
            </div>

            {nextFixture && fixtureOpponent && (
              <>
                <div className="st-vs">
                  <div className="st-vs-team">
                    <ClubBadge short="MSV" size={54} />
                    <span className="st-vs-code">MSV</span>
                  </div>
                  <div className="st-vs-mid">
                    <span className="st-vs-x">VS</span>
                    <span className="st-vs-tag">
                      {nextFixture.home ? 'Heimspiel' : 'Auswärts'}
                    </span>
                  </div>
                  <div className="st-vs-team">
                    <ClubBadge
                      short={fixtureOpponent.short}
                      hue={fixtureOpponent.badgeHue}
                      size={54}
                    />
                    <span className="st-vs-code">{fixtureOpponent.short}</span>
                  </div>
                </div>

                <p className="st-vs-note">
                  {nextFixture.home ? 'Heimspiel' : 'Auswärts'} gegen <b>{fixtureOpponent.name}</b>
                </p>

                {fixtureOpponent.isDerby ? (
                  <span className="st-derby">
                    <FlameIcon />
                    Derby! +30 XP Bonus
                  </span>
                ) : (
                  <p className="st-vs-sub">
                    Nächster Gegner am {nextFixture.matchday}. Spieltag
                  </p>
                )}

                <button onClick={startSeasonMatch} className="st-cta">
                  <BallIcon />
                  Anpfiff · Spieltag {nextFixture.matchday}
                </button>
              </>
            )}
          </section>

          {/* Training mit Filter-Pills */}
          <section className="st-panel">
            <div className="st-panel-head">
              <span className="st-panel-icon" aria-hidden="true">
                <TargetIcon />
              </span>
              <div>
                <p className="st-kicker">Training</p>
                <h2 className="st-panel-title">Was willst du üben?</h2>
              </div>
            </div>

            <p className="st-filter-label" id="st-filter-category">Kategorie</p>
            <div className="st-pills" role="group" aria-labelledby="st-filter-category">
              {CATEGORY_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => setCategory(option.value)}
                  className="st-pill"
                  aria-pressed={category === option.value}
                >
                  {category === option.value && <ActiveDot />}
                  {option.label}
                </button>
              ))}
            </div>

            <p className="st-filter-label" id="st-filter-difficulty">Schwierigkeit</p>
            <div className="st-pills" role="group" aria-labelledby="st-filter-difficulty">
              {DIFFICULTY_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => setDifficulty(option.value)}
                  className="st-pill"
                  aria-pressed={difficulty === option.value}
                >
                  {difficulty === option.value && <ActiveDot />}
                  {option.label}
                </button>
              ))}
            </div>

            {difficulty !== 'all' && exactPoolCount < 10 && (
              <p className="st-training-note" role="note">
                {exactPoolCount === 0
                  ? 'Auf dieser Stufe gibt es hier noch keine Wörter — du bekommst ähnliche aus der Kategorie.'
                  : `Nur ${exactPoolCount} ${exactPoolCount === 1 ? 'Wort' : 'Wörter'} auf dieser Stufe — der Rest kommt aus derselben Kategorie.`}
              </p>
            )}

            <button onClick={startTrainingMatch} className="st-cta st-cta--navy">
              <TargetIcon />
              Freies Training starten
            </button>
            <p className="st-training-note">Zählt nicht für die Tabelle — nur für dich.</p>
          </section>

          {/* Sammelalbum + Trophäen als Kacheln */}
          <div className="st-tiles">
            <button onClick={() => setShowAlbum(true)} className="st-tile">
              <span className="st-tile-head">
                <span className="st-tile-icon" aria-hidden="true">
                  <CardsIcon />
                </span>
                <span className="st-tile-kicker">Album</span>
              </span>
              <span className="st-tile-value">
                {ownedCount}<small>/{cardsData.length}</small>
              </span>
              <span className="st-goldbar st-goldbar--mini">
                <i style={{ width: `${albumPercent}%` }} />
              </span>
              <span className="st-tile-sub">Karten gesammelt</span>
            </button>

            <button onClick={() => setShowTrophyCase(true)} className="st-tile">
              <span className="st-tile-head">
                <span className="st-tile-icon" aria-hidden="true">
                  <TrophyIcon />
                </span>
                <span className="st-tile-kicker">Vitrine</span>
              </span>
              <span className="st-tile-value">{progress.achievements?.length || 0}</span>
              <span className="st-tile-sub">Trophäen geholt</span>
            </button>
          </div>

          {/* Liga-Aufstieg */}
          <section className="st-panel">
            <div className="st-league-head">
              <span className="st-panel-icon" aria-hidden="true">
                <TrophyIcon />
              </span>
              <div className="st-league-main">
                <p className="st-kicker">Aktuelle Liga</p>
                <h2 className="st-panel-title">{currentLeagueInfo.name}</h2>
              </div>
              <span className="st-league-goals">
                <b>{progress.totalGoalsScored || 0}</b>
                <small>Tore</small>
              </span>
            </div>
            {nextLeagueInfo ? (
              <>
                <span className="st-goldbar st-league-bar">
                  <i style={{ width: `${progressPercent}%` }} />
                </span>
                <p className="st-league-note">
                  Noch <b>{goalsNeeded} Tore</b> bis {nextLeagueInfo.name}
                </p>
              </>
            ) : (
              <p className="st-league-note st-league-note--max">
                Bundesliga erreicht — höchste Liga!
              </p>
            )}
          </section>

          {/* Statistik-Kacheln */}
          <div className="st-stats">
            <div className="st-stat">
              <div className="st-stat-top">
                <span className="st-stat-value">{stats.mastered}</span>
                <span className="st-stat-icon" aria-hidden="true"><CheckCircleIcon /></span>
              </div>
              <div className="st-stat-label">Gemeistert</div>
            </div>
            <div className="st-stat">
              <div className="st-stat-top">
                <span className="st-stat-value">{stats.learning}</span>
                <span className="st-stat-icon" aria-hidden="true"><LoopIcon /></span>
              </div>
              <div className="st-stat-label">Am Lernen</div>
            </div>
            <div className="st-stat">
              <div className="st-stat-top">
                <span className="st-stat-value">{stats.neverSeen}</span>
                <span className="st-stat-icon" aria-hidden="true"><BookIcon /></span>
              </div>
              <div className="st-stat-label">Noch nicht gelernt</div>
            </div>
            <div className="st-stat">
              <div className="st-stat-top">
                <span className="st-stat-value">{stats.overallAccuracy}%</span>
                <span className="st-stat-icon" aria-hidden="true"><TargetIcon /></span>
              </div>
              <div className="st-stat-label">Genauigkeit</div>
            </div>
          </div>

          {/* Kategorie-Statistik (bestehende Komponente) */}
          <div className="mt-4">
            <CategoryStats progress={progress} />
          </div>

          {/* Backup */}
          <section className="st-panel">
            <div className="st-panel-head">
              <span className="st-panel-icon" aria-hidden="true">
                <SaveIcon />
              </span>
              <div>
                <p className="st-kicker">Spielstand</p>
                <h2 className="st-panel-title">Backup</h2>
              </div>
            </div>
            <p className="st-backup-text">
              Fortschritt bleibt auf dem iPhone gespeichert. Für extra Sicherheit kannst du ein Backup sichern.
            </p>
            <div className="st-backup-row">
              <button onClick={handleExport} className="st-btn">
                <SaveIcon />
                Backup speichern
              </button>
              <button onClick={handleImportClick} className="st-btn">
                <LoadIcon />
                Backup laden
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImport}
            />
            {backupStatus && (
              <p className="st-backup-status" role="status">{backupStatus}</p>
            )}
          </section>

          {/* Letzte Spiele */}
          {progress.matchHistory && progress.matchHistory.length > 0 && (
            <section className="st-panel">
              <div className="st-panel-head">
                <span className="st-panel-icon" aria-hidden="true">
                  <TableIcon />
                </span>
                <div>
                  <p className="st-kicker">Rückblick</p>
                  <h2 className="st-panel-title">Letzte Spiele</h2>
                </div>
              </div>
              <ul className="st-matches">
                {progress.matchHistory.slice(0, 5).map((match, index) => {
                  const [msv, opp] = String(match.score).split(':').map(Number)
                  const result = msv > opp ? 'win' : msv < opp ? 'loss' : 'draw'
                  const meta = RESULT_META[result]
                  return (
                    <li key={index} className="st-match">
                      <span className={`st-res st-res--${result}`} aria-hidden="true">
                        <span>{meta.letter}</span>
                      </span>
                      <span className="sr-only">{meta.label}</span>
                      <div className="st-match-main">
                        <span className="st-match-opp">vs {match.opponent}</span>
                        <span className="st-match-date">
                          {new Date(match.date).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                      <span className="st-match-score">{match.score}</span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {/* Footer */}
          <footer className="st-footer">
            <p className="st-footer-brand">
              <BallIcon />
              Zebra Ultimate Team
            </p>
            <p className="st-footer-version">Version 3 · Für Maurice gebaut</p>
          </footer>
        </div>
      </div>

      {/* Trophy Case Modal */}
      {showTrophyCase && (
        <TrophyCase
          unlockedAchievementIds={progress.achievements || []}
          onClose={() => setShowTrophyCase(false)}
        />
      )}

      {showAlbum && (
        <CardAlbum
          progress={progress}
          onClose={() => setShowAlbum(false)}
        />
      )}

      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          onProgressReset={onProgressReset}
        />
      )}

      {showTable && (
        <SeasonTable season={season} onClose={() => setShowTable(false)} />
      )}

      {/* Season finished — show summary and start the next one */}
      {season.completed && (
        <SeasonSummary season={season} onNextSeason={handleNextSeason} />
      )}
    </StadiumScene>
  )
}

export default Stadium
