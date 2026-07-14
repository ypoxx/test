import { calculateLevel } from './xpSystem'
import { getNextIntervalDays } from './spacedRepetition'

const STORAGE_KEY = 'maurice_vocab_trainer_progress'
const LAST_OPPONENT_KEY = 'maurice_vocab_trainer_last_opponent'
const SOUND_PREF_KEY = 'maurice_vocab_trainer_sound'

const DAY_MS = 24 * 60 * 60 * 1000

// Initial default progress
const DEFAULT_PROGRESS = {
  userId: 'maurice',
  totalGoalsScored: 0,
  currentLeague: 'kreisliga', // kreisliga, regionalliga, zweite_liga, bundesliga
  vocabProgress: {},
  matchHistory: [],
  totalMatchesPlayed: 0, // Lifetime counter (matchHistory is capped at 20 entries)
  achievements: [], // Array of unlocked achievement IDs
  newAchievements: [], // Recently unlocked, shown in notification
  xp: 0, // Total XP earned
  level: 1, // Current level
  lastPlayedDate: null, // For daily streak tracking
  dailyStreak: 0, // Consecutive days played
  unlockedCards: [], // Array of unlocked card IDs
  unlockedFacts: [],
  season: null, // Current season state (created lazily by utils/season.js)
  seasonHistory: [] // Completed seasons: { seasonNumber, rank, points, ... }
}

/**
 * Save progress to localStorage
 * @param {Object} progressData - The progress data to save
 */
export const saveProgress = (progressData) => {
  try {
    const dataToSave = {
      ...progressData,
      lastSaved: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    return true
  } catch (error) {
    console.error('Error saving progress:', error)
    return false
  }
}

export const exportProgressData = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      return savedData
    }
    const fallback = JSON.stringify({
      ...DEFAULT_PROGRESS,
      lastSaved: new Date().toISOString()
    })
    return fallback
  } catch (error) {
    console.error('Error exporting progress:', error)
    return null
  }
}

export const importProgressData = (progressData) => {
  try {
    const data = typeof progressData === 'string' ? JSON.parse(progressData) : progressData
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return false
    }
    if (!data.vocabProgress || typeof data.vocabProgress !== 'object' || Array.isArray(data.vocabProgress)) {
      return false
    }

    // Only accept known fields with the expected shape, so a corrupt or
    // foreign JSON file cannot break the app on the next load.
    const asNumber = (value, fallback) => (typeof value === 'number' && Number.isFinite(value) ? value : fallback)
    const asArray = (value) => (Array.isArray(value) ? value : [])

    const merged = {
      ...DEFAULT_PROGRESS,
      vocabProgress: data.vocabProgress,
      matchHistory: asArray(data.matchHistory).slice(0, 20),
      totalGoalsScored: asNumber(data.totalGoalsScored, 0),
      totalMatchesPlayed: Math.max(asNumber(data.totalMatchesPlayed, 0), asArray(data.matchHistory).length),
      currentLeague: typeof data.currentLeague === 'string' ? data.currentLeague : 'kreisliga',
      achievements: asArray(data.achievements),
      newAchievements: [],
      xp: asNumber(data.xp, 0),
      level: asNumber(data.level, 1),
      lastPlayedDate: typeof data.lastPlayedDate === 'string' ? data.lastPlayedDate : null,
      dailyStreak: asNumber(data.dailyStreak, 0),
      unlockedCards: asArray(data.unlockedCards),
      unlockedFacts: asArray(data.unlockedFacts),
      lastSaved: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    return true
  } catch (error) {
    console.error('Error importing progress:', error)
    return false
  }
}

/**
 * Load progress from localStorage
 * @returns {Object} - The loaded progress or default progress if none exists
 */
export const loadProgress = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)

    if (savedData) {
      const parsed = JSON.parse(savedData)

      // Ensure all required fields exist
      const merged = {
        ...DEFAULT_PROGRESS,
        ...parsed
      }

      // Migration: older saves had no lifetime match counter. matchHistory is
      // capped at 20, so seed the counter with whatever we still know about.
      merged.totalMatchesPlayed = Math.max(
        merged.totalMatchesPlayed || 0,
        Array.isArray(merged.matchHistory) ? merged.matchHistory.length : 0
      )

      return merged
    }

    // No saved data - return and save default progress
    saveProgress(DEFAULT_PROGRESS)
    return DEFAULT_PROGRESS
  } catch (error) {
    console.error('Error loading progress:', error)
    return DEFAULT_PROGRESS
  }
}

/**
 * Reset progress to default
 * @returns {Object} - The default progress
 */
export const resetProgress = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LAST_OPPONENT_KEY)
    saveProgress(DEFAULT_PROGRESS)
    return DEFAULT_PROGRESS
  } catch (error) {
    console.error('Error resetting progress:', error)
    return DEFAULT_PROGRESS
  }
}

