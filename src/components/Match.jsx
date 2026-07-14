import { useState, useEffect } from 'react'
import VocabCard from './VocabCard'
import ScoreDisplay from './ScoreDisplay'
import AchievementUnlocked from './AchievementUnlocked'
import ConfettiExplosion from './ConfettiExplosion'
import LevelUpNotification from './LevelUpNotification'
import MatchCountdown from './MatchCountdown'
import vocabsData from '../data/vocabs.json'
import { selectVocabsForMatch, filterByCategory, filterByDifficulty } from '../utils/spacedRepetition'
import { selectRandomOpponent, getDerbyOpponents, calculateMatchResult, getMatchSummaryMessage, ANSWER_DELAY_CORRECT, ANSWER_DELAY_WRONG } from '../utils/matchLogic'
import { updateVocabProgress, updateGoalsAndLeague, addMatchToHistory, loadProgress, unlockAchievement, addXP, updateDailyStreak, loadLastOpponentName, saveLastOpponentName } from '../utils/localStorage'
import { generateMultipleChoiceOptions } from '../utils/multipleChoice'
import { calculateStreakBonus, getStreakMessage, getStreakEmoji, getStreakColor, triggerHapticFeedback } from '../utils/gameEffects'
import { checkNewAchievements } from '../utils/achievements'
import { calculateXPReward } from '../utils/xpSystem'
import CardReveal from './CardReveal'
import { rollCardReward } from '../utils/cardRewards'
import { recordSeasonResult, getRankZone, MATCHDAYS } from '../utils/season'
import soundManager from '../utils/sounds'
import ShareCard from './ShareCard'

const EXTRA_TIME_XP = 5

// Ask German→English (active recall) for words Maurice has seen before
const DE_EN_SHARE = 0.4

const prepareVocab = (vocab, progressData) => {
  const seenBefore = Boolean(progressData?.vocabProgress?.[vocab.id])
  const direction = seenBefore && Math.random() < DE_EN_SHARE ? 'de-en' : 'en-de'
  return {
    ...vocab,
    direction,
    options: generateMultipleChoiceOptions(vocab, vocabsData, direction)
  }
}

