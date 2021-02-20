// eslint-disable-next-line import/no-unassigned-import
import optionsStorage from './options-storage.js'
import { readFromCache, removeExpiredItems } from './cache'

// Listeners for a content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.contentScriptQuery === 'queryPlayer') {
    queryPlayer(request).then(sendResponse)
  }

  if (request.contentScriptQuery === 'queryOptions') {
    queryOptions().then(sendResponse)
  }

  return true
})

// Return TruckersMP player data
const queryPlayer = async (request) => {
  return await readFromCache(request.steamId, async function () {
    const response = await fetch('https://api.truckersmp.com/v2/player/' + request.steamId + '?ref=truckersmp-steam-helper')
    return response.json()
  })
}

// Return extension options
const queryOptions = async (request) => {
  return await optionsStorage.getAll()
}

// Cache governor
chrome.alarms.create({ periodInMinutes: 10.0 })
chrome.alarms.onAlarm.addListener(removeExpiredItems)
