/* eslint-disable no-console, no-loop-func, prefer-spread */
// require('babel-register')
const r = require('ramda')
const PLAYED_GAMES = require('./results')
const { PLAYERS } = require('./stadium')

const WINNER_BONUS = 10
const ONLY_OWN_POINTS_COUNT = true

const noOfGames = (games, player) => {
  return gamesForPlayer(games, player).length
}

const gamesForPlayer = r.curry((games, player) => {
  return r.filter(g => {
    return r.contains(player, r.flatten(g))
  }, games)
})

const scoreForGame = game => {
  if (!game[2]) return [0, 0]
  return r.reduce(
    (score, set) => {
      const winner = set[0] > set[1] ? 0 : 1
      score[winner] = score[winner] + WINNER_BONUS

      if (ONLY_OWN_POINTS_COUNT) {
        score[0] = score[0] + set[0]
        score[1] = score[1] + set[1]
      } else {
        score[0] = score[0] + set[0] - set[1]
        score[1] = score[1] + set[1] - set[0]
      }

      return score
    },
    [0, 0],
    game[2]
  )
}

const scoreForPlayer = r.curry((games, player) => {
  return (
    r.reduce(
      (sum, game) => {
        // console.log(game, 'game')
        const team = r.contains(player, game[0]) ? 0 : 1
        const score = scoreForGame(game)
        // console.log(sum + score[team])
        return sum + score[team]
      },
      0,
      gamesForPlayer(games, player)
    ) / noOfGames(games, player)
  )
})

const sortPlayersByScore = r.curry((games, players) => {
  return r.sort((p1, p2) => {
    return -(scoreForPlayer(games, p1) - scoreForPlayer(games, p2))
  }, players)
})

const printMatchesPlayed = () => {
  console.log('\n\n————————————— Spelade matcher:\n')
  PLAYERS.forEach(p => {
    console.log(`${p}: ${noOfGames(PLAYED_GAMES, p)}`)
  })
}
const printScore = () => {
  console.log('\n\n————————————— Poängställning:\n')
  sortPlayersByScore(PLAYED_GAMES, PLAYERS).forEach(p => {
    console.log(`${p}: ${scoreForPlayer(PLAYED_GAMES, p)}`)
  })
}

module.exports = { printScore, printMatchesPlayed }
