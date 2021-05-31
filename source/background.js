import optionsStorage from './options-storage.js'
import { readFromCache, removeExpiredItems, removeFromCache } from './cache'

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
 * @param {?Boolean} request.withMap Check for online status
 * @returns {Object}
 */
const queryPlayer = async (request) => {
  const key = `player:${request.steamId}`;
  const playerInfo = await readFromCache(key, async function () {
    await delay(request.key)
    const response = await fetch(`https://api.truckersmp.com/v2/player/${request.steamId}?ref=truckersmp-steam-helper&v=${cacheBusting()}`)

    return await response.json()
  })

  // Check if the user is not registered
  if (!playerInfo.data || playerInfo.data.error) {
    removeFromCache(key)

    if (request.withGames) {
      playerInfo.games = await queryGames(request)
    }
  } else {
    if (request.withMap && !playerInfo.data.response.banned) {
      playerInfo.online = await queryMap(playerInfo.data.response.id)
    }
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

const cacheBusting = () => {
  return Math.floor(Math.random() * 69420)
}

/**
 * Check user games
 * @param {Object} request Data object
 * @param {String} request.steamId Steam ID
 * @returns {Object}
 */
const queryGames = async (request) => {
  const response = await fetch(`https://steamcommunity.com/profiles/${request.steamId}/games/?xml=1&v=${cacheBusting()}`)
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
        break
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

/**
 * Check user online status
 * @param {string} id TruckersMP ID
 * @returns {Object}
 */
const queryMap = async (id) => {
  const mapData = await readFromCache(`map:${id}`, async function () {
    const response = await fetch(`https://traffic.krashnz.com/api/v2/user/${id}?ref=truckersmp-steam-helper&v=${cacheBusting()}`)

    return await response.json()
  }, 1)

  return !!(!mapData.data.error && mapData.data.response.online);
}

// Cache governor
removeExpiredItems()
browser.alarms.create({ periodInMinutes: 10.0 })
browser.alarms.onAlarm.addListener(removeExpiredItems)
