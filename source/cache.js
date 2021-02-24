const writeToCache = (steamId, data, timeout) => {
  localStorage.setItem(steamId, JSON.stringify({ data, timeout }))
}

const readFromCache = async (steamId, callback) => {
  const cachedData = JSON.parse(localStorage.getItem(steamId)) || null
  const cacheTimeout = Date.now() + 3600 * 1000

  // Return cached data
  if (cachedData && cachedData.timeout <= cacheTimeout && cachedData.data) {
    return cachedData
  }

  // Execute a callback, put response in a new cache entry
  localStorage.removeItem(steamId)
  const data = await callback(steamId)
  writeToCache(steamId, data, cacheTimeout)

  // Return with timeout 0 to indicate an updated value
  return { data, timeout: 0 }
}

const removeExpiredItems = () => {
  const currentDate = Date.now()

  console.groupCollapsed('Cache cleanup: ' + new Date(currentDate).toUTCString())
  for (const key in localStorage) {
    // eslint-disable-next-line no-prototype-builtins
    if (!localStorage.hasOwnProperty(key)) {
      continue
    }

    const cachedData = JSON.parse(localStorage.getItem(key)) || null

    if (cachedData && currentDate <= cachedData.timeout) {
      continue
    }

    localStorage.removeItem(key)
    console.log('Deleted stale key:', key)
  }

  console.log('Done')
  console.groupEnd()
}

export { readFromCache, removeExpiredItems }
