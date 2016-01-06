require('babel-register')
const r = require('ramda')
const shuffle = require('knuth-shuffle').knuthShuffle

const makeGame = function(p) {
  return [
    [p[0], p[1]],
    [p[2], p[3]],
  ]
}

const hasMet = function(games, one, two) {
  const hasMetInGame = function(game) {
    return r.contains(one, game[0]) && r.contains(two, game[1]) ||
      r.contains(one, game[1]) && r.contains(two, game[0])
  }
  return r.any(hasMetInGame, games)
}

const hasPlayedTogether = function(games, one, two) {
  const hasPlayedTogetherInGame = function(game) {
    return r.contains(one, game[0]) && r.contains(two, game[0]) ||
      r.contains(one, game[1]) && r.contains(two, game[1])
  }
  return r.any(hasPlayedTogetherInGame, games)
}

const playersForRound = function(courts, games, players) {
  const sorted = r.sort((p1, p2) => {
    return noOfGames(games, p1) > noOfGames(games, p2)
  }, players)
  return shuffle(sorted.slice(0, 4 * courts))
}

const makeSingleRound = function(courts, players) {
  return r.map((i) => {
    return makeGame(players.slice(i * courts, (i + 1) * courts))
  }, r.range(0, courts))
}

const availablePlayers = function(initial, unavailable) {
  const isUnavailable = r.contains(r.__, unavailable)
  return r.reject(isUnavailable, initial)
}

const noOfGames = function(games, player) {
  const containsPlayer = r.contains(player)
  return r.reduce((sum, game) => {
    return r.any(containsPlayer, game) ? sum + 1 : sum
  }, 0, games)
}

const scoreGame = function(games, g) {
  const playedTogetherWeight = 75
  const metWeight = 50
  const togetherScore = playedTogetherWeight * (
    hasPlayedTogether(games, g[0][0], g[0][1]) * 1 +
    hasPlayedTogether(games, g[0][0], g[0][1]) * 1)
  const metScore =  metWeight * (
    hasMet(games, g[0][0], g[1][0]) * 1 +
    hasMet(games, g[0][0], g[1][1]) * 1 +
    hasMet(games, g[0][1], g[1][0]) * 1 +
    hasMet(games, g[0][1], g[1][1]) * 1)

  return togetherScore + metScore
}

const makeManyRounds = function(courts, players, count = 100) {
  return r.map(
    (i) => {
      const p = shuffle(players.slice(0))
      return makeSingleRound(courts, p)
    }
    , r.range(0, count))
}

const scoreRound = function(games, round) {
  return r.reduce((sum, game) => {
    return sum + scoreGame(games, game)
  }, 0, round)
}

const getBestRound = function(games, rounds) {
  const scoreRoundWithGames = (round) => {
    return scoreRound(games, round)
  }
  return r.reduce(r.minBy(scoreRoundWithGames), r.take(4, games), rounds)
}

const gamesForPlayer = function(games, player) {
  return r.filter((g) => {
    return r.contains(player, r.flatten(g))
  }, games)
}

const scoreForGame = function(game) {
  if (!game[2]) return [0, 0]
  return r.reduce((score, set) => {
    const winner = set[0] > set[1] ? 0 : 1
    score[winner] = score[winner] + 5
    score[0] = score[0] + set[0] - set[1]
    score[1] = score[1] + set[1] - set[0]
    return score
  }, [0, 0], game[2])
}

const scoreForPlayer = function(games, player) {
  return r.reduce((sum, game) => {
    const team =  r.contains(player, game[0]) ? 0 : 1
    const score = scoreForGame(game)
    return sum + score[team]
  }, 0, gamesForPlayer(games, player)) / noOfGames(games, player)
}

const sortPlayersByScore = function(games, players) {
  return r.sort((p1, p2) => {
    return -(scoreForPlayer(games, p1) - scoreForPlayer(games, p2))
  }, players)
}

const NO_OF_COURTS = 4

const INITIAL_PLAYERS = [
'Andreas Eldh',
'Stefan Eldh',
'Farzan',
'Putte',
'Henryk Dolata',
'Filip Dolata',
'Henrik Nässén',
'Björn Johansson',
'Andreas Lindberg',
'Kent Rompala',
'Örjan Unnerstedt',
'Roger',
'Anders Holmberg',
'Micke Petterson',
'Anders Sellén',
'Göran Wikström',
'Eldrin Khan',
'Henning Lidholm',
'Per Engelöv',
]

const NOT_AVAILABLE = ['Göran Wikström']

