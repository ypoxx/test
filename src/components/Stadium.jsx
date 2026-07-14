import { useRef, useState } from 'react'
import LeagueProgress from './LeagueProgress'
import TrophyCase from './TrophyCase'
import XPBar from './XPBar'
import CategoryStats from './CategoryStats'
import CardAlbum from './CardAlbum'
import Settings from './Settings'
import SeasonTable from './SeasonTable'
import SeasonSummary from './SeasonSummary'
import { getVocabStats } from '../utils/spacedRepetition'
import vocabsData from '../data/vocabs.json'
import { exportProgressData, getLeagueProgress, importProgressData, addXP } from '../utils/localStorage'
import { loadSeason, getNextFixture, getRank, getRankZone, getSeasonReward, startNextSeason, MATCHDAYS } from '../utils/season'
import { OPPONENTS } from '../utils/matchLogic'
import { CATEGORIES } from '../utils/categories'

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Alle', emoji: '🎲' },
  ...CATEGORIES
]

const DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'Gemischt' },
  { value: 1, label: 'Leicht' },
  { value: 2, label: 'Mittel' },
  { value: 3, label: 'Schwer' }
]

function Stadium({ progress, onStartMatch, onProgressReset, onProgressRefresh }) {
  const stats = getVocabStats(vocabsData, progress)
  const [showTrophyCase, setShowTrophyCase] = useState(false)
  const leagueInfo = getLeagueProgress(progress.totalGoalsScored || 0)
  const { currentLeagueInfo, nextLeagueInfo, goalsNeeded } = leagueInfo
  const [showAlbum, setShowAlbum] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [backupStatus, setBackupStatus] = useState(null)
  const [category, setCategory] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const fileInputRef = useRef(null)

  // Season state (lazily created on first visit)
  const [season, setSeason] = useState(() => loadSeason())
  const [showTable, setShowTable] = useState(false)
  const nextFixture = getNextFixture(season)
  const fixtureOpponent = nextFixture
    ? OPPONENTS.find(o => o.name === nextFixture.opponent)
    : null
  const seasonRank = getRank(season)
  const seasonZone = getRankZone(seasonRank)
  const playedMatchdays = Math.min(season.currentMatchday - 1, MATCHDAYS)

  const handleNextSeason = () => {
    const reward = getSeasonReward(season.completed.rank)
    addXP(reward.xp)
    const freshSeason = startNextSeason()
    setSeason(freshSeason)
    onProgressRefresh?.()
  }

  const dailyStreak = progress.dailyStreak || 0

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-safe stadium-scene field-pattern relative overflow-hidden">
      {/* Floodlights */}
      <div className="floodlight top-10 left-10" />
      <div className="floodlight top-10 right-10" />

      {/* Stadium crowd backdrop at top */}
      <div className="absolute top-0 left-0 right-0 h-48 overflow-hidden pointer-events-none">
        <img
          src="/img/stadium-backdrop.webp"
          alt=""
          className="w-full h-full object-cover opacity-45"
          onError={(event) => { event.currentTarget.style.display = 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night/30 via-night/60 to-night" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(true)}
          className="absolute top-0 right-0 text-2xl p-2 text-white/70 hover:text-white transition-colors"
          aria-label="Einstellungen"
        >
          ⚙️
        </button>

        {/* Header */}
        <div className="text-center mb-6 px-10">
          <h1 className="text-4xl font-black text-white mb-1 uppercase tracking-tight">
            ⚽ Vokabel-Trainer
          </h1>
          <p className="text-lg text-goal/90 font-semibold uppercase tracking-[0.25em]">
            MSV Duisburg Edition
          </p>

          {/* Daily Streak */}
          {dailyStreak > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 border border-orange-400/40 text-orange-100 font-bold animate-fade-in">
              <span className="text-2xl">🔥</span>
              <span>
                {dailyStreak === 1
                  ? 'Tages-Serie gestartet!'
                  : `${dailyStreak} Tage in Folge!`}
              </span>
            </div>
          )}
        </div>

        {/* XP and Level */}
        <div className="mb-6">
          <XPBar xp={progress.xp || 0} level={progress.level || 1} />
        </div>

        {/* League Progress */}
        <div className="mb-6">
          <div className="card p-5 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-msv-blue/40 to-goal/20 border border-goal/40">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{currentLeagueInfo.emoji}</div>
              <div>
                <div className="text-sm uppercase tracking-wide text-white/70">Aktuelle Liga</div>
                <div className="text-2xl font-bold text-white">{currentLeagueInfo.name}</div>
              </div>
            </div>
            <div className="text-center sm:text-right">
              {nextLeagueInfo ? (
                <>
                  <div className="text-sm text-white/70">Ziel</div>
                  <div className="text-xl font-semibold text-goal">
                    Noch {goalsNeeded} Tore bis {nextLeagueInfo.name}
                  </div>
                </>
              ) : (
                <div className="text-xl font-semibold text-goal">Bundesliga erreicht!</div>
              )}
            </div>
          </div>
          <LeagueProgress totalGoals={progress.totalGoalsScored} />
        </div>

        {/* Season Panel */}
        <div className="card p-5 mb-4 bg-gradient-to-r from-emerald-900/40 to-msv-blue/30 border border-emerald-400/30">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm uppercase tracking-wide text-white/70">
                📅 Saison {season.seasonNumber} · Spieltag {Math.min(season.currentMatchday, MATCHDAYS)}/{MATCHDAYS}
              </div>
              <div className={`text-lg font-bold ${seasonZone.color}`}>
                {seasonZone.emoji} Platz {seasonRank} · {seasonZone.label}
              </div>
            </div>
            <button
              onClick={() => setShowTable(true)}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-semibold"
            >
              📊 Tabelle
            </button>
          </div>
          {nextFixture && fixtureOpponent && (
            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
              <div className="text-3xl">{fixtureOpponent.logo}</div>
              <div>
                <div className="text-white font-semibold">
                  {nextFixture.home ? 'Heimspiel' : 'Auswärts'} gegen {fixtureOpponent.name}
                </div>
                <div className="text-xs text-white/60">
                  {fixtureOpponent.isDerby ? '🔥 Derby! +30 XP Bonus' : `Nächster Gegner am ${nextFixture.matchday}. Spieltag`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Training Filter */}
        <div className="card p-4 mb-4">
          <div className="text-sm font-bold text-white/80 mb-2">🎯 Was willst du üben?</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {CATEGORY_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => setCategory(option.value)}
                className={`px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                  category === option.value
                    ? 'bg-msv-blue text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {option.emoji} {option.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTY_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => setDifficulty(option.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  difficulty === option.value
                    ? 'bg-goal text-gray-900'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start Match Buttons */}
        {nextFixture && fixtureOpponent && (
          <button
            onClick={startSeasonMatch}
            className="btn-primary btn-primary--hero w-full mb-3"
          >
            ⚽ Spieltag {nextFixture.matchday} spielen
          </button>
        )}
        <button
          onClick={startTrainingMatch}
          className="btn-secondary btn-secondary--soft w-full mb-4 text-lg py-3"
        >
          🎯 Freies Training (ohne Tabelle)
        </button>

        {/* Trophy Case Button */}
        <button
          onClick={() => setShowTrophyCase(true)}
          className="btn-secondary btn-secondary--soft w-full mb-3 text-lg py-3"
        >
          🏆 Meine Trophäen ({progress.achievements?.length || 0})
        </button>

        {/* Card Album Button */}
        <button
          onClick={() => setShowAlbum(true)}
          className="btn-secondary btn-secondary--soft w-full mb-3 text-lg py-3 bg-emerald-600 hover:bg-emerald-700"
        >
          📘 Kartenalbum ({progress.unlockedCards?.length || 0})
        </button>

        <div className="card p-4 mb-6 text-center">
          <div className="text-sm text-white/80 mb-3">
            Fortschritt bleibt auf dem iPhone gespeichert. Für extra Sicherheit kannst du ein Backup sichern.
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleExport} className="btn-secondary btn-secondary--soft w-full">
              💾 Backup speichern
            </button>
            <button onClick={handleImportClick} className="btn-secondary btn-secondary--soft w-full">
              📂 Backup laden
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
            <div className="mt-3 text-xs text-white/60">{backupStatus}</div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {stats.mastered}
            </div>
            <div className="text-sm text-white/70">Gemeistert</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {stats.learning}
            </div>
            <div className="text-sm text-white/70">Am Lernen</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {stats.neverSeen}
            </div>
            <div className="text-sm text-white/70">Noch nicht gelernt</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {stats.overallAccuracy}%
            </div>
            <div className="text-sm text-white/70">Genauigkeit</div>
          </div>
        </div>

        {/* Category Stats */}
        <div className="mb-6">
          <CategoryStats progress={progress} />
        </div>

        {/* Recent Matches */}
        {progress.matchHistory && progress.matchHistory.length > 0 && (
          <div className="card p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              📋 Letzte Spiele
            </h3>
            <div className="space-y-2">
              {progress.matchHistory.slice(0, 5).map((match, index) => {
                const [msv, opp] = String(match.score).split(':').map(Number)
                return (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-3 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {msv > opp ? '✅' : msv < opp ? '❌' : '🤝'}
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          vs {match.opponent}
                        </div>
                        <div className="text-white/60 text-sm">
                          {new Date(match.date).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                    </div>
                    <div className="text-white font-bold text-lg">
                      {match.score}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-white/50 text-sm">
          Made with ⚽ for Maurice
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
    </div>
  )
}

export default Stadium
