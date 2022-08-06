import optionsStorage from './options-storage.js'
import { readFromCache, removeExpiredItems, removeFromCache } from './cache'

import { XMLParser } from 'fast-xml-parser'

const TIMEOUT = 1.0

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
  const key = `player:${request.steamId}`
  const playerInfo = await readFromCache(key, async function () {
    await delay(request.key)
    const response = await fetch(`https://api.truckersmp.com/v2/player/${request.steamId}`)

    return await response.json()
  })

  // Grabbing games
  if (request.withGames) {
    playerInfo.games = await queryGames(request)
  }

  // Check if the user is not registered
  if (!playerInfo.data || playerInfo.data.error) {
    removeFromCache(key)
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
  const key = `games:${request.steamId}`
  const gamesData = await readFromCache(key, async function () {
    // Requesting the XML data
    const response = await fetch(`https://steamcommunity.com/profiles/${request.steamId}/games/?xml=1&v=${cacheBusting()}`)
    const data = await response.text()

    // Parsing XML data
    const parser = new XMLParser({
      ignoreDeclaration: true,
      ignorePiTags: true,
      processEntities: false,
      parseTagValue: false
    })
    const xmlDoc = parser.parse(data)

    /**
     * @typedef Game Game object
     * @param {String?} game.hoursOnRecord
     * @param {String} game.appID
     */

    /**
     * Array of games
     * @param {Object} xmlDoc
     * @param {Game[]} xmlDoc.gamesList.games.game
     */

      // We only need games data
    const gamesData = xmlDoc.gamesList.games.game

    // Games object for the template
    const games = {
      ets2: -1,
      ats: -1,
      all: -1,
      count: 0
    }

    // Games count, 0 means we don't need to go further
    games.count = gamesData.length
    if (!games.count) {
      return games
    }

    gamesData.forEach(game => {
      // Parse hoursOnRecord (if available)
      const gameTime = game.hoursOnRecord ? parseHours(game.hoursOnRecord) : 0

      // Grab hoursOnRecord for eligible games
      switch (game.appID) {
        case '227300':
          games.ets2 = gameTime
          break

        case '270880':
          games.ats = gameTime
          break
      }

      // Calculate all games time (for privacy checks)
      games.all += gameTime
    })

    return games
  }, 1)

  return gamesData.data
}

/**
 * Parse hours, minding the comma sign
 * @param {String} hours
 */
function parseHours (hours) {
  hours = hours.replaceAll(',', '')
  console.log('hours', hours)
  return Number.parseFloat(hours)
}

/**
 * Check user online status
 * @param {string} id TruckersMP ID
 * @returns {Object}
 */
const queryMap = async (id) => {
  const mapData = await readFromCache(`map:${id}`, async function () {
    const response = await fetch(`https://traffic.krashnz.com/api/v2/user/${id}?v=${cacheBusting()}`)

    return await response.json()
  }, 1)

  return !!(!mapData.data.error && mapData.data.response.online)
}

// Cache governor
removeExpiredItems()
browser.alarms.create({ periodInMinutes: TIMEOUT })
browser.alarms.onAlarm.addListener(removeExpiredItems)
