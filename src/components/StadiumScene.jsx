import './StadiumScene.css'

/**
 * StadiumScene — Layout-Komponente für die Nachtstadion-Bühne
 * (Design-Richtung A "Flutlicht-Gold", scratchpad/design/direction-a.html).
 *
 * Rendert den Vollbild-Hintergrund (Nachtblau-Verlauf, Flutlicht-Kegel,
 * Lichtnebel, Körnung, Rasenandeutung) und die Kinder darüber. Alle
 * Deko-Layer sind pointer-events: none und aria-hidden.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children
 * @param {'default'|'walkout'|'gold'} [props.variant='default']
 *        default = kühles Flutlicht · walkout = dramatisch dunkel mit
 *        zwei Beams · gold = goldene Lichtkegel
 * @param {string} [props.className] - zusätzliche Klassen für den Wrapper
 */
function StadiumScene({ children, variant = 'default', className = '', ...rest }) {
  return (
    <div
      className={`zut-scene zut-scene--${variant}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      <div className="zut-scene__deco" aria-hidden="true">
        <i className="zut-scene__beam zut-scene__beam--l" />
        <i className="zut-scene__beam zut-scene__beam--r" />
        <i className="zut-scene__haze" />
        <i className="zut-scene__grain" />
        <i className="zut-scene__turf" />
      </div>
      <div className="zut-scene__content">{children}</div>
    </div>
  )
}

export default StadiumScene