/**
 * Update vocab progress for a specific vocabulary
 * @param {string} vocabId - The ID of the vocabulary
 * @param {boolean} wasCorrect - Whether the answer was correct
 */
export const updateVocabProgress = (vocabId, wasCorrect) => {
  const progress = loadProgress()

  if (!progress.vocabProgress[vocabId]) {
    progress.vocabProgress[vocabId] = {
      correct: 0,
      incorrect: 0,
      lastReviewed: null,
      mastered: false
    }
  }

  const vocabProgress = progress.vocabProgress[vocabId]

  if (wasCorrect) {
    vocabProgress.correct += 1
  } else {
    vocabProgress.incorrect += 1
  }

  vocabProgress.lastReviewed = new Date().toISOString()

  // Spaced repetition: wrong answers become due immediately,
  // correct answers push the next review further into the future.
  const nextInterval = getNextIntervalDays(vocabProgress.interval, wasCorrect)
  vocabProgress.interval = nextInterval
  vocabProgress.dueDate = new Date(Date.now() + nextInterval * DAY_MS).toISOString()

  // Mark as mastered if correct 5+ times and accuracy > 80%
  const total = vocabProgress.correct + vocabProgress.incorrect
  const accuracy = vocabProgress.correct / total
  vocabProgress.mastered = vocabProgress.correct >= 5 && accuracy > 0.8

  saveProgress(progress)
  return progress
}

/**
 * Add a match to history
 * @param {Object} matchData - The match data to add
 */
export const addMatchToHistory = (matchData) => {
  const progress = loadProgress()

  const match = {
    date: new Date().toISOString(),
    ...matchData
  }

  progress.matchHistory.unshift(match) // Add to beginning

  // Keep only last 20 matches
  if (progress.matchHistory.length > 20) {
    progress.matchHistory = progress.matchHistory.slice(0, 20)
  }

  // Lifetime counter — matchHistory alone cannot track "25/50 matches played"
  // achievements because of the 20-entry cap above.
  progress.totalMatchesPlayed = (progress.totalMatchesPlayed || 0) + 1

  saveProgress(progress)
  return progress
}

/**
 * Update total goals and league
 * @param {number} goalsToAdd - Number of goals to add
 */
export const updateGoalsAndLeague = (goalsToAdd) => {
  const progress = loadProgress()

  progress.totalGoalsScored += goalsToAdd

  // Update league based on total goals
  if (progress.totalGoalsScored >= 1000) {
    progress.currentLeague = 'bundesliga'
  } else if (progress.totalGoalsScored >= 500) {
    progress.currentLeague = 'zweite_liga'
  } else if (progress.totalGoalsScored >= 200) {
    progress.currentLeague = 'regionalliga'
  } else {
    progress.currentLeague = 'kreisliga'
  }

  saveProgress(progress)
  return progress
}

/**
 * Get league thresholds
 */
export const LEAGUE_THRESHOLDS = {
  kreisliga: { min: 0, max: 199, name: 'Kreisliga', emoji: '⚽', color: '#8B4513' },
  regionalliga: { min: 200, max: 499, name: 'Regionalliga West', emoji: '🏆', color: '#C0C0C0' },
  zweite_liga: { min: 500, max: 999, name: '2. Bundesliga', emoji: '🥈', color: '#FFD700' },
  bundesliga: { min: 1000, max: Infinity, name: 'Bundesliga', emoji: '👑', color: '#FFD700' }
}

/**
 * Get progress to next league
 * @param {number} currentGoals - Current total goals
 * @returns {Object} - Progress info
 */
export const getLeagueProgress = (currentGoals) => {
  let currentLeague = 'kreisliga'
  let nextLeague = 'regionalliga'
  let goalsNeeded = 200 - currentGoals

  if (currentGoals >= 1000) {
    currentLeague = 'bundesliga'
    nextLeague = null
    goalsNeeded = 0
  } else if (currentGoals >= 500) {
    currentLeague = 'zweite_liga'
    nextLeague = 'bundesliga'
    goalsNeeded = 1000 - currentGoals
  } else if (currentGoals >= 200) {
    currentLeague = 'regionalliga'
    nextLeague = 'zweite_liga'
    goalsNeeded = 500 - currentGoals
  }

  const currentLeagueInfo = LEAGUE_THRESHOLDS[currentLeague]
  const progress = currentLeagueInfo.max === Infinity
    ? 100
    : ((currentGoals - currentLeagueInfo.min) / (currentLeagueInfo.max - currentLeagueInfo.min + 1)) * 100

  return {
    currentLeague,
    currentLeagueInfo,
    nextLeague,
    nextLeagueInfo: nextLeague ? LEAGUE_THRESHOLDS[nextLeague] : null,
    goalsNeeded,
    progressPercent: Math.min(progress, 100)
  }
}

