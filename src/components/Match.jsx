import { useState, useEffect, useRef } from 'react'
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
import { calculateStreakBonus, getStreakMessage, triggerHapticFeedback } from '../utils/gameEffects'
import { getZoneStyle } from './zoneStyles'
import StadiumScene from './StadiumScene'
import './Match.css'
import { checkNewAchievements } from '../utils/achievements'
import { calculateXPReward } from '../utils/xpSystem'
import CardReveal from './CardReveal'
import { rollCardReward } from '../utils/cardRewards'
import { recordSeasonResult, getRankZone, MATCHDAYS } from '../utils/season'
import soundManager from '../utils/sounds'
import ShareCard from './ShareCard'

const EXTRA_TIME_XP = 5

// Emojis aus Logik-Strings (z. B. getStreakMessage) für die Broadcast-UI
// entfernen — die Strings selbst bleiben unverändert in der Logik-Schicht.
const stripEmojis = (text) =>
  String(text).replace(/[\p{Extended_Pictographic}️‍]/gu, '').replace(/\s{2,}/g, ' ').trim()

/* Inline-SVG-Glyphen statt Emoji-Grafiken (Barrierefreiheits-Regel) */
const FlameGlyph = () => (
  <svg width="11" height="14" viewBox="0 0 11 15" fill="currentColor" aria-hidden="true">
    <path d="M5.5 0C7 2.8 10 5 10 9.2 10 12.4 8 15 5.5 15 3 15 1 12.9 1 9.9 1 7.6 2.2 6 3.4 4.6c.2 1.2.7 2 1.6 2.5C4.6 4.8 4.8 2.3 5.5 0z" />
  </svg>
)

const ClockGlyph = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="8" cy="8" r="6.6" />
    <path d="M8 4.5V8l2.5 1.8" strokeLinecap="round" />
  </svg>
)

const TargetGlyph = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <circle cx="8" cy="8" r="6.5" />
    <circle cx="8" cy="8" r="3.4" />
    <circle cx="8" cy="8" r="0.8" fill="currentColor" stroke="none" />
  </svg>
)

const StarGlyph = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 1.2 10 5.6l4.8.5-3.6 3.2 1 4.7L8 11.6 3.8 14l1-4.7L1.2 6.1 6 5.6 8 1.2z" />
  </svg>
)