function Match({ progress, onMatchEnd, filters, mode = 'training', seasonOpponent = null, seasonMatchday = null }) {
  const isSeasonMatch = mode === 'season' && Boolean(seasonOpponent)
  // Season: derby fixtures pay a bonus. Training: 20% surprise derby.
  const [specialMatch] = useState(() =>
    isSeasonMatch ? Boolean(seasonOpponent.isDerby) : Math.random() < 0.2
  )
  const [opponent] = useState(() => {
    if (isSeasonMatch) {
      return seasonOpponent
    }
    const lastOpponent = loadLastOpponentName()
    const derbyPool = getDerbyOpponents()
    const nextOpponent = specialMatch && derbyPool.length > 0
      ? selectRandomOpponent(lastOpponent, opponent => opponent.isDerby)
      : selectRandomOpponent(lastOpponent)
    saveLastOpponentName(nextOpponent.name)
    return nextOpponent
  })
  const [vocabs, setVocabs] = useState([])
  const [currentVocabIndex, setCurrentVocabIndex] = useState(0)
  const [msvGoals, setMsvGoals] = useState(0)
  const [opponentGoals, setOpponentGoals] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [wasDownThree, setWasDownThree] = useState(false)
  const [matchFinished, setMatchFinished] = useState(false)
  const [matchResult, setMatchResult] = useState(null)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [streakMessage, setStreakMessage] = useState(null)
  const [newAchievements, setNewAchievements] = useState([])
  const [showAchievementIndex, setShowAchievementIndex] = useState(0)
  const [showingAchievement, setShowingAchievement] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [xpGained, setXPGained] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [leveledUpTo, setLeveledUpTo] = useState(null)
  const [postMatchLevel, setPostMatchLevel] = useState(null)
  const [showCountdown, setShowCountdown] = useState(true)
  const [matchFeedback, setMatchFeedback] = useState(null)
  const [goalAnimationKey, setGoalAnimationKey] = useState(0)
  const [crowdAnimationKey, setCrowdAnimationKey] = useState(0)
  const [cardReward, setCardReward] = useState(null)
  const [showCardReveal, setShowCardReveal] = useState(false)

  // "Nachspielzeit": wrong answers get replayed at the end of the match
  const [phase, setPhase] = useState('regular') // 'regular' | 'extraTime'
  const [missedVocabs, setMissedVocabs] = useState([])
  const [extraVocabs, setExtraVocabs] = useState([])
  const [extraIndex, setExtraIndex] = useState(0)
  const [extraCorrectCount, setExtraCorrectCount] = useState(0)

  useEffect(() => {
    // Initialize sound system on component mount
    soundManager.init()

    // Optional training filters from the stadium screen
    let pool = vocabsData
    if (filters?.category && filters.category !== 'all') {
      pool = filterByCategory(pool, [filters.category])
    }
    if (filters?.difficulty && filters.difficulty !== 'all') {
      pool = filterByDifficulty(pool, [filters.difficulty])
    }
    if (pool.length === 0) {
      pool = vocabsData
    }

    // Select vocabs for this match using spaced repetition
    const selectedVocabs = selectVocabsForMatch(pool, progress, 10)

    setVocabs(selectedVocabs.map(vocab => prepareVocab(vocab, progress)))
  }, [progress, filters])

  const handleAnswer = (userAnswer) => {
    if (phase === 'extraTime') {
      return handleExtraTimeAnswer(userAnswer)
    }

    const currentVocab = vocabs[currentVocabIndex]
    const correctTarget = currentVocab.direction === 'de-en' ? currentVocab.english : currentVocab.german
    const isCorrect = userAnswer === correctTarget

    // Update vocab progress
    updateVocabProgress(currentVocab.id, isCorrect)

    let nextStreak = streak
    let nextMsvGoals = msvGoals
    let nextOpponentGoals = opponentGoals
    let nextCorrectAnswers = correctAnswers
    let nextWasDownThree = wasDownThree
    let nextXPGained = xpGained
    let nextMissedVocabs = missedVocabs
    let streakBonus = 0

    // Update streak
    if (isCorrect) {
      nextStreak = streak + 1
      setStreak(nextStreak)
      setMaxStreak(prev => Math.max(prev, nextStreak))
      setMatchFeedback('success')
      setGoalAnimationKey(prev => prev + 1)
      setCrowdAnimationKey(prev => prev + 1)

      // Trigger haptic feedback for correct answer
      triggerHapticFeedback('success')

      // Play goal sound! ⚽
      soundManager.playGoal()

      // Calculate and add XP
      const xpReward = calculateXPReward(nextStreak, currentVocab.difficulty)
      nextXPGained += xpReward
      setXPGained(nextXPGained)

      // Check for streak bonus
      streakBonus = calculateStreakBonus(nextStreak)
      const message = getStreakMessage(nextStreak)

      if (message) {
        setStreakMessage(message)
        if (streakBonus > 0) {
          triggerHapticFeedback('streak')
          // Play streak sound with level
          soundManager.playStreak(nextStreak >= 5 ? 2 : 1)
        }
      }

      // Update score (including streak bonus)
      nextMsvGoals += 1 + streakBonus
      nextCorrectAnswers += 1
      setMsvGoals(nextMsvGoals)
      setCorrectAnswers(nextCorrectAnswers)
    } else {
      nextStreak = 0
      setStreak(0)
      setStreakMessage(null)
      nextOpponentGoals += 1
      setOpponentGoals(nextOpponentGoals)
      if (nextMsvGoals === 0 && nextOpponentGoals >= 3) {
        nextWasDownThree = true
        setWasDownThree(true)
      }

      nextMissedVocabs = [...missedVocabs, currentVocab]
      setMissedVocabs(nextMissedVocabs)

      // Trigger haptic feedback for wrong answer
      triggerHapticFeedback('error')

      // Play wrong answer sound
      soundManager.playWrong()
    }

    const advanceDelay = isCorrect ? ANSWER_DELAY_CORRECT : ANSWER_DELAY_WRONG

    // Move to next vocab after a delay
    setTimeout(() => {
      if (currentVocabIndex < vocabs.length - 1) {
        setCurrentVocabIndex(prev => prev + 1)
      } else if (nextMissedVocabs.length > 0) {
        startExtraTime(nextMissedVocabs)
      } else {
        // Match finished
        finishMatch({
          finalMsvGoals: nextMsvGoals,
          finalCorrectAnswers: nextCorrectAnswers,
          finalOpponentGoals: nextOpponentGoals,
          finalWasDownThree: nextWasDownThree,
          finalXpGained: nextXPGained,
          finalMissedVocabs: nextMissedVocabs
        })
      }
    }, advanceDelay)

    setTimeout(() => {
      setMatchFeedback(null)
    }, 700)

    return isCorrect
  }

  const startExtraTime = (missed) => {
    // Re-ask every missed word once — fresh options, same direction
    setExtraVocabs(missed.map(vocab => ({
      ...vocab,
      options: generateMultipleChoiceOptions(vocab, vocabsData, vocab.direction)
    })))
    setExtraIndex(0)
    setPhase('extraTime')
    setStreakMessage(null)
  }

  const handleExtraTimeAnswer = (userAnswer) => {
    const currentVocab = extraVocabs[extraIndex]
    const correctTarget = currentVocab.direction === 'de-en' ? currentVocab.english : currentVocab.german
    const isCorrect = userAnswer === correctTarget

    // Extra time counts for learning progress, but not for the score
    updateVocabProgress(currentVocab.id, isCorrect)

    let nextXPGained = xpGained
    let nextExtraCorrect = extraCorrectCount

    if (isCorrect) {
      setMatchFeedback('success')
      setGoalAnimationKey(prev => prev + 1)
      setCrowdAnimationKey(prev => prev + 1)
      triggerHapticFeedback('success')
      soundManager.playGoal()
      nextXPGained += EXTRA_TIME_XP
      nextExtraCorrect += 1
      setXPGained(nextXPGained)
      setExtraCorrectCount(nextExtraCorrect)
    } else {
      triggerHapticFeedback('error')
      soundManager.playWrong()
    }

    const advanceDelay = isCorrect ? ANSWER_DELAY_CORRECT : ANSWER_DELAY_WRONG

    setTimeout(() => {
      if (extraIndex < extraVocabs.length - 1) {
        setExtraIndex(prev => prev + 1)
      } else {
        finishMatch({
          finalXpGained: nextXPGained,
          finalExtraCorrect: nextExtraCorrect
        })
      }
    }, advanceDelay)

    setTimeout(() => {
      setMatchFeedback(null)
    }, 700)

    return isCorrect
  }

  const finishMatch = ({
    finalMsvGoals = msvGoals,
    finalCorrectAnswers = correctAnswers,
    finalOpponentGoals = opponentGoals,
    finalWasDownThree = wasDownThree,
    finalXpGained = xpGained,
    finalMissedVocabs = missedVocabs,
    finalExtraCorrect = extraCorrectCount
  } = {}) => {
    const result = calculateMatchResult(finalMsvGoals, finalCorrectAnswers, vocabs.length)
    const bonusXp = specialMatch ? 30 : 0
    const totalXpGained = finalXpGained + bonusXp

    // Save old progress for achievement comparison
    const oldProgress = loadProgress()

    // Update progress
    updateGoalsAndLeague(finalMsvGoals)
    addMatchToHistory({
      opponent: opponent.name,
      score: result.score,
      vocabsReviewed: vocabs.length,
      goalsScored: finalMsvGoals,
      comebackWin: finalWasDownThree && result.status === 'win'
    })

    // Season: record the matchday, simulate the rest of the league
    let seasonInfo = null
    if (isSeasonMatch) {
      const update = recordSeasonResult({
        msvGoals: finalMsvGoals,
        opponentGoals: finalOpponentGoals
      })
      seasonInfo = {
        matchday: update.matchday,
        rank: update.rank,
        finished: update.finished
      }
    }

    // Add XP and check for level up
    setXPGained(totalXpGained)
    const xpResult = addXP(totalXpGained)
    setPostMatchLevel(xpResult.newLevel)
    if (xpResult.leveledUp) {
      setLeveledUpTo(xpResult.newLevel)
      setShowLevelUp(true)
    }

    // Update daily streak
    updateDailyStreak()

    // One card pack per rewarded match (win or strong streak)
    const reward = rollCardReward({ resultStatus: result.status, streak: maxStreak })
    setCardReward(reward)

    // Check for new achievements (after all progress updates)
    const newProgress = loadProgress()
    const unlockedAchievements = checkNewAchievements(oldProgress, newProgress)
    unlockedAchievements.forEach(achievement => {
      unlockAchievement(achievement.id)
    })
    setNewAchievements(unlockedAchievements)

    // Trigger victory haptic feedback and sounds
    if (result.status === 'win') {
      triggerHapticFeedback('victory')
      soundManager.playVictory()
      soundManager.playCrowd()
      setShowConfetti(true)
    } else if (result.status === 'lose') {
      soundManager.playDefeat()
    }

    setMatchResult({ ...result, extraCorrect: finalExtraCorrect, missedVocabs: finalMissedVocabs, seasonInfo })
    setMatchFinished(true)
  }

  const handleContinue = () => {
    if (newAchievements.length > 0 && showAchievementIndex < newAchievements.length) {
      setShowingAchievement(true)
    } else if (cardReward && !showCardReveal) {
      setShowCardReveal(true)
    } else {
      onMatchEnd(matchResult)
    }
  }

  const handleAchievementClose = () => {
    const nextIndex = showAchievementIndex + 1
    setShowAchievementIndex(nextIndex)
    if (nextIndex >= newAchievements.length) {
      // All achievements shown — back to the result screen
      setShowingAchievement(false)
    }
  }

  const continueLabel = () => {
    if (newAchievements.length > 0 && showAchievementIndex < newAchievements.length) {
      return '🏆 Trophäe ansehen'
    }
    if (cardReward && !showCardReveal) {
      return '🎁 Kartenpack öffnen'
    }
    return 'Zurück zum Stadion'
  }

  // Show countdown before match starts
  if (showCountdown && vocabs.length > 0) {
    return (
      <MatchCountdown
        opponent={opponent}
        onComplete={() => setShowCountdown(false)}
      />
    )
  }

  if (vocabs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-white">Vokabeln werden geladen...</div>
      </div>
    )
  }

  if (matchFinished && matchResult) {
    const summary = getMatchSummaryMessage(matchResult, opponent)
    const shareSummary = {
      title: summary.title,
      message: summary.message,
      accuracy: matchResult.accuracy,
      score: matchResult.score
    }
    const missed = matchResult.missedVocabs || []

    if (showCardReveal && cardReward) {
      return (
        <CardReveal
          card={cardReward.card}
          isNew={cardReward.isNew}
          fact={cardReward.fact}
          onClose={() => onMatchEnd(matchResult)}
        />
      )
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-safe stadium-scene field-pattern relative overflow-hidden">
        {/* Floodlights */}
        <div className="floodlight top-10 left-10" />
        <div className="floodlight top-10 right-10" />

        <div className="w-full max-w-2xl relative z-10">
          {/* Result Card */}
          <div className="card p-8 text-center mb-6">
            <div className="text-6xl mb-4">{summary.emoji}</div>
            <h2 className="text-3xl font-bold mb-2">{summary.title}</h2>
            <p className="text-xl mb-6">{summary.message}</p>

            {/* Season standing after this matchday */}
            {matchResult.seasonInfo && (
              <div className="bg-white/10 rounded-lg p-3 mb-6 flex items-center justify-center gap-3 text-sm">
                <span className="text-white/70">
                  Spieltag {matchResult.seasonInfo.matchday}/{MATCHDAYS}
                </span>
                <span className="font-bold">
                  {getRankZone(matchResult.seasonInfo.rank).emoji} Platz {matchResult.seasonInfo.rank}
                </span>
                <span className={`${getRankZone(matchResult.seasonInfo.rank).color} font-semibold`}>
                  {getRankZone(matchResult.seasonInfo.rank).label}
                </span>
              </div>
            )}

            {/* Final Score */}
            <div className="bg-white/10 rounded-lg p-6 mb-6">
              <ScoreDisplay
                msvGoals={matchResult.msvGoals}
                opponentGoals={matchResult.opponentGoals}
                opponent={opponent}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all">
                <div className="text-3xl font-bold text-goal">{matchResult.msvGoals}</div>
                <div className="text-sm text-white/70">⚽ Tore geschossen</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all">
                <div className="text-3xl font-bold text-white">{matchResult.accuracy}%</div>
                <div className="text-sm text-white/70">🎯 Genauigkeit</div>
              </div>
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 border-2 border-blue-400/50 animate-pulse-glow hover:scale-105 transition-all">
                <div className="text-3xl font-bold text-blue-300">+{xpGained} XP</div>
                <div className="text-sm text-white/70">⭐ Erfahrung gewonnen</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all">
                <div className="text-3xl font-bold text-yellow-300">{postMatchLevel || progress.level || 1}</div>
                <div className="text-sm text-white/70">💪 Dein Level</div>
              </div>
            </div>

            {/* Recap of missed words */}
            {missed.length > 0 && (
              <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
                <div className="font-bold text-white mb-1">
                  📝 Das übst du noch:
                </div>
                {matchResult.extraCorrect > 0 && (
                  <div className="text-xs text-emerald-300 mb-2">
                    ⏱️ {matchResult.extraCorrect} von {missed.length} in der Nachspielzeit wiedergutgemacht!
                  </div>
                )}
                <ul className="space-y-1">
                  {missed.map(vocab => (
                    <li key={vocab.id} className="text-sm text-white/80 flex justify-between gap-3">
                      <span className="font-semibold">{vocab.english}</span>
                      <span className="text-white/60 text-right">{vocab.german}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="btn-primary btn-primary--hero w-full"
            >
              {continueLabel()}
            </button>
            {(cardReward || newAchievements.length > 0) && (
              <button
                onClick={() => onMatchEnd(matchResult)}
                className="btn-secondary btn-secondary--soft w-full mt-3"
              >
                Direkt zum Stadion
              </button>
            )}
          </div>

          <ShareCard summary={shareSummary} reward={cardReward} />
        </div>

        {/* Achievement Unlocked Modal */}
        {showingAchievement && newAchievements[showAchievementIndex] && (
          <AchievementUnlocked
            achievement={newAchievements[showAchievementIndex]}
            onClose={handleAchievementClose}
          />
        )}

        {/* Confetti for victories */}
        <ConfettiExplosion trigger={showConfetti} />

        {/* Level Up Notification */}
        {showLevelUp && leveledUpTo && (
          <LevelUpNotification
            newLevel={leveledUpTo}
            onClose={() => setShowLevelUp(false)}
          />
        )}
      </div>
    )
  }

  const isExtraTime = phase === 'extraTime'
  const activeVocab = isExtraTime ? extraVocabs[extraIndex] : vocabs[currentVocabIndex]
  const activeIndex = isExtraTime ? extraIndex : currentVocabIndex
  const activeTotal = isExtraTime ? extraVocabs.length : vocabs.length

  return (
    <div className={`min-h-screen flex flex-col p-4 pt-match stadium-scene field-pattern relative ${matchFeedback === 'success' ? 'match-success' : matchFeedback === 'miss' ? 'match-miss' : ''}`}>
      <div className="goal-feedback-layer">
        {matchFeedback === 'success' && (
          <>
            <div key={`ball-${goalAnimationKey}`} className="goal-ball ball-shoot-hero">
              ⚽
            </div>
            <div key={`cheer-${crowdAnimationKey}`} className="crowd-reaction crowd-cheer">
              🙌🙌🙌
            </div>
          </>
        )}
        {matchFeedback === 'miss' && (
          <div key={`groan-${crowdAnimationKey}`} className="crowd-reaction crowd-groan">
            😬😬😬
          </div>
        )}
      </div>
      {/* Header with Score */}
      <div className="fixed top-0 left-0 right-0 bg-night/95 backdrop-blur-sm p-4 pt-safe z-10 border-b border-white/10">
        <ScoreDisplay
          msvGoals={msvGoals}
          opponentGoals={opponentGoals}
          opponent={opponent}
        />
        {isSeasonMatch && !isExtraTime && seasonMatchday && (
          <div className="mt-1 text-center text-xs text-white/60">
            📅 Spieltag {seasonMatchday}/{MATCHDAYS}
          </div>
        )}
        {specialMatch && !isExtraTime && (
          <div className="mt-2 text-center animate-bounce-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/20 text-yellow-100 border border-yellow-300/40 font-semibold text-sm">
              {isSeasonMatch ? '🔥 Derby! · +30 XP Bonus' : '⚡ Überraschungs-Derby · +30 XP Bonus'}
            </div>
          </div>
        )}

        {isExtraTime && (
          <div className="mt-2 text-center animate-bounce-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-400/20 text-orange-100 border border-orange-300/40 font-semibold text-sm">
              ⏱️ Nachspielzeit · Fehler wiedergutmachen (+{EXTRA_TIME_XP} XP)
            </div>
          </div>
        )}

        {/* Streak Display */}
        {!isExtraTime && streak > 0 && (
          <div className="mt-2 text-center animate-fade-in">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 ${getStreakColor(streak)} ${streak >= 5 ? 'streak-lightning' : streak >= 3 ? 'streak-fire' : ''}`}>
              <span className="text-2xl">{getStreakEmoji(streak)}</span>
              <span className="font-bold">{streak} in Folge!</span>
              {streak >= 5 && <span className="text-2xl">⚡</span>}
              {streak >= 3 && streak < 5 && <span className="text-2xl">🔥</span>}
            </div>
          </div>
        )}

        {/* Streak Message */}
        {!isExtraTime && streakMessage && (
          <div className="mt-2 text-center animate-bounce-in">
            <div className="text-sm font-bold text-yellow-300">
              {streakMessage}
            </div>
          </div>
        )}
      </div>

      {/* Vocab Card */}
      <div className="flex-1 flex items-center justify-center">
        <VocabCard
          key={`${phase}-${activeVocab.id}`}
          vocab={activeVocab}
          options={activeVocab.options}
          direction={activeVocab.direction}
          onAnswer={handleAnswer}
          currentIndex={activeIndex}
          total={activeTotal}
          extraTime={isExtraTime}
        />
      </div>
    </div>
  )
}

export default Match
