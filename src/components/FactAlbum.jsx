import facts from '../data/facts.json'

function FactAlbum({ unlockedFactIds, onClose }) {
  const unlockedCount = unlockedFactIds.length

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
      <div className="min-h-screen flex items-start justify-center p-4 py-8">
        <div className="w-full max-w-4xl">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">
                📚 Sammelalbum der Fakten
              </h2>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="mb-6 p-4 bg-white/5 rounded-lg">
              <div className="text-center">
                <span className="text-2xl font-bold text-white">
                  {unlockedCount} / {facts.length}
                </span>
                <span className="text-white/70 ml-2">Fakten gesammelt</span>
              </div>
              <div className="mt-2 w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-500"
                  style={{
                    width: `${(unlockedCount / facts.length) * 100}%`
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {facts.map((fact) => {
                const isUnlocked = unlockedFactIds.includes(fact.id)

                return (
                  <div
                    key={fact.id}
                    className={`relative rounded-xl p-4 transition-all duration-300 ${
                      isUnlocked
                        ? 'bg-white/10 hover:scale-[1.02]'
                        : 'bg-white/5 opacity-60 grayscale'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">
                        {isUnlocked ? '📣' : '🔒'}
                      </div>
                      <div>
                        <div className="text-sm uppercase tracking-wide text-white/60">
                          {isUnlocked ? (fact.category === 'msv' ? 'MSV Duisburg' : 'Bundesliga') : 'Unbekannt'}
                        </div>
                        <div className="text-lg font-bold text-white">
                          {isUnlocked ? fact.title : '???'}
                        </div>
                        <div className="text-sm text-white/70 mt-1">
                          {isUnlocked ? fact.fact : 'Spiele Matches, um neue Fakten freizuschalten.'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={onClose}
              className="btn-primary w-full mt-6"
            >
              Zurück zum Stadion
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FactAlbum
