/* eslint-disable no-console, no-loop-func, prefer-spread */
// require('babel-register')
const r = require('ramda')
const shuffle = require('knuth-shuffle').knuthShuffle
const PLAYED_GAMES = require('./results')
const { PLAYERS, NOT_AVAILABLE, NO_OF_COURTS } = require('./stadium')
const mapIndexed = r.addIndex(r.map)

const makeGame = r.curry(p => {
  return [[p[0], p[1]], [p[2], p[3]]]
})

const hasMet = r.curry((games, one, two) => {
  const hasMetInGame = game => {
    return (
      (r.contains(one, game[0]) && r.contains(two, game[1])) || (r.contains(one, game[1]) && r.contains(two, game[0]))
    )
  }
  return r.any(hasMetInGame, games)
})

const hasPlayedTogether = r.curry((games, one, two) => {
  const hasPlayedTogetherInGame = game => {
    return (
      (r.contains(one, game[0]) && r.contains(two, game[0])) || (r.contains(one, game[1]) && r.contains(two, game[1]))
    )
  }
  return r.any(hasPlayedTogetherInGame, games)
})

const playersForRound = r.curry((courts, games, players) => {
  const sorted = r.sort((p1, p2) => {
    return noOfGames(games, p1) > noOfGames(games, p2)
  }, players)
  return shuffle(sorted.slice(0, 4 * courts))
})

const availablePlayers = r.curry((initial, unavailable) => {
  const isUnavailable = r.contains(r.__, unavailable)
  return r.reject(isUnavailable, initial)
})

const noOfGames = (games, player) => {
  return gamesForPlayer(games, player).length
}

const scoreGame = r.curry((playedGames, g) => {
  const playedTogetherWeight = 75
  const metWeight = 25
  const hasMetAlready = hasMet(playedGames)
  const togetherScore =
    playedTogetherWeight *
    (hasPlayedTogether(playedGames, g[0][0], g[0][1]) * 1 + hasPlayedTogether(playedGames, g[0][0], g[0][1]) * 1)
  const metScore =
    metWeight *
    (hasMetAlready(g[0][0], g[1][0]) * 1 +
      hasMetAlready(g[0][0], g[1][1]) * 1 +
      hasMetAlready(g[0][1], g[1][0]) * 1 +
      hasMetAlready(g[0][1], g[1][1]) * 1)

  return togetherScore + metScore
})

const makeSingleRound = r.curry((courts, players) => {
  const usedCourts = Math.min(courts, Math.floor(players.length / 4))
  return r.map(i => {
    return makeGame(players.slice(i * 4, (i + 1) * 4))
  }, r.range(0, usedCourts))
})

const makePairs = (one, allOthers) => {
  return r.map(r.pair(one), allOthers)
}

const allPairs = players => {
  return [].concat.apply(
    [],
    mapIndexed((p, i) => {
      const playersCopy = players.slice(0)
      return makePairs(p, playersCopy.slice(i + 1))
    }, players)
  )
}

const allGames = players => {
  return r.filter(game => r.allUniq(r.flatten(game)), allPairs(allPairs(players)))
}

const filterOutGamesWithPlayers = (games, players) => {
  const playersIsInGame = game => {
    return !r.allUniq(r.flatten(players.concat(game)))
  }
  return r.reject(playersIsInGame, games)
}

const getBestRound = (sortedGames, depth, playedGames) => {
  let filteredGames = sortedGames
  let res = []
  for (let i = 0; i < 2000; i++) {
    filteredGames = r.slice(i, Infinity, sortedGames)
    res = r.append(
      r.reduce(
        val => {
          filteredGames = filterOutGamesWithPlayers(filteredGames, r.flatten(val))
          if (!filteredGames.length) return val
          return r.append(r.head(filteredGames), val)
        },
        [],
        r.range(0, depth)
      ),
      res
    )
  }
  return r.head(r.sortBy(scoreRound(playedGames), r.filter(round => round.length === depth, res)))
}

const scoreRound = r.curry((games, round) => {
  return r.reduce(
    (sum, game) => {
      return sum + scoreGame(games, game)
    },
    0,
    round
  )
})

const gamesForPlayer = r.curry((games, player) => {
  return r.filter(g => {
    return r.contains(player, r.flatten(g))
  }, games)
})

const makeNextRound = () => {
  const usedCourts = Math.min(NO_OF_COURTS, Math.floor(PLAYERS.length / 4))

  return getBestRound(
    allGames(playersForRound(usedCourts, PLAYED_GAMES, availablePlayers(PLAYERS, NOT_AVAILABLE))),
    usedCourts,
    PLAYED_GAMES
  )
}

const makeFirstRound = () => {
  const players = shuffle(availablePlayers(PLAYERS, NOT_AVAILABLE))
  return makeSingleRound(NO_OF_COURTS, players)
}
const printRound = round => {
  console.log('\n\n\n\n————————————— Nästa runda —————————————\n')
  console.log(
    round
      .map(game => `[\n  [\'${game[0].join("', '")}\'],\n  [\'${game[1].join("', '")}\'],\n  [[0, 0], [0, 0]]\n],`)
      .join('\n\n')
  )
  console.log('\n')
  // console.log(round)
  const isPlaying = r.contains(r.__, r.flatten(round))
  console.log('\n\n————————————— Står över —————————————\n')
  console.log(r.reject(isPlaying, PLAYERS).join('\n'))
}

module.exports = { makeFirstRound, makeNextRound, printRound }
