import LeagueProgress from './LeagueProgress'
import { getVocabStats } from '../utils/spacedRepetition'
import vocabsData from '../data/vocabs.json'

function Stadium({ progress, onStartMatch }) {
  const stats = getVocabStats(vocabsData, progress)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            ⚽ Vokabel-Trainer
          </h1>
          <p className="text-xl text-white/80">
            MSV Duisburg Edition
          </p>
        </div>

        {/* League Progress */}
        <div className="mb-6">
          <LeagueProgress totalGoals={progress.totalGoalsScored} />
        </div>

        {/* Start Match Button */}
        <button
          onClick={onStartMatch}
          className="btn-primary w-full mb-6 text-xl py-4"
        >
          ⚽ Neues Spiel starten
        </button>

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

        {/* Recent Matches */}
        {progress.matchHistory && progress.matchHistory.length > 0 && (
          <div className="card p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              📋 Letzte Spiele
            </h3>
            <div className="space-y-2">
              {progress.matchHistory.slice(0, 5).map((match, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-lg p-3 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {match.score.split(':')[0] > match.score.split(':')[1]
                        ? '✅'
                        : match.score.split(':')[0] < match.score.split(':')[1]
                        ? '❌'
                        : '🤝'}
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
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-white/50 text-sm">
          Made with ⚽ for Maurice
        </div>
      </div>
    </div>
  )
}

export default Stadium
