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

// console.log('———————————————— \n'
  // ,makeSingleRound(NO_OF_COURTS, playersForRound(NO_OF_COURTS, PLAYED_GAMES, INITIAL_PLAYERS))
  // , getBestRound(PLAYED_GAMES, makeManyRounds(NO_OF_COURTS, playersForRound(NO_OF_COURTS, PLAYED_GAMES, INITIAL_PLAYERS), 100))
  // , scoreGame(PLAYED_GAMES, [['Andreas','Test1'],['Putte','Farzan']])
  // , scoreGame(PLAYED_GAMES, [['Andreas','Pelle'],['Putte','Farzan']])
  // , scoreGame(PLAYED_GAMES, [['Andreas','Henryk'],['Filip','Farzan']])
  // , scoreGame(PLAYED_GAMES, [['Andreas','Henryk'],['Filip','Test1']])
  // , scoreGame(PLAYED_GAMES, [['Andreas','Stefan'],['Filip','Test1']])
  // , scoreGame(PLAYED_GAMES, [['Henryk','Andreas'],['Farzan','Tränk']])
  // , scoreGame(PLAYED_GAMES, [['Stefan','Andreas'],['Test3','Test1']])
  // ,availablePlayers(INITIAL_PLAYERS, notAvailable)
// )
// console.log('END ———————————————— \n')

const NO_OF_COURTS = 4

const INITIAL_PLAYERS = [
'Andreas',
'Stefan',
'Farzan',
'Putte',
'Pelle',
'Henryk',
'Filip',
'Tränk',
'Anders',
'Björn',
'Test2',
'Test3',
'Test4',
'Test5',
'Test6',
'Test7',
'Test8',
'Test9',
'Test10',
'Test11',
'Test12',
'Test13',
'Test14',
'Test15',
]

const NOT_AVAILABLE = ['Test4', 'Andreas']

const PLAYED_GAMES = [
  [ [ 'Andreas','Stefan' ],[ 'Putte','Farzan' ] ],
  [ [ 'Pelle','Henryk' ],[ 'Filip','Tränk' ] ],
  [ [ 'Anders','Björn' ],[ 'Test2','Test3' ] ],
  [ [ 'Test7','Test6' ],[ 'Andreas','Filip' ] ],
  [ [ 'Test11', 'Test5' ], [ 'Tränk', 'Putte' ] ],
  [ [ 'Test12', 'Farzan' ], [ 'Test4', 'Test13' ] ],
  [ [ 'Stefan', 'Test10' ], [ 'Test14', 'Pelle' ] ],
  [ [ 'Test9', 'Test2' ], [ 'Test5', 'Henryk' ] ],
  [ [ 'Test7', 'Test14' ], [ 'Björn', 'Test4' ] ],
  [ [ 'Test12', 'Test6' ], [ 'Test8', 'Test3' ] ],
  [ [ 'Tränk', 'Henryk' ], [ 'Test10', 'Stefan' ] ],
  [ [ 'Test7', 'Filip' ], [ 'Test11', 'Test9' ] ],
  [ [ 'Test13', 'Test12' ], [ 'Andreas', 'Test15' ] ],
  [ [ 'Test4', 'Test8' ], [ 'Pelle', 'Test15' ] ],
  [ [ 'Test3', 'Test11' ], [ 'Farzan', 'Test5' ] ],
  [ [ 'Test13', 'Putte' ], [ 'Test2', 'Test9' ] ],
  [ [ 'Test6', 'Test10' ], [ 'Test12', 'Test2' ] ],
  [ [ 'Anders', 'Test8' ], [ 'Test4', 'Test11' ] ],
  [ [ 'Farzan', 'Björn' ], [ 'Test9', 'Test5' ] ],
  [ [ 'Test14', 'Test15' ], [ 'Filip', 'Tränk' ] ],
  [ [ 'Test15', 'Test3' ], [ 'Stefan', 'Andreas' ] ],
  [ [ 'Filip', 'Henryk' ], [ 'Test14', 'Björn' ] ],
  [ [ 'Pelle', 'Test10' ], [ 'Putte', 'Test13' ] ],
  [ [ 'Filip', 'Anders' ], [ 'Putte', 'Test8' ] ],
  [ [ 'Andreas', 'Pelle' ], [ 'Björn', 'Anders' ] ],
  [ [ 'Test7', 'Test4' ], [ 'Henryk', 'Test2' ] ],
  [ [ 'Test13', 'Tränk' ], [ 'Farzan', 'Test3' ] ],
  [ [ 'Test14', 'Stefan' ], [ 'Test6', 'Test5' ] ],
  [ [ 'Test12', 'Test8' ], [ 'Björn', 'Henryk' ] ],
  [ [ 'Test5', 'Test2' ], [ 'Test11', 'Test9' ] ],
  [ [ 'Test10', 'Test4' ], [ 'Stefan', 'Anders' ] ],
  [ [ 'Tränk', 'Test15' ], [ 'Test7', 'Test6' ] ],
  [ [ 'Test11', 'Test14' ], [ 'Putte', 'Andreas' ] ],
  [ [ 'Pelle', 'Anders' ], [ 'Test12', 'Test3' ] ],
  [ [ 'Test9', 'Test7' ], [ 'Test10', 'Farzan' ] ],
  [ [ 'Test13', 'Test6' ], [ 'Test4', 'Test8' ] ],
  [ [ 'Henryk', 'Test7' ], [ 'Anders', 'Putte' ] ],
  [ [ 'Björn', 'Test3' ], [ 'Pelle', 'Test9' ] ],
  [ [ 'Test8', 'Test15' ], [ 'Tränk', 'Test2' ] ],
  [ [ 'Filip', 'Test6' ], [ 'Test5', 'Farzan' ] ],
  [ [ 'Test11', 'Test6' ], [ 'Stefan', 'Test10' ] ],
  [ [ 'Test7', 'Farzan' ], [ 'Test13', 'Test14' ] ],
  [ [ 'Björn', 'Test5' ], [ 'Test12', 'Test15' ] ],
  [ [ 'Test9', 'Test3' ], [ 'Test2', 'Test8' ] ],
  [ [ 'Test5', 'Anders' ], [ 'Test11', 'Stefan' ] ],
  [ [ 'Test8', 'Pelle' ], [ 'Test7', 'Test10' ] ],
  [ [ 'Test14', 'Henryk' ], [ 'Test15', 'Test13' ] ],
  [ [ 'Test12', 'Filip' ], [ 'Putte', 'Tränk' ] ],
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
      100
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

const printRound = function(round) {
  console.log('\n\n————————————— Nästa runda:\n')
  console.log(round)
}

// console.log(makeFirstRound())
printMatchesPlayed()
printRound(makeNextRound())
