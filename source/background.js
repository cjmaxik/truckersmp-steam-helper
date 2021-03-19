import optionsStorage from './options-storage.js'
import { readFromCache, removeExpiredItems } from './cache'

// Listeners for a content scripts
browser.runtime.onMessage.addListener((request, _sender) => {
  let response = null

  switch (request.query) {
    case 'player':
      response = queryPlayer(request)
      break

    case 'options':
      response = queryOptions()
      break
  }

  return Promise.resolve(response)
})

/**
 * Queue delay
 * @param key Index key to delay
 * @return {Promise<Function>}
 */
const delay = (key) => new Promise(resolve => setTimeout(resolve, key * 150 + Math.random() * 10))

/**
 * Return TruckersMP player data
 * @param {Object} request Data object
 * @param {String} request.steamId Steam ID
 * @param {String} request.key Delay key
 * @param {?Boolean} request.withGames Check for games if no TMP profile
 * @returns {Object}
 */
const queryPlayer = async (request) => {
  const playerInfo = await readFromCache(request.steamId, async function () {
    await delay(request.key)
    const response = await fetch(`https://api.truckersmp.com/v2/player/${request.steamId}?ref=truckersmp-steam-helper`)
    return await response.json()
  })

  if ((!playerInfo.data || playerInfo.data.error) && request.withGames) {
    playerInfo.games = await queryGames(request)
  }

  return playerInfo
}

/**
 * Return extension options
 * @returns {Object}
 */
const queryOptions = async () => {
  return await optionsStorage.getAll()
}

/**
 * Check user games
 * @param {Object} request Data object
 * @param {String} request.steamId Steam ID
 */
const queryGames = async (request) => {
  const response = await fetch(`https://steamcommunity.com/profiles/${request.steamId}/games/?xml=1`)
  const data = await response.text()

  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(data, 'text/xml')

  const gamesData = xmlDoc.getElementsByTagName('game')

  const games = {
    ets2: -1,
    ats: -1,
    all: -1,
    count: 0
  }

  const gamesArray = Array.from(gamesData)
  games.count = gamesArray.length
  if (!games.count) {
    return games
  }

  gamesArray.forEach((game) => {
    // Check for the game existence
    const gameID = game.getElementsByTagName('appID')[0].textContent

    switch (gameID) {
      case '227300':
        games.ets2 = 0
        break

      case '270880':
        games.ats = 0
        return
    }

    // Check the game time
    const hoursOnRecord = game.getElementsByTagName('hoursOnRecord')[0]
    if (hoursOnRecord) {
      const gameTime = Number.parseFloat(hoursOnRecord.textContent)

      if (['227300', '270880'].includes(gameID)) {
        switch (gameID) {
          case '227300':
            games.ets2 = gameTime
            break

          case '270880':
            games.ats = gameTime
        }
      } else {
        games.all += gameTime
      }
    }
  })

  return games
}

// Cache governor
removeExpiredItems()
browser.alarms.create({ periodInMinutes: 10.0 })
browser.alarms.onAlarm.addListener(removeExpiredItems)
