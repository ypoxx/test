# Maurice's Vokabel-Trainer - PLATIN ROADMAP

**Analyse durchgeführt am:** 29. Dezember 2025
**Ziel:** Platin-Niveau erreichen
**Aktueller Stand:** Solide Basis mit Optimierungspotenzial

---

## EXECUTIVE SUMMARY

Der Vokabel-Trainer ist gut strukturiert mit einem intelligenten Spaced-Repetition-Algorithmus, umfangreichem Achievement-System und solider Gamification. Allerdings gibt es **kritische Bugs**, **fehlende Features** (v.a. Storymode) und **erhebliches visuelles Potenzial**, das nicht ausgeschöpft wird.

---

## 1. KRITISCHE BUGS (Priorität: SOFORT)

### 1.1 Service Worker fehlt komplett
- **Datei:** `src/main.jsx:9`
- **Problem:** `navigator.serviceWorker.register('/sw.js')` - aber `sw.js` existiert nicht!
- **Auswirkung:** PWA funktioniert NICHT offline, Installation fehlerhaft
- **Fix:** Service Worker mit Cache-Strategie implementieren

### 1.2 CategoryStats berechnet Accuracy falsch
- **Datei:** `src/components/CategoryStats.jsx:20`
- **Code:** `totalAttempts += vocabProgress.attempts || 0`
- **Problem:** `attempts` existiert nicht im Datenmodell, nur `correct` und `incorrect`
- **Auswirkung:** Accuracy wird immer als 0% angezeigt
- **Fix:** `totalAttempts += (vocabProgress.correct || 0) + (vocabProgress.incorrect || 0)`

### 1.3 Comeback-King Achievement unmöglich
- **Datei:** `src/utils/achievements.js:166`
- **Code:** `condition: (progress) => false`
- **Problem:** Achievement ist NIEMALS erreichbar
- **Fix:** Match-State für Rückstand tracken und in Match.jsx bei finishMatch prüfen

### 1.4 Multiple-Choice Gewichtung mathematisch falsch
- **Datei:** `src/utils/multipleChoice.js:44`
- **Code:** `const chance = vocab.weight / 4`
- **Problem:** Max-Weight ist 3, nicht 4
- **Auswirkung:** Verzerrte Wahrscheinlichkeitsverteilung
- **Fix:** `const chance = vocab.weight / 3`

---

## 2. WICHTIGE BUGS (Priorität: HOCH)

### 2.1 GoalAnimation onComplete wird nie aufgerufen
- **Datei:** `src/components/Match.jsx:122` & `src/components/GoalAnimation.jsx:6`
- **Problem:** `onComplete` Parameter definiert aber nie übergeben
- **Fix:** Entweder Handler nutzen oder Parameter entfernen

### 2.2 Match-Ende Score-Bug
- **Datei:** `src/components/Match.jsx:118-122`
- **Problem:** `finalMsvGoals` liest alten State statt neuen nach letzter Antwort
- **Potenzial:** Letztes Tor wird möglicherweise nicht gezählt
- **Fix:** React State-Update prüfen, ggf. Callback-Pattern nutzen

### 2.3 Zeitzonen-Problem bei Daily Streak
- **Datei:** `src/utils/localStorage.js:274`
- **Code:** `const today = new Date().toDateString()`
- **Problem:** Verschiedene Zeitzonen können zu falschen Streak-Berechnungen führen
- **Fix:** UTC-basierte Datumsberechnung verwenden

---

## 3. TECHNISCHE SCHULDEN

### 3.1 Console.logs in Production (10+ Stellen)
```
src/components/Stadium.jsx:21-24 (Sound Test)
src/components/VocabCard.jsx:16 (Sound Init)
src/utils/sounds.js:22,31,33,38-40,72,81
src/utils/localStorage.js:31,58,73
```
**Fix:** Alle console.log entfernen oder durch Debug-Flag steuern

### 3.2 Debug-Button in UI
- **Datei:** `src/components/Stadium.jsx:78-84`
- **Problem:** "Sound testen" Button sollte nicht in Production sein
- **Fix:** Entfernen oder hinter Developer-Mode verstecken

### 3.3 Keine Error Boundaries
- **Problem:** App crasht komplett bei Runtime-Errors
- **Fix:** React Error Boundary Komponente implementieren

### 3.4 Keine Unit Tests
- **Problem:** Keine Testabdeckung, Regression-Risiko
- **Fix:** Jest/Vitest + React Testing Library einrichten

