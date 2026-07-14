import { Component } from 'react'

/**
 * Catches runtime errors so Maurice never sees a blank white screen.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 stadium-bg">
          <div className="card p-8 text-center max-w-md">
            <div className="text-6xl mb-4">😵⚽</div>
            <h1 className="text-3xl font-bold text-white mb-3">Ups, Abpfiff!</h1>
            <p className="text-white/80 mb-6">
              Da ist etwas schiefgelaufen. Keine Sorge – dein Fortschritt ist gespeichert.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
            >
              🔄 Neu anpfeifen
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