/**
 * Unlock achievement
 * @param {string} achievementId - ID of the achievement to unlock
 */
export const unlockAchievement = (achievementId) => {
  const progress = loadProgress()

  if (!progress.achievements.includes(achievementId)) {
    progress.achievements.push(achievementId)
    progress.newAchievements.push(achievementId)
    saveProgress(progress)
  }

  return progress
}

/**
 * Unlock a collectible card
 * @param {string} cardId - ID of the card to unlock
 */
export const unlockCard = (cardId) => {
  const progress = loadProgress()
  if (!progress.unlockedCards.includes(cardId)) {
    progress.unlockedCards.push(cardId)
    saveProgress(progress)
  }
  return progress
}

/**
 * Unlock a football fact
 * @param {string} factId - ID of the fact to unlock
 */
export const unlockFact = (factId) => {
  const progress = loadProgress()
  if (!progress.unlockedFacts.includes(factId)) {
    progress.unlockedFacts.push(factId)
    saveProgress(progress)
  }
  return progress
}

/**
 * Clear new achievements notifications
 */
export const clearNewAchievements = () => {
  const progress = loadProgress()
  progress.newAchievements = []
  saveProgress(progress)
  return progress
}

/**
 * Add XP and update level
 * @param {number} xpToAdd - Amount of XP to add
 * @returns {Object} - { leveledUp: boolean, oldLevel: number, newLevel: number, progress: Object }
 */
export const addXP = (xpToAdd) => {
  const progress = loadProgress()

  const oldLevel = progress.level || 1
  const oldXP = progress.xp || 0

  progress.xp = oldXP + xpToAdd

  // Calculate new level based on total XP
  const newLevel = calculateLevel(progress.xp)

  const leveledUp = newLevel > oldLevel
  progress.level = newLevel

  saveProgress(progress)

  return {
    leveledUp,
    oldLevel,
    newLevel,
    xpGained: xpToAdd,
    totalXP: progress.xp,
    progress
  }
}

/**
 * Update daily streak
 * @returns {Object} - { streakIncreased: boolean, currentStreak: number }
 */
export const updateDailyStreak = () => {
  const progress = loadProgress()
  // Local calendar day — a UTC day boundary would break the streak for a
  // German user playing shortly after midnight.
  const today = getLocalDateString(new Date())
  const lastPlayed = progress.lastPlayedDate

  let streakIncreased = false

  if (!lastPlayed) {
    // First time playing
    progress.dailyStreak = 1
    streakIncreased = true
  } else {
    const lastPlayedDate = parseStoredDate(lastPlayed)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayLocal = getLocalDateString(yesterday)

    if (lastPlayedDate === today) {
      // Already played today, no change
      streakIncreased = false
    } else if (lastPlayedDate === yesterdayLocal) {
      // Played yesterday, increase streak
      progress.dailyStreak = (progress.dailyStreak || 0) + 1
      streakIncreased = true
    } else {
      // Streak broken, reset to 1
      progress.dailyStreak = 1
      streakIncreased = false
    }
  }

  progress.lastPlayedDate = today
  saveProgress(progress)

  return {
    streakIncreased,
    currentStreak: progress.dailyStreak,
    progress
  }
}

/**
 * Sound preference — stored separately from progress so the
 * "Sound aktivieren?" dialog only has to be answered once.
 * @returns {boolean|null} - true/false once chosen, null if never asked
 */
export const loadSoundPreference = () => {
  try {
    const value = localStorage.getItem(SOUND_PREF_KEY)
    if (value === null) return null
    return value === 'on'
  } catch (error) {
    return null
  }
}

export const saveSoundPreference = (enabled) => {
  try {
    localStorage.setItem(SOUND_PREF_KEY, enabled ? 'on' : 'off')
  } catch (error) {
    console.error('Error saving sound preference:', error)
  }
}

export const loadLastOpponentName = () => {
  try {
    return localStorage.getItem(LAST_OPPONENT_KEY)
  } catch (error) {
    console.error('Error loading last opponent:', error)
    return null
  }
}

export const saveLastOpponentName = (opponentName) => {
  try {
    if (!opponentName) return null
    localStorage.setItem(LAST_OPPONENT_KEY, opponentName)
    return opponentName
  } catch (error) {
    console.error('Error saving last opponent:', error)
    return null
  }
}

const getLocalDateString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseStoredDate = (storedDate) => {
  if (typeof storedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(storedDate)) {
    return storedDate
  }

  const parsed = new Date(storedDate)
  if (!Number.isNaN(parsed.getTime())) {
    return getLocalDateString(parsed)
  }

  return null
}
