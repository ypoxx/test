/**
 * Season mode: 34 matchdays (home and away against every club),
 * a live league table, season goals and end-of-season rewards.
 *
 * Maurice plays MSV's game each matchday; the remaining 16 clubs are
 * paired up randomly and their results are simulated, so every team has
 * played exactly `currentMatchday` games and the table stays consistent.
 */
import { OPPONENTS } from './matchLogic'
import { loadProgress, saveProgress } from './localStorage'

export const MSV_NAME = 'MSV Duisburg'
export const MATCHDAYS = OPPONENTS.length * 2 // 34

const STRENGTH = { hard: 3, medium: 2, easy: 1 }

const shuffle = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const emptyTableRow = () => ({ played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, points: 0 })

/**
 * Create a fresh season: shuffled Hinrunde, mirrored Rückrunde.
 */
export const createSeason = (seasonNumber = 1) => {
  const order = shuffle(OPPONENTS.map(o => o.name))
  const hinrunde = order.map((name, i) => ({
    matchday: i + 1,
    opponent: name,
    home: i % 2 === 0,
    played: false,
    result: null
  }))
  const rueckrunde = order.map((name, i) => ({
    matchday: OPPONENTS.length + i + 1,
    opponent: name,
    home: i % 2 !== 0,
    played: false,
    result: null
  }))

  const table = { [MSV_NAME]: emptyTableRow() }
  OPPONENTS.forEach(o => { table[o.name] = emptyTableRow() })

  return {
    seasonNumber,
    schedule: [...hinrunde, ...rueckrunde],
    table,
    currentMatchday: 1,
    completed: null // set at season end: { rank, points, ... }
  }
}

/**
 * Load (and lazily initialize) the season from stored progress.
 */
export const loadSeason = () => {
  const progress = loadProgress()
  if (!progress.season || !Array.isArray(progress.season.schedule)) {
    progress.season = createSeason(1)
    saveProgress(progress)
  }
  return progress.season
}

export const getNextFixture = (season) => {
  if (!season || season.completed) return null
  return season.schedule.find(f => !f.played) || null
}

const applyResult = (table, teamA, teamB, goalsA, goalsB) => {
  const a = table[teamA]
  const b = table[teamB]
  if (!a || !b) return
  a.played += 1
  b.played += 1
  a.gf += goalsA
  a.ga += goalsB
  b.gf += goalsB
  b.ga += goalsA
  if (goalsA > goalsB) {
    a.wins += 1
    a.points += 3
    b.losses += 1
  } else if (goalsA < goalsB) {
    b.wins += 1
    b.points += 3
    a.losses += 1
  } else {
    a.draws += 1
    b.draws += 1
    a.points += 1
    b.points += 1
  }
}

const simulateGoals = (difficulty) => {
  const strength = STRENGTH[difficulty] || 2
  // easy: 0-2, medium: 0-3, hard: 0-4 goals
  return Math.floor(Math.random() * (2 + strength))
}

/**
 * Record Maurice's matchday result, simulate the rest of the matchday,
 * advance the season. Returns the updated season plus rank info.
 */
export const recordSeasonResult = ({ msvGoals, opponentGoals }) => {
  const progress = loadProgress()
  if (!progress.season || !Array.isArray(progress.season.schedule)) {
    progress.season = createSeason(1)
  }
  const season = progress.season
  const fixture = getNextFixture(season)
  if (!fixture) {
    return { season, rank: getRank(season), finished: Boolean(season.completed) }
  }

  fixture.played = true
  fixture.result = { msvGoals, opponentGoals }
  applyResult(season.table, MSV_NAME, fixture.opponent, msvGoals, opponentGoals)

  // Simulate the other 8 games of this matchday among the remaining clubs
  const others = shuffle(OPPONENTS.filter(o => o.name !== fixture.opponent))
  for (let i = 0; i + 1 < others.length; i += 2) {
    const teamA = others[i]
    const teamB = others[i + 1]
    applyResult(season.table, teamA.name, teamB.name, simulateGoals(teamA.difficulty), simulateGoals(teamB.difficulty))
  }

  season.currentMatchday = fixture.matchday + 1

  let finished = false
  if (fixture.matchday >= MATCHDAYS) {
    finished = true
    const rank = getRank(season)
    const msvRow = season.table[MSV_NAME]
    season.completed = {
      rank,
      points: msvRow.points,
      wins: msvRow.wins,
      draws: msvRow.draws,
      losses: msvRow.losses,
      gf: msvRow.gf,
      ga: msvRow.ga
    }
    // Bank the season immediately so season achievements can unlock
    // in the same post-match check.
    progress.seasonHistory = progress.seasonHistory || []
    progress.seasonHistory.push({
      seasonNumber: season.seasonNumber,
      ...season.completed
    })
  }

  saveProgress(progress)
  return { season, rank: getRank(season), matchday: fixture.matchday, finished }
}

/**
 * Sorted standings: points, goal difference, goals scored.
 */
export const getStandings = (season) => {
  return Object.entries(season.table)
    .map(([name, row]) => ({
      name,
      ...row,
      diff: row.gf - row.ga,
      logo: name === MSV_NAME ? '🔵⚪' : (OPPONENTS.find(o => o.name === name)?.logo || '⚽'),
      isMSV: name === MSV_NAME
    }))
    .sort((a, b) => b.points - a.points || b.diff - a.diff || b.gf - a.gf || a.name.localeCompare(b.name))
    .map((row, index) => ({ ...row, rank: index + 1 }))
}

export const getRank = (season) => {
  const standings = getStandings(season)
  return standings.find(row => row.isMSV)?.rank || 18
}

/**
 * Season goal zone for a rank (Bundesliga-style zones).
 *
 * Returns ONLY semantic data — no CSS classes, no emojis. The UI mapping
 * (colors etc.) lives in src/components/zoneStyles.js.
 *
 * @param {number} rank - Final/current league rank (1-18)
 * @returns {{ zone: 'champions'|'promotion'|'europa'|'midtable'|'relegation', label: string }}
 */
export const getRankZone = (rank) => {
  if (rank === 1) return { zone: 'champions', label: 'Meisterschaft' }
  if (rank <= 4) return { zone: 'promotion', label: 'Champions League' }
  if (rank <= 7) return { zone: 'europa', label: 'Europa League' }
  if (rank <= 15) return { zone: 'midtable', label: 'Gesicherter Platz' }
  return { zone: 'relegation', label: 'Abstiegszone' }
}

/**
 * End-of-season reward, scaled by final rank.
 */
export const getSeasonReward = (rank) => {
  if (rank === 1) return { xp: 500, title: '🏆 DEUTSCHER MEISTER!', message: 'Unglaublich! Der MSV holt die Schale!' }
  if (rank <= 4) return { xp: 300, title: '⭐ Champions League!', message: 'Was für eine Saison — Europa ruft!' }
  if (rank <= 7) return { xp: 200, title: '🌍 Europa League!', message: 'Starke Saison, international dabei!' }
  if (rank <= 15) return { xp: 100, title: '✅ Klassenerhalt!', message: 'Solide Saison — nächstes Jahr greifen wir an!' }
  return { xp: 50, title: '💪 Neustart!', message: 'Harte Saison. Aber Zebras geben niemals auf!' }
}

/**
 * Start the next season (the finished one was already banked into
 * seasonHistory by recordSeasonResult). Returns the new season.
 */
export const startNextSeason = () => {
  const progress = loadProgress()
  const nextNumber = (progress.season?.seasonNumber || 0) + 1
  progress.season = createSeason(nextNumber)
  saveProgress(progress)
  return progress.season
}
