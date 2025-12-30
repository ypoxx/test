const STORAGE_KEY = 'maurice_vocab_trainer_progress'

// Initial default progress
const DEFAULT_PROGRESS = {
  userId: 'maurice',
  totalGoalsScored: 0,
  currentLeague: 'kreisliga', // kreisliga, regionalliga, zweite_liga, bundesliga
  vocabProgress: {},
  matchHistory: [],
  achievements: [], // Array of unlocked achievement IDs
  newAchievements: [], // Recently unlocked, shown in notification
  xp: 0, // Total XP earned
  level: 1, // Current level
  lastPlayedDate: null, // For daily streak tracking
  dailyStreak: 0, // Consecutive days played
  unlockedCards: [], // Array of unlocked card IDs
  unlockedFacts: []
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
      return {
        ...DEFAULT_PROGRESS,
        ...parsed
      }
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
  const { calculateLevel } = require('./xpSystem')
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
  const today = getUtcDateString(new Date())
  const lastPlayed = progress.lastPlayedDate

  let streakIncreased = false

  if (!lastPlayed) {
    // First time playing
    progress.dailyStreak = 1
    streakIncreased = true
  } else {
    const lastPlayedDate = parseStoredDate(lastPlayed)
    const yesterday = new Date()
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    const yesterdayUtc = getUtcDateString(yesterday)

    if (lastPlayedDate === today) {
      // Already played today, no change
      streakIncreased = false
    } else if (lastPlayedDate === yesterdayUtc) {
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

const getUtcDateString = (date) => date.toISOString().split('T')[0]

const parseStoredDate = (storedDate) => {
  if (typeof storedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(storedDate)) {
    return storedDate
  }

  const parsed = new Date(storedDate)
  if (!Number.isNaN(parsed.getTime())) {
    return getUtcDateString(parsed)
  }

  return null
}
