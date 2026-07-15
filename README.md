# ⚽ Maurice's Vokabel-Trainer

Progressive Web App zum spielerischen Lernen von Englisch-Vokabeln mit Fußball-Gamification.

## 🎯 Features

- **Match-Day System**: Jede Lernsession ist ein Fußballspiel gegen Bundesliga-Teams
- **Echtes Spaced Repetition**: Falsche Vokabeln kommen sofort wieder, richtige in wachsenden Abständen (1 → 3 → 7 → … Tage)
- **Nachspielzeit**: Falsch beantwortete Wörter werden direkt am Matchende noch einmal geübt
- **Beide Richtungen**: EN→DE und DE→EN (aktives Abrufen für bekannte Wörter)
- **Trainings-Filter**: Gezielt nach Kategorie (Sport, Schule, …) und Schwierigkeit üben
- **Saison-Modus**: 34 Spieltage gegen 17 Clubs, Live-Tabelle, Saisonziele (Meisterschaft bis Abstiegskampf) und Saison-Belohnungen
- **Liga-System**: Aufstieg von Kreisliga bis Bundesliga durch Tore (Karriere-Fortschritt)
- **Tages-Serie**: 🔥-Streak für tägliches Spielen
- **Sammelkarten & Trophäen**: Kartenpacks nach Siegen, Achievements mit Seltenheitsstufen
- **450+ Vokabeln**: 7. Klasse Englisch inkl. unregelmäßiger Verben, Körper & Gesundheit, Medien & Technik
- **Offline-fähig**: PWA mit Precaching (funktioniert ab dem ersten Besuch offline)
- **Mobile-optimiert**: Speziell für iPhone (Safe-Area, Homescreen-Icon, Sound-Unlock)

## 🚀 Installation & Start

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Production Build erstellen
npm run build

# Production Build lokal testen
npm run preview
```

## 📱 Als PWA installieren

1. App im Browser öffnen
2. "Zum Startbildschirm hinzufügen" auswählen
3. App wie eine native App nutzen

## 🎨 Anpassungen

### Icons ersetzen

Die aktuellen Icons in `/public` sind Platzhalter. Ersetze:
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)

Mit MSV Duisburg-branded Icons.

### Vokabeln hinzufügen

Bearbeite `/src/data/vocabs.json` um weitere Vokabeln hinzuzufügen.

## 📊 Technologie

- **React 18** mit Vite
- **Tailwind CSS** für Styling
- **LocalStorage** für Datenpersistenz
- **PWA** mit Service Worker

## 🎮 Spielanleitung

1. Klicke auf "Neues Spiel starten"
2. Du spielst gegen ein zufälliges Bundesliga-Team
3. Übersetze 10 englische Vokabeln ins Deutsche
4. Richtige Antwort = MSV schießt ein Tor ⚽
5. Falsche Antwort = Gegner schießt ein Tor ❌
6. Sammle Tore und steige in höhere Ligen auf!

## 📈 Liga-System

- **Kreisliga**: 0-199 Tore
- **Regionalliga West**: 200-499 Tore
- **2. Bundesliga**: 500-999 Tore
- **Bundesliga**: 1000+ Tore

## 🔮 Geplante Features (Phase 2)

- Seltene Fußball-Facts nach Spielen
- Celebration Cards (teilbar)
- Animationen & Sound-Effekte
- Eltern-Dashboard
- Erweiterte Statistiken
- Themen-Auswahl
- Eigene Vokabeln hinzufügen

---

Made with ⚽ for Maurice