const PLAYED_GAMES = [
  // round 1
  [ [ 'Filip Dolata', 'Göran Wikström' ],
    [ 'Anders Holmberg', 'Henning Lidholm' ], [[21,10], [21,14]] ],
  [ [ 'Per Engelöv', 'Andreas Lindberg' ],
    [ 'Roger', 'Anders Sellén' ], [[21,8],[21,10]] ],
  [ [ 'Micke Petterson', 'Örjan Unnerstedt' ],
    [ 'Björn Johansson', 'Kent Rompala' ], [[21,12], [21,12]] ],
  [ [ 'Henryk Dolata', 'Farzan' ],
    [ 'Henrik Nässén', 'Eldrin Khan' ], [[21,15], [21,14]] ],
  //[ 'Putte', 'Stefan Eldh', 'Andreas Eldh' ]

  // round 2
  [ [ 'Kent Rompala', 'Henryk Dolata' ],
    [ 'Göran Wikström', 'Roger' ], [[23,21], [21,12]] ],
  [ [ 'Andreas Eldh', 'Filip Dolata' ],
    [ 'Henrik Nässén', 'Björn Johansson' ], [[20,22], [20,22]] ],
  [ [ 'Andreas Lindberg', 'Eldrin Khan' ],
    [ 'Anders Holmberg', 'Micke Petterson' ], [[10,21], [16,21]] ],
  [ [ 'Anders Sellén', 'Farzan' ],
    [ 'Stefan Eldh', 'Örjan Unnerstedt' ], [[24,22], [14,21]] ],
  //[ 'Putte', 'Henning Lidholm', 'Per Engelöv' ]

  // round 3
  [ [ 'Henrik Nässén', 'Andreas Eldh' ],
    [ 'Anders Holmberg', 'Henryk Dolata' ], [[21,5], [21,16]] ],
  [ [ 'Andreas Lindberg', 'Göran Wikström' ],
    [ 'Örjan Unnerstedt', 'Eldrin Khan' ], [[20,22], [21,14]] ],
  [ [ 'Henning Lidholm', 'Roger' ],
    [ 'Anders Sellén', 'Björn Johansson' ], [[20,22], [20,22]] ],
  [ [ 'Kent Rompala', 'Micke Petterson' ],
    [ 'Stefan Eldh', 'Per Engelöv' ], [[17,21], [14,21]] ],
  //[ 'Farzan', 'Putte', 'Filip Dolata' ]

  // round 4
  [ [ 'Anders Holmberg', 'Filip Dolata' ],
    [ 'Kent Rompala', 'Stefan Eldh' ], [[22,20], [21,17]] ],
  [ [ 'Per Engelöv', 'Göran Wikström' ],
    [ 'Farzan', 'Roger' ], [[21,10], [21,10]] ],
  [ [ 'Anders Sellén', 'Henning Lidholm' ],
    [ 'Henrik Nässén', 'Micke Petterson' ], [[13,21], [20,22]] ],
  [ [ 'Andreas Eldh', 'Örjan Unnerstedt' ],
    [ 'Andreas Lindberg', 'Eldrin Khan' ], [[21,13], [21,19]] ],
  //[ 'Putte', 'Henryk Dolata', 'Björn Johansson' ]

  // round 5
  [ [ 'Anders Holmberg', 'Kent Rompala' ],
    [ 'Henryk Dolata', 'Anders Sellén' ], [[20,22], [21,16]] ],
  [ [ 'Örjan Unnerstedt', 'Per Engelöv' ],
    [ 'Henning Lidholm', 'Micke Petterson' ], [[21,12], [17,21]] ],
  [ [ 'Andreas Eldh', 'Stefan Eldh' ],
    [ 'Roger', 'Björn Johansson' ], [[21,13], [21,17]] ],
  [ [ 'Farzan', 'Andreas Lindberg' ],
    [ 'Göran Wikström', 'Filip Dolata' ], [[20,22], [18,21]] ],
  //[ 'Putte', 'Henrik Nässén', 'Eldrin Khan' ]

  // round 6
  [ [ 'Göran Wikström', 'Henryk Dolata' ],
    [ 'Roger', 'Stefan Eldh' ], [[17,21], [10,21]] ],
  [ [ 'Andreas Eldh', 'Anders Holmberg' ],
    [ 'Micke Petterson', 'Örjan Unnerstedt' ], [[21,19], [20,22]] ],
  [ [ 'Björn Johansson', 'Henning Lidholm' ],
    [ 'Eldrin Khan', 'Farzan' ], [[21,15], [21,15]] ],
  [ [ 'Per Engelöv', 'Anders Sellén' ],
    [ 'Filip Dolata', 'Henrik Nässén' ], [[11,21], [12,21]] ],
  // [ 'Putte', 'Andreas Lindberg', 'Kent Rompala' ]

  // round 7
  [ [ 'Kent Rompala', 'Henrik Nässén' ],
    [ 'Björn Johansson', 'Putte' ], [[19,21], [17,21]] ],
  [ [ 'Anders Sellén', 'Micke Petterson' ],
    [ 'Andreas Eldh', 'Farzan' ], [[11,21], [13,21]] ],
  [ [ 'Andreas Lindberg', 'Filip Dolata' ],
    [ 'Henning Lidholm', 'Henryk Dolata' ], [[21,14], [21,17]] ],
  [ [ 'Eldrin Khan', 'Per Engelöv' ],
    [ 'Stefan Eldh', 'Anders Holmberg' ], [[11,21], [19,21]] ],
  // [ 'Örjan Unnerstedt', 'Roger', 'Göran Wikström' ]

  // round 8
  [ [ 'Filip Dolata', 'Stefan Eldh' ],
    [ 'Örjan Unnerstedt', 'Andreas Eldh' ], [[21,14], [21,8]] ],
  [ [ 'Kent Rompala', 'Henryk Dolata' ],
    [ 'Björn Johansson', 'Henning Lidholm' ], [[23,25], [21,23]] ],
  [ [ 'Putte', 'Farzan' ],
    [ 'Andreas Lindberg', 'Roger' ], [[10,21], [13,21]] ],
  [ [ 'Henrik Nässén', 'Per Engelöv' ],
    [ 'Göran Wikström', 'Micke Petterson' ], [[21,11], [21,11]] ],
  // [ 'Anders Holmberg', 'Eldrin Khan', 'Anders Sellén' ]

  // round 9
  [ [ 'Andreas Eldh', 'Kent Rompala' ],
    [ 'Stefan Eldh', 'Henning Lidholm' ], [[17,21], [15,21]] ],
  [ [ 'Anders Sellén', 'Örjan Unnerstedt' ],
    [ 'Putte', 'Henryk Dolata' ], [[10,21], [16,21]] ],
  [ [ 'Anders Holmberg', 'Andreas Lindberg' ],
    [ 'Farzan', 'Björn Johansson' ], [[21,8], [21,11]] ],
  [ [ 'Filip Dolata', 'Roger' ],
    [ 'Henrik Nässén', 'Eldrin Khan' ], [[21,11], [21,13]] ],
  // [ 'Micke Petterson', 'Göran Wikström', 'Per Engelöv' ]

  // round 10
  [ [ 'Micke Petterson', 'Per Engelöv' ],
    [ 'Örjan Unnerstedt', 'Putte' ], [[19,21], [17,21]] ],
  [ [ 'Anders Sellén', 'Stefan Eldh' ],
    [ 'Björn Johansson', 'Andreas Lindberg' ], [[19,21], [13,21]] ],
  [ [ 'Eldrin Khan', 'Anders Holmberg' ],
    [ 'Henrik Nässén', 'Kent Rompala' ], [[15,21], [17,21]] ],
  [ [ 'Filip Dolata', 'Farzan' ],
    [ 'Henryk Dolata', 'Roger' ], [[21,17], [21,15]] ],
  // [ 'Andreas Eldh', 'Göran Wikström', 'Henning Lidholm' ]

  // round 11
  [ [ 'Anders Sellén', 'Andreas Lindberg' ],
    [ 'Henrik Nässén', 'Kent Rompala' ], [[27,29], [13,21]] ],
  [ [ 'Björn Johansson', 'Örjan Unnerstedt' ],
    [ 'Roger', 'Micke Petterson' ], [[17,21], [21,16]] ],
  [ [ 'Anders Holmberg', 'Per Engelöv' ],
    [ 'Andreas Eldh', 'Henning Lidholm' ], [[12,21], [21,17]] ],
  [ [ 'Putte', 'Stefan Eldh' ],
    [ 'Filip Dolata', 'Henryk Dolata' ], [[21,11], [21,18]] ],
  // [ 'Farzan', 'Eldrin Khan', 'Göran Wikström' ]

  // , [[,], [,]]
]