### 3.5 localStorage kann überlaufen
- **Problem:** `vocabProgress` unbegrenzt, bei vielen Vokabeln kann Quote überschritten werden
- **Fix:** Kompression oder IndexedDB für große Datenmengen

---

## 4. NICHT INTEGRIERTE / FEHLENDE FEATURES

### 4.1 STORYMODE (Fokus laut User!)
- **Status:** NICHT VORHANDEN
- **Konzept-Idee:**
  - Saison-basiertes Spielen (34 Spieltage wie echte Bundesliga)
  - Gegner-Reihenfolge nach echtem Spielplan
  - Saisonziele (Aufstieg, Klassenerhalt, Meisterschaft)
  - Pokal-Modus parallel (K.O.-Runden)
  - Story-Elemente zwischen Spielen
  - Trainer-Ansprachen
  - Transfer-System für neue Vokabel-Kategorien

### 4.2 Aus README geplant aber nicht implementiert
- [ ] Celebration Cards (teilbar)
- [ ] Eltern-Dashboard
- [ ] Erweiterte Statistiken
- [ ] Themen-Auswahl (Kategorie-Filter UI)
- [ ] Eigene Vokabeln hinzufügen
- [ ] Difficulty-Filter in Stadium UI

### 4.3 Filter-Funktionen existieren aber keine UI
- **Dateien:** `src/utils/spacedRepetition.js:103-121`
- `filterByCategory()` und `filterByDifficulty()` sind implementiert
- **Problem:** Kein UI um diese zu nutzen
- **Fix:** Filter-Buttons/Dropdown in Stadium.jsx

### 4.4 Match-History Detail-View
- **Problem:** History zeigt nur Zusammenfassung, keine Details
- **Fix:** Klickbare Match-Einträge mit Details (welche Vokabeln, Fehler, etc.)

---

## 5. UX / VISUELLES KONZEPT - VERBESSERUNGSPOTENZIAL

### 5.1 Aktuelle Stärken
- Stadion-Atmosphäre gut umgesetzt
- Streak-Effekte (Fire, Lightning) ansprechend
- Konfetti bei Sieg
- Sound-Design solide

### 5.2 Fehlende visuelle Elemente

#### Stadium-Screen
- [ ] Animierter Avatar/Spieler
- [ ] Trikot-Customization (MSV-Farben variieren)
- [ ] Liga-Badge prominent anzeigen
- [ ] Achievements als Badges sichtbar
- [ ] Daily Streak visualisieren (Flamme-Counter)
- [ ] Nächstes Ziel prominent (z.B. "Noch 50 Tore bis Regionalliga")

#### Match-Screen
- [ ] Torwart-Animation bei falscher Antwort
- [ ] Ball-Animation bei richtiger Antwort ins Tor
- [ ] Stadion-Publikum reagiert (Jubel/Pfiffe)
- [ ] Spielstand-Tafel im Stadion-Look
- [ ] Timer optional (für Challenges)
- [ ] Combo-Anzeige prominenter

#### Animationen
- [ ] Smooth Page-Transitions (nicht nur Cut)
- [ ] Loading-Skeleton statt Text
- [ ] Partikel-Effekte bei Achievements
- [ ] Screen-Shake bei Gegentor
- [ ] Goldene Glitzer bei Streak-Bonus

### 5.3 UX-Probleme

#### Feedback
- [ ] Vibrationen funktionieren nicht überall (iOS Safari)
- [ ] Kein Feedback bei Sound-Mute
- [ ] Keine Möglichkeit Sounds auszuschalten

#### Navigation
- [ ] Kein Zurück-Button im Match
- [ ] Kein Pause während Match
- [ ] Settings-Menü fehlt komplett
- [ ] Keine Onboarding-Tour

#### Accessibility
- [ ] ARIA Labels fehlen
- [ ] Keyboard Navigation nicht implementiert
- [ ] Farb-Kontraste teilweise zu niedrig
- [ ] Screen-Reader Support fehlt

---

## 6. PRIORISIERTE ROADMAP

### PHASE 1: Bug Fixes & Stabilität (Prio: KRITISCH)
1. [ ] Service Worker implementieren (sw.js)
2. [ ] CategoryStats Bug fixen
3. [ ] Comeback-King Achievement reparieren
4. [ ] Multiple-Choice Gewichtung korrigieren
5. [ ] Console.logs entfernen
6. [ ] Debug Sound-Button entfernen