const LevelGlyph = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M3 13.5h10M8 11V3M4.6 6.4 8 3l3.4 3.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

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

  // Fixed-Header-Höhe variiert mit Meta-Chips (Spieltag/Derby/Nachspielzeit) —
  // gemessen statt geraten, damit der Content-Offset (.pt-match) nie zu klein ist.
  // Callback-Ref statt useEffect: der Header mountet erst nach dem Countdown.
  const matchHeadRO = useRef(null)
  const matchHeadRef = (el) => {
    if (matchHeadRO.current) {
      matchHeadRO.current.disconnect()
      matchHeadRO.current = null
    }
    if (el && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        document.documentElement.style.setProperty('--zut-matchhead-h', `${el.offsetHeight}px`)
      })
      ro.observe(el)
      matchHeadRO.current = ro
    } else {
      document.documentElement.style.removeProperty('--zut-matchhead-h')
    }
  }

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
      setMatchFeedback('miss')
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
      setMatchFeedback('miss')
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
      return 'Trophäe ansehen'
    }
    if (cardReward && !showCardReveal) {
      return 'Kartenpack öffnen'
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
          isVictory={matchResult.status === 'win'}
          onClose={() => onMatchEnd(matchResult)}
        />
      )
    }

    const resultTitle = matchResult.status === 'win'
      ? 'Sieg!'
      : matchResult.status === 'lose'
        ? 'Niederlage'
        : 'Unentschieden'

    return (
      <StadiumScene variant={matchResult.status === 'win' ? 'gold' : 'default'} className="zut-focusables">
        <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-safe">
          <div className="w-full max-w-2xl relative z-10">
            {/* Result Panel */}
            <div className="zut-panel zut-panel--main p-6 text-center mb-6">
              <div className="zut-eyebrow mb-1">Abpfiff</div>
              <h2 className="zut-result-title mb-2">{resultTitle}</h2>
              <p className="text-lg text-white/90 mb-6">{summary.message}</p>

              {/* Season standing after this matchday */}
              {matchResult.seasonInfo && (
                <div className="zut-panel zut-panel--inset p-3 mb-6 flex items-center justify-center gap-3 text-sm">
                  <span className="text-white/70">
                    Spieltag {matchResult.seasonInfo.matchday}/{MATCHDAYS}
                  </span>
                  <span className="font-bold">
                    Platz {matchResult.seasonInfo.rank}
                  </span>
                  <span className={`${getZoneStyle(getRankZone(matchResult.seasonInfo.rank).zone).text} font-semibold`}>
                    {getRankZone(matchResult.seasonInfo.rank).label}
                  </span>
                </div>
              )}

              {/* Final Score als Broadcast-Bar */}
              <div className="zut-panel zut-panel--inset px-4 py-5 mb-6">
                <ScoreDisplay
                  msvGoals={matchResult.msvGoals}
                  opponentGoals={matchResult.opponentGoals}
                  opponent={opponent}
                  final
                />
              </div>

              {/* Stats als ZUT-Panels */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="zut-panel zut-panel--inset p-4">
                  <div className="text-3xl font-bold" style={{ color: 'var(--zut-gold-1)' }}>{matchResult.msvGoals}</div>
                  <div className="text-sm text-white/70">
                    <span className="zut-stat-icon"><img src="/img/ball.svg" alt="" width="15" height="15" /></span>
                    Tore geschossen
                  </div>
                </div>
                <div className="zut-panel zut-panel--inset p-4">
                  <div className="text-3xl font-bold text-white">{matchResult.accuracy}%</div>
                  <div className="text-sm text-white/70">
                    <span className="zut-stat-icon"><TargetGlyph /></span>
                    Genauigkeit
                  </div>
                </div>
                <div className="zut-panel zut-panel--xp p-4">
                  <div className="text-3xl font-bold text-blue-300">+{xpGained} XP</div>
                  <div className="text-sm text-white/70">
                    <span className="zut-stat-icon"><StarGlyph /></span>
                    Erfahrung gewonnen
                  </div>
                </div>
                <div className="zut-panel zut-panel--inset p-4">
                  <div className="text-3xl font-bold" style={{ color: 'var(--zut-gold-2)' }}>{postMatchLevel || progress.level || 1}</div>
                  <div className="text-sm text-white/70">
                    <span className="zut-stat-icon"><LevelGlyph /></span>
                    Dein Level
                  </div>
                </div>
              </div>

              {/* Recap of missed words */}
              {missed.length > 0 && (
                <div className="zut-panel zut-panel--inset p-4 mb-6 text-left">
                  <div className="font-bold text-white mb-1">
                    Das übst du noch:
                  </div>
                  {matchResult.extraCorrect > 0 && (
                    <div className="text-[13px] text-emerald-300 mb-2">
                      {matchResult.extraCorrect} von {missed.length} in der Nachspielzeit wiedergutgemacht!
                    </div>
                  )}
                  <ul className="space-y-1">
                    {missed.map(vocab => (
                      <li key={vocab.id} className="text-sm text-white/90 flex justify-between gap-3">
                        <span className="font-semibold">{vocab.english}</span>
                        <span className="text-white/70 text-right">{vocab.german}</span>
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
      </StadiumScene>
    )
  }

  const isExtraTime = phase === 'extraTime'
  const activeVocab = isExtraTime ? extraVocabs[extraIndex] : vocabs[currentVocabIndex]
  const activeIndex = isExtraTime ? extraIndex : currentVocabIndex
  const activeTotal = isExtraTime ? extraVocabs.length : vocabs.length

  // Spielminute aus dem Fragen-Fortschritt (Nachspielzeit: 90+n)
  const minuteLabel = isExtraTime
    ? `90+${extraIndex + 1}′`
    : `${Math.min(90, Math.round(((currentVocabIndex + 1) / Math.max(vocabs.length, 1)) * 90))}′`

  // Kommentator-Zeile — nutzt nur vorhandene Logik/Strings (Anpfiff, TOR-Ruf,
  // getStreakMessage, Nachspielzeit); dupliziert NICHT den Beispielsatz der Vokabel.
  const commentary = (() => {
    if (matchFeedback === 'success') {
      return isExtraTime
        ? 'Wiedergutgemacht! Das sitzt!'
        : 'TOOOR! Der MSV trifft!'
    }
    if (matchFeedback === 'miss') {
      // lange Vereinsnamen würden die einzeilige Zeile abschneiden
      return `Abgefangen! ${opponent.name.length <= 16 ? opponent.name : 'Der Gegner'} kontert.`
    }
    if (isExtraTime) {
      return `Nachspielzeit! Jede richtige Antwort macht einen Fehler wieder gut (+${EXTRA_TIME_XP} XP).`
    }
    if (streakMessage) {
      return stripEmojis(streakMessage)
    }
    if (currentVocabIndex === 0 && msvGoals === 0 && opponentGoals === 0) {
      return `Anpfiff! MSV Duisburg empfängt ${opponent.name}.`
    }
    return 'Der MSV bleibt in Ballbesitz – nächste Vokabel.'
  })()

  const showMetaRow = (isSeasonMatch && !isExtraTime && seasonMatchday) || (specialMatch && !isExtraTime) || isExtraTime

  return (
    <div className={`min-h-screen flex flex-col p-4 pt-match stadium-scene field-pattern relative zut-focusables ${matchFeedback === 'miss' ? 'zut-shake' : ''}`}>
      {/* EIN konsolidierter Tor-Beat: Flash (MSV-Blau) + Ball-Flug + Crowd-Welle */}
      <div className="goal-feedback-layer" aria-hidden="true">
        {matchFeedback === 'success' && (
          <>
            <div key={`flash-${goalAnimationKey}`} className="zut-goal-flash" />
            <div key={`ball-${goalAnimationKey}`} className="zut-goal-ball">
              <img src="/img/ball.svg" alt="" />
            </div>
            <div key={`crowd-${crowdAnimationKey}`} className="zut-crowd">
              <i className="zut-crowd__glow" />
              <i className="zut-crowd__heads" />
              <i className="zut-crowd__wave" />
            </div>
          </>
        )}
        {matchFeedback === 'miss' && (
          <div key={`miss-${crowdAnimationKey}`} className="zut-missfx" />
        )}
      </div>

      {/* Broadcast-Header: Score-Bar + Kommentator + Meta-Chips */}
      <div ref={matchHeadRef} className="fixed top-0 left-0 right-0 z-10 pt-safe zut-matchhead">
        <ScoreDisplay
          msvGoals={msvGoals}
          opponentGoals={opponentGoals}
          opponent={opponent}
          minute={minuteLabel}
          streak={isExtraTime ? 0 : streak}
        />

        {/* Bewusst ohne aria-live: das role="status"-Banner in VocabCard meldet
            das Antwort-Ergebnis bereits — doppelte Ansagen vermeiden */}
        <div className="zut-commentary">
          <span className="zut-commentary__lbl">Kommentator</span>
          <span className="zut-commentary__txt">„{commentary}“</span>
        </div>

        {showMetaRow && (
          <div className="zut-matchmeta">
            {isSeasonMatch && !isExtraTime && seasonMatchday && (
              <span className="zut-chip">Spieltag {seasonMatchday}/{MATCHDAYS}</span>
            )}
            {specialMatch && !isExtraTime && (
              <span className="zut-chip zut-chip--gold">
                <FlameGlyph />
                {isSeasonMatch ? 'Derby! · +30 XP Bonus' : 'Überraschungs-Derby · +30 XP Bonus'}
              </span>
            )}
            {isExtraTime && (
              <span className="zut-chip zut-chip--extra">
                <ClockGlyph />
                Nachspielzeit · Fehler wiedergutmachen (+{EXTRA_TIME_XP} XP)
              </span>
            )}
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