const makeNextRound = function() {
  return getBestRound(
    PLAYED_GAMES,
    makeManyRounds(
      NO_OF_COURTS,
      playersForRound(
        NO_OF_COURTS,
        PLAYED_GAMES,
        availablePlayers(INITIAL_PLAYERS, NOT_AVAILABLE)
      ),
      500
    )
  )
}

const makeFirstRound = function() {
  const players = shuffle(availablePlayers(INITIAL_PLAYERS, NOT_AVAILABLE))
  return makeSingleRound(NO_OF_COURTS, players)
}

const printMatchesPlayed = function() {
  console.log('\n\n————————————— Spelade matcher:\n')
  INITIAL_PLAYERS.forEach((p) => {
    console.log(`${p}: ${noOfGames(PLAYED_GAMES, p)}`)
  })
}
const printScore = function() {
  console.log('\n\n————————————— Poängställning:\n')
  sortPlayersByScore(PLAYED_GAMES, INITIAL_PLAYERS).forEach((p) => {
    console.log(`${p}: ${scoreForPlayer(PLAYED_GAMES, p)}`)
  })
}

const printRound = function(round) {
  console.log('\n\n————————————— Nästa runda:\n')
  console.log(round)
  const isPlaying = r.contains(r.__, r.flatten(round))
  console.log(r.reject(isPlaying, INITIAL_PLAYERS))
}

// printRound(makeFirstRound())
// printMatchesPlayed()
printScore()
//printRound(makeNextRound())
