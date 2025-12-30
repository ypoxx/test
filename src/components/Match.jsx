import { useState, useEffect } from 'react'
import VocabCard from './VocabCard'
import ScoreDisplay from './ScoreDisplay'
import AchievementUnlocked from './AchievementUnlocked'
import ConfettiExplosion from './ConfettiExplosion'
import LevelUpNotification from './LevelUpNotification'
import MatchCountdown from './MatchCountdown'
import vocabsData from '../data/vocabs.json'
import { selectVocabsForMatch } from '../utils/spacedRepetition'
import { selectRandomOpponent, checkAnswer, calculateMatchResult, getMatchSummaryMessage } from '../utils/matchLogic'
import { updateVocabProgress, updateGoalsAndLeague, addMatchToHistory, loadProgress, unlockAchievement, addXP, updateDailyStreak } from '../utils/localStorage'
import { generateMultipleChoiceOptions } from '../utils/multipleChoice'
import { calculateStreakBonus, getStreakMessage, getStreakEmoji, getStreakColor, triggerHapticFeedback } from '../utils/gameEffects'
import { checkNewAchievements } from '../utils/achievements'
import { calculateXPReward } from '../utils/xpSystem'
import soundManager from '../utils/sounds'

function Match({ progress, onMatchEnd }) {
  const [opponent] = useState(selectRandomOpponent())
  const [vocabs, setVocabs] = useState([])
  const [currentVocabIndex, setCurrentVocabIndex] = useState(0)
  const [msvGoals, setMsvGoals] = useState(0)
  const [opponentGoals, setOpponentGoals] = useState(0)
  const [matchFinished, setMatchFinished] = useState(false)
  const [matchResult, setMatchResult] = useState(null)
  const [streak, setStreak] = useState(0)
  const [streakMessage, setStreakMessage] = useState(null)
  const [newAchievements, setNewAchievements] = useState([])
  const [showAchievementIndex, setShowAchievementIndex] = useState(0)
  const [showingAchievement, setShowingAchievement] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [xpGained, setXPGained] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [leveledUpTo, setLeveledUpTo] = useState(null)
  const [showCountdown, setShowCountdown] = useState(true)
  const [matchStarted, setMatchStarted] = useState(false)

  useEffect(() => {
    // Initialize sound system on component mount
    soundManager.init()

    // Select vocabs for this match using spaced repetition
    const selectedVocabs = selectVocabsForMatch(vocabsData, progress, 10)

    // Generate multiple choice options for each vocab
    const vocabsWithOptions = selectedVocabs.map(vocab => ({
      ...vocab,
      options: generateMultipleChoiceOptions(vocab, vocabsData)
    }))

    setVocabs(vocabsWithOptions)
  }, [progress])

  const handleAnswer = (userAnswer) => {
    const currentVocab = vocabs[currentVocabIndex]
    const isCorrect = checkAnswer(userAnswer, currentVocab.german)

    // Update vocab progress
    updateVocabProgress(currentVocab.id, isCorrect)

    // Update streak
    let newStreak = streak
    if (isCorrect) {
      newStreak = streak + 1
      setStreak(newStreak)

      // Trigger haptic feedback for correct answer
      triggerHapticFeedback('success')

      // Play goal sound! ⚽
      soundManager.playGoal()

      // Calculate and add XP
      const xpReward = calculateXPReward(newStreak, currentVocab.difficulty)
      setXPGained(prev => prev + xpReward)

      // Check for streak bonus
      const streakBonus = calculateStreakBonus(newStreak)
      const message = getStreakMessage(newStreak)

      if (message) {
        setStreakMessage(message)
        if (streakBonus > 0) {
          triggerHapticFeedback('streak')
          // Play streak sound with level
          soundManager.playStreak(newStreak >= 5 ? 2 : 1)
        }
      }

      // Update score (including streak bonus)
      setMsvGoals(prev => prev + 1 + streakBonus)
    } else {
      setStreak(0)
      setStreakMessage(null)
      setOpponentGoals(prev => prev + 1)

      // Trigger haptic feedback for wrong answer
      triggerHapticFeedback('error')

      // Play wrong answer sound
      soundManager.playWrong()
    }

    // Move to next vocab after a delay
    setTimeout(() => {
      if (currentVocabIndex < vocabs.length - 1) {
        setCurrentVocabIndex(prev => prev + 1)
      } else {
        // Match finished
        finishMatch(isCorrect)
      }
    }, 2000)

    return isCorrect
  }

  const finishMatch = (lastAnswerCorrect) => {
    // Use current scores - they're already updated in handleAnswer!
    const finalMsvGoals = msvGoals
    const finalOpponentGoals = opponentGoals

    const result = calculateMatchResult(finalMsvGoals, vocabs.length)

    // Save old progress for achievement comparison
    const oldProgress = loadProgress()

    // Update progress
    updateGoalsAndLeague(finalMsvGoals)
    addMatchToHistory({
      opponent: opponent.name,
      score: result.score,
      vocabsReviewed: vocabs.length,
      goalsScored: finalMsvGoals
    })

    // Check for new achievements
    const newProgress = loadProgress()
    const unlockedAchievements = checkNewAchievements(oldProgress, newProgress)

    // Unlock achievements
    unlockedAchievements.forEach(achievement => {
      unlockAchievement(achievement.id)
    })

    setNewAchievements(unlockedAchievements)

    // Add XP and check for level up
    const xpResult = addXP(xpGained)
    if (xpResult.leveledUp) {
      setLeveledUpTo(xpResult.newLevel)
      setShowLevelUp(true)
    }

    // Update daily streak
    updateDailyStreak()

    // Trigger victory haptic feedback and sounds
    if (result.status === 'win') {
      triggerHapticFeedback('victory')
      soundManager.playVictory()
      soundManager.playCrowd()
      setShowConfetti(true)
    } else if (result.status === 'loss') {
      soundManager.playDefeat()
    }

    setMatchResult(result)
    setMatchFinished(true)
  }

  const handleContinue = () => {
    // Simplified: Check if we have achievements to show
    if (newAchievements.length > 0 && !showingAchievement) {
      setShowingAchievement(true)
    } else {
      onMatchEnd(matchResult)
    }
  }

  const handleAchievementClose = () => {
    const nextIndex = showAchievementIndex + 1
    if (nextIndex < newAchievements.length) {
      setShowAchievementIndex(nextIndex)
    } else {
      setShowingAchievement(false)
      // Go to stadium after all achievements shown
      onMatchEnd(matchResult)
    }
  }

  // Show countdown before match starts
  if (showCountdown && vocabs.length > 0) {
    return (
      <MatchCountdown
        opponent={opponent}
        onComplete={() => {
          setShowCountdown(false)
          setMatchStarted(true)
        }}
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

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 stadium-scene field-pattern relative overflow-hidden">
        {/* Floodlights */}
        <div className="floodlight top-10 left-10" />
        <div className="floodlight top-10 right-10" />

        <div className="w-full max-w-2xl relative z-10">
          {/* Result Card */}
          <div className="card p-8 text-center mb-6">
            <div className="text-6xl mb-4">{summary.emoji}</div>
            <h2 className="text-3xl font-bold mb-2">{summary.title}</h2>
            <p className="text-xl mb-6">{summary.message}</p>
            <p className="text-lg text-white/80 italic mb-6">{summary.storyHook}</p>

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
                <div className="text-3xl font-bold text-yellow-300">{progress.level || 1}</div>
                <div className="text-sm text-white/70">💪 Dein Level</div>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="btn-primary w-full"
            >
              Zurück zum Stadion
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col p-4 pt-28 stadium-scene field-pattern relative">
      {/* Header with Score */}
      <div className="fixed top-0 left-0 right-0 bg-field-green/95 backdrop-blur-sm p-4 z-10 border-b border-white/10">
        <ScoreDisplay
          msvGoals={msvGoals}
          opponentGoals={opponentGoals}
          opponent={opponent}
        />

        {/* Streak Display */}
        {streak > 0 && (
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
        {streakMessage && (
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
          vocab={vocabs[currentVocabIndex]}
          options={vocabs[currentVocabIndex].options}
          onAnswer={handleAnswer}
          currentIndex={currentVocabIndex}
          total={vocabs.length}
        />
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

export default Match
