import optionsStorage from './options-storage.js'
import { readFromCache, removeExpiredItems } from './cache'

// Listeners for a content scripts
browser.runtime.onMessage.addListener((request, _sender) => {
  if (request.query === 'player') {
    return Promise.resolve(queryPlayer(request))
  }

  if (request.query === 'options') {
    return Promise.resolve(queryOptions())
  }

  return true
})

const delay = (key) => new Promise(resolve => setTimeout(resolve, key * 150 + Math.random() * 10))

// Return TruckersMP player data
const queryPlayer = async (request) => {
  return await readFromCache(request.steamId, async function () {
    await delay(request.key)
    const response = await fetch('https://api.truckersmp.com/v2/player/' + request.steamId + '?ref=truckersmp-steam-helper')
    return await response.json()
  })
}

// Return extension options
const queryOptions = async (request) => {
  return await optionsStorage.getAll()
}

// Cache governor
removeExpiredItems()
browser.alarms.create({ periodInMinutes: 10.0 })
browser.alarms.onAlarm.addListener(removeExpiredItems)
