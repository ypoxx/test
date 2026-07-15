import StadiumScene from './StadiumScene'
import FutCard from './FutCard'
import cards from '../data/cards.json'

/**
 * ZutGallery — Dev-Galerie für Phase 3 des ZUT-Umbaus.
 * Nur über ?zut-gallery erreichbar (lazy-Import in App.jsx),
 * landet nicht im Haupt-Bundle. Wird in Phase 4+ wieder entfernt
 * bzw. durch die echten Screens ersetzt.
 */

const byId = (id) => cards.find((c) => c.id === id)
const serialOf = (card) => cards.indexOf(card) + 1

const SHOWCASE = [
  { card: byId('card_msv_captain'), note: 'Bronze-Folie · Common' },
  { card: byId('captains-band'), note: 'Silber-Folie · Rare' },
  { card: byId('derby-fire'), note: 'Gold-Folie · Epic' },
  { card: byId('card_zebra_legend'), note: 'Holo-Folie · Legendary' },
]

const GHOST_CARD = byId('immortal-zebra')

const TILE_IDS = [
  'card_msv_captain',
  'captains-band',
  'derby-fire',
  'card_zebra_legend',
  'matchday-scarf',
]

const SCENE_VARIANTS = [
  { variant: 'default', note: 'Kühles Flutlicht' },
  { variant: 'walkout', note: 'Dramatisch · zwei Beams' },
  { variant: 'gold', note: 'Goldene Lichtkegel' },
]

const SectionTitle = ({ children }) => (
  <h2 className="mb-3 mt-10 text-[13px] font-extrabold uppercase tracking-[0.24em] text-[#AFC4E8]">
    {children}
  </h2>
)

function ZutGallery() {
  return (
    <StadiumScene variant="gold">
      <div className="mx-auto max-w-[420px] px-5 pb-16 pt-safe">
        <header className="pt-4 text-center">
          <p className="text-[13px] font-bold uppercase tracking-[0.3em] text-[#AFC4E8]">
            Phase 3 · Dev-Galerie
          </p>
          <h1 className="mt-1 text-3xl font-black italic uppercase text-[#FFE27A]">
            Zebra Ultimate Team
          </h1>
        </header>

        {/* Vier Folien in Reveal-Größe */}
        <SectionTitle>FutCard · Variante &bdquo;reveal&ldquo;</SectionTitle>
        <div className="flex flex-col items-center gap-8">
          {SHOWCASE.map(({ card, note }) => (
            <figure key={card.id} className="flex flex-col items-center gap-2">
              <div style={{ width: 272 }}>
                <FutCard card={card} variant="reveal" serial={serialOf(card)} />
              </div>
              <figcaption className="text-xs font-bold tracking-widest text-white/70">
                {note}
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Ghost-Karte (Fehlt-Zustand) */}
        <SectionTitle>FutCard · Variante &bdquo;ghost&ldquo;</SectionTitle>
        <figure className="flex flex-col items-center gap-2">
          <div style={{ width: 170 }}>
            <FutCard card={GHOST_CARD} variant="ghost" serial={serialOf(GHOST_CARD)} />
          </div>
          <figcaption className="text-xs font-bold tracking-widest text-white/70">
            Fehlt-Zustand · Legendary
          </figcaption>
        </figure>

        {/* Album-Kacheln */}
        <SectionTitle>FutCard · Variante &bdquo;tile&ldquo; (Album)</SectionTitle>
        <div
          className="justify-center gap-2.5"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 110px)' }}
        >
          {TILE_IDS.map((id) => {
            const card = byId(id)
            return <FutCard key={id} card={card} variant="tile" serial={serialOf(card)} />
          })}
          <FutCard card={GHOST_CARD} variant="ghost" serial={serialOf(GHOST_CARD)} />
        </div>

        {/* StadiumScene-Varianten */}
        <SectionTitle>StadiumScene · Varianten</SectionTitle>
        <div className="flex flex-col gap-4">
          {SCENE_VARIANTS.map(({ variant, note }) => (
            <div
              key={variant}
              className="overflow-hidden rounded-2xl border border-white/15"
              style={{ height: 170 }}
            >
              <StadiumScene variant={variant} style={{ minHeight: '100%', height: '100%' }}>
                <div className="flex h-full flex-col items-start justify-end p-4">
                  <span className="text-sm font-black uppercase tracking-[0.2em] text-white">
                    {variant}
                  </span>
                  <span className="text-xs font-semibold text-white/70">{note}</span>
                </div>
              </StadiumScene>
            </div>
          ))}
        </div>
      </div>
    </StadiumScene>
  )
}

export default ZutGallery
