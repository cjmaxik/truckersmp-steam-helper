// eslint-disable-next-line import/no-unassigned-import
import optionsStorage from './options-storage.js'
import { readFromCache, removeExpiredItems } from './cache'

// Listeners for a content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.query === 'player') {
    queryPlayer(request).then(sendResponse)
  }

  if (request.query === 'options') {
    queryOptions().then(sendResponse)
  }

  return true
})

const delay = (key) => new Promise(resolve => setTimeout(resolve, key * 150 + Math.random() * 10))

// Return TruckersMP player data
const queryPlayer = async (request) => {
  return await readFromCache(request.steamId, async function () {
    await delay(request.key)
    const response = await fetch('https://api.truckersmp.com/v2/player/' + request.steamId + '?ref=truckersmp-steam-helper')
    return response.json()
  })
}

// Return extension options
const queryOptions = async (request) => {
  return await optionsStorage.getAll()
}

// Cache governor
removeExpiredItems()
chrome.alarms.create({ periodInMinutes: 10.0 })
chrome.alarms.onAlarm.addListener(removeExpiredItems)
