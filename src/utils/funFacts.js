/**
 * Football Fun Facts for Maurice
 * Format: { fact: "statement", isTrue: boolean, explanation: "why true/false" }
 */

export const FOOTBALL_FUN_FACTS = [
  // MSV Duisburg Facts
  {
    fact: "MSV Duisburg wurde 1902 gegründet und ist damit über 120 Jahre alt",
    isTrue: true,
    explanation: "Richtig! Der MSV Duisburg wurde am 1. Januar 1902 gegründet und gehört zu den traditionsreichsten deutschen Fußballvereinen."
  },
  {
    fact: "MSV Duisburg hat noch nie in der Bundesliga gespielt",
    isTrue: false,
    explanation: "Falsch! MSV Duisburg spielte von 1963 bis 1982 insgesamt 19 Jahre in der Bundesliga."
  },
  {
    fact: "Die MSV-Arena (früher Schauinsland-Reisen-Arena) fasst über 30.000 Zuschauer",
    isTrue: true,
    explanation: "Richtig! Die MSV-Arena hat eine Kapazität von 31.500 Zuschauern."
  },
  {
    fact: "MSV Duisburg gewann 1966 den DFB-Pokal",
    isTrue: false,
    explanation: "Falsch! MSV Duisburg war 1966 im Finale, verlor aber gegen Bayern München. Sie gewannen den DFB-Pokal 2011."
  },
  {
    fact: "Bernard Dietz, eine MSV-Legende, wurde 1980 Fußballer des Jahres",
    isTrue: true,
    explanation: "Richtig! Bernard Dietz ist eine absolute MSV-Legende und wurde 1980 zu Deutschlands Fußballer des Jahres gewählt."
  },

  // General Football Facts
  {
    fact: "Ein Fußballfeld ist genau 100 Meter lang",
    isTrue: false,
    explanation: "Falsch! Ein Fußballfeld ist zwischen 90 und 120 Meter lang. Die FIFA-Norm für internationale Spiele liegt bei 100-110 Metern."
  },
  {
    fact: "Der schnellste je gemessene Schuss lag bei über 200 km/h",
    isTrue: true,
    explanation: "Richtig! Der härteste je gemessene Schuss kam von Ronny Heberson mit 211 km/h im Jahr 2006."
  },
  {
    fact: "Pelé erzielte in seiner Karriere über 1.000 Tore",
    isTrue: true,
    explanation: "Richtig! Pelé schoss 1.281 Tore in 1.363 Spielen – eine unglaubliche Leistung!"
  },
  {
    fact: "Die Rückennummer 10 wird traditionell dem besten Spieler gegeben",
    isTrue: true,
    explanation: "Richtig! Legenden wie Maradona, Pelé, Messi und Zidane trugen alle die berühmte Nummer 10."
  },
  {
    fact: "Ein Fußballspiel dauert genau 90 Minuten, ohne Ausnahme",
    isTrue: false,
    explanation: "Falsch! Durch Nachspielzeit dauern die meisten Spiele 92-96 Minuten. Bei K.O.-Spielen kann es auch Verlängerung geben."
  },
  {
    fact: "Der Begriff 'Hattrick' kommt vom Cricket",
    isTrue: true,
    explanation: "Richtig! Der Begriff stammt aus dem Cricket, wo ein Spieler, der drei Wickets in Folge holte, einen Hut geschenkt bekam."
  },
  {
    fact: "Lionel Messi hat 8 Mal den Ballon d'Or gewonnen",
    isTrue: true,
    explanation: "Richtig! Messi gewann 2023 seinen achten Ballon d'Or – ein absoluter Rekord!"
  },
  {
    fact: "Die Bundesliga wurde 1953 gegründet",
    isTrue: false,
    explanation: "Falsch! Die Bundesliga wurde erst 1963 gegründet. Vorher gab es die Oberliga als höchste Spielklasse."
  },
  {
    fact: "Bayern München ist der deutsche Rekordmeister",
    isTrue: true,
    explanation: "Richtig! Bayern München hat über 30 Meisterschaften gewonnen – absoluter Rekord in Deutschland."
  },
  {
    fact: "Die WM 2014 in Brasilien gewann Deutschland im Finale gegen Argentinien",
    isTrue: true,
    explanation: "Richtig! Deutschland siegte 1:0 nach Verlängerung durch ein Tor von Mario Götze."
  },
  {
    fact: "Ein Elfmeter wird immer vom Elfmeterpunkt geschossen",
    isTrue: false,
    explanation: "Falsch! Der Punkt heißt 'Strafstoßpunkt' und liegt genau 11 Meter (12 Yards) vor dem Tor."
  },
  {
    fact: "Cristiano Ronaldo ist der Rekordtorschütze der Champions League",
    isTrue: true,
    explanation: "Richtig! CR7 hat über 140 Tore in der Champions League geschossen – Rekord!"
  },
  {
    fact: "Die Gelbe Karte wurde erst in den 1990er Jahren eingeführt",
    isTrue: false,
    explanation: "Falsch! Gelbe und Rote Karten wurden 1970 bei der WM in Mexiko eingeführt."
  },
  {
    fact: "Ein Fußball muss genau 68-70 cm Umfang haben",
    isTrue: true,
    explanation: "Richtig! Ein offizieller FIFA-Ball hat einen Umfang von 68-70 cm und wiegt 410-450 Gramm."
  },
  {
    fact: "Der Begriff 'Abseitsfalle' beschreibt eine defensive Taktik",
    isTrue: true,
    explanation: "Richtig! Die Abseitsfalle ist eine Technik, bei der die Verteidigung nach vorne rückt, um Gegner ins Abseits zu stellen."
  },
  {
    fact: "Jeder Spieler darf im Spiel nur einmal ausgewechselt werden",
    isTrue: false,
    explanation: "Falsch! Ein Spieler, der ausgewechselt wurde, darf nicht wieder eingewechselt werden. Aber das Team kann 5 Wechsel vornehmen (seit 2020)."
  },
  {
    fact: "Die meisten Fußballer sind Rechtsfüßer",
    isTrue: true,
    explanation: "Richtig! Etwa 80% aller Fußballer sind Rechtsfüßer, ähnlich wie in der Gesamtbevölkerung."
  },
  {
    fact: "Der Torwart ist der einzige Spieler, der den Ball mit der Hand spielen darf",
    isTrue: true,
    explanation: "Richtig! Aber nur im eigenen Strafraum. Außerhalb gilt er als normaler Feldspieler."
  },
  {
    fact: "Fußball ist die beliebteste Sportart der Welt",
    isTrue: true,
    explanation: "Richtig! Über 4 Milliarden Menschen weltweit interessieren sich für Fußball."
  }
]

/**
 * Get a random fun fact
 */
export const getRandomFunFact = () => {
  const randomIndex = Math.floor(Math.random() * FOOTBALL_FUN_FACTS.length)
  return FOOTBALL_FUN_FACTS[randomIndex]
}

/**
 * Get time-based greeting
 */
export const getTimeBasedGreeting = () => {
  const hour = new Date().getHours()

  if (hour < 6) {
    return "Gute Nacht" // 0-5
  } else if (hour < 12) {
    return "Guten Morgen" // 6-11
  } else if (hour < 18) {
    return "Moin" // 12-17
  } else if (hour < 22) {
    return "Guten Abend" // 18-21
  } else {
    return "Gute Nacht" // 22-23
  }
}