### PHASE 2: Core Features
1. [ ] Filter UI für Kategorien/Schwierigkeit
2. [ ] Settings-Menü (Sound, Vibration, Reset)
3. [ ] Error Boundary Komponente
4. [ ] Match-History Details

### PHASE 3: Story Mode (Fokus!)
1. [ ] Saison-System Datenstruktur
2. [ ] 34 Spieltage generieren
3. [ ] Spieltag-Übersicht UI
4. [ ] Story-Elemente zwischen Spielen
5. [ ] Saisonziele und Belohnungen
6. [ ] Pokal-Modus (K.O.-System)

### PHASE 4: Visual & UX Upgrade
1. [ ] Avatar/Spieler-System
2. [ ] Erweiterte Animationen
3. [ ] Stadion-Atmosphäre verbessern
4. [ ] Page-Transitions
5. [ ] Loading States

### PHASE 5: Advanced Features
1. [ ] Celebration Cards (Share)
2. [ ] Eltern-Dashboard
3. [ ] Eigene Vokabeln
4. [ ] Offline-First mit Sync
5. [ ] Achievements erweitern

### PHASE 6: Polish
1. [ ] Accessibility (ARIA, Keyboard)
2. [ ] Unit Tests
3. [ ] Performance Optimierung
4. [ ] Documentation

---

## 7. DETAILLIERTE CODE-REFERENZEN

| Datei | Zeilen | Problem | Priorität |
|-------|--------|---------|-----------|
| `src/main.jsx` | 9 | SW Register ohne sw.js | KRITISCH |
| `src/components/CategoryStats.jsx` | 20 | `attempts` existiert nicht | KRITISCH |
| `src/utils/achievements.js` | 166 | `false` statt Logik | KRITISCH |
| `src/utils/multipleChoice.js` | 44 | `/4` statt `/3` | KRITISCH |
| `src/components/Match.jsx` | 118-122 | State-Timing | HOCH |
| `src/components/GoalAnimation.jsx` | 6 | Unused param | MITTEL |
| `src/utils/localStorage.js` | 274 | Zeitzone | MITTEL |
| `src/components/Stadium.jsx` | 21-24, 78-84 | Debug-Code | MITTEL |

---

## 8. STORY MODE KONZEPT (Detailliert)

### 8.1 Saison-Struktur
```javascript
const SEASON_STRUCTURE = {
  spieltage: 34,
  hinrunde: [1-17],   // Gegner A-Z
  rueckrunde: [18-34], // Gegner Z-A (Rückspiele)

  saisonziele: {
    meisterschaft: { rang: 1 },
    champions_league: { rang: [1-4] },
    europa_league: { rang: [5-7] },
    klassenerhalt: { rang: [1-15] },
    abstieg: { rang: [16-18] }
  }
}
```

### 8.2 Pokal-Modus
```javascript
const POKAL_STRUKTUR = {
  runde_1: 64,  // Alle Teams
  runde_2: 32,
  achtelfinale: 16,
  viertelfinale: 8,
  halbfinale: 4,
  finale: 2
}
```

### 8.3 Story-Elemente
- Pre-Match: Trainer-Ansprache
- Post-Match: Pressekonferenz
- Transfers: Neue Kategorien freischalten
- Events: Zufällige Ereignisse (Verletzung = schwierigere Vokabeln)
- Fan-Stimmung: Basierend auf Tabellen-Platz

---

## 9. METRIKEN FÜR PLATIN-NIVEAU

### Qualitäts-Kriterien
- [ ] 0 kritische Bugs
- [ ] 0 console.logs in Production
- [ ] Error Boundary implementiert
- [ ] PWA funktioniert offline
- [ ] Lighthouse Score > 90 (alle Kategorien)
- [ ] Unit Test Coverage > 60%

### Feature-Kriterien
- [ ] Story Mode vollständig spielbar
- [ ] Alle README Features implementiert
- [ ] Settings-Menü vorhanden
- [ ] Accessibility Basics erfüllt

### UX-Kriterien
- [ ] Smooth Animationen überall
- [ ] Konsistentes Visual Design
- [ ] Intuitive Navigation
- [ ] Feedback auf alle Aktionen
- [ ] Mobile-optimiert (Touch-Targets 44px+)

---

## NÄCHSTE SCHRITTE

1. **Sofort:** Kritische Bugs fixen (Phase 1)
2. **Diese Woche:** Core Features (Phase 2)
3. **Danach:** Story Mode Entwicklung starten

---

*Dokument erstellt: 29.12.2025*
*Nächste Review: Nach Phase 1 Completion*
