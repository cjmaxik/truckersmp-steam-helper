/**
 * Write to cache
 * @param {String} key Cache key
 * @param {Object} data Data to write
 * @param {Number} timeout Cache timeout (in ms)
 */
const writeToCache = (key, data, timeout) => {
  localStorage.setItem(key, JSON.stringify({
    data,
    timeout
  }))
}

/**
 * Read from cache
 * @param {String} key Cache key (Steam ID by default)
 * @param {Function} callback Callback function (if data is not cached)
 * @param {?Number} timeout Cache timeout (in minutes)
 * @returns {Object<Object, String>}
 */
const readFromCache = async (key, callback, timeout = 60) => {
  const cachedData = JSON.parse(localStorage.getItem(key)) || null
  const cacheTimeout = Date.now() + timeout * 60 * 1000

  // Return cached data
  if (cachedData && cachedData.timeout <= cacheTimeout && cachedData.data) {
    return cachedData
  }

  // Execute a callback, put response in a new cache entry
  removeFromCache(key)
  const data = await callback(key)
  writeToCache(key, data, cacheTimeout)

  // Return with timeout 0 to indicate an updated value
  return {
    data,
    timeout: cacheTimeout
  }
}

/**
 * Remove from cache
 * @param key
 */
const removeFromCache = (key) => {
  localStorage.removeItem(key)
}

/**
 * Remove expired items
 * Scheduled job
 */
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

    removeFromCache(key)
    console.log('Deleted stale key:', key)
  }

  console.log('Done')
  console.groupEnd()
}

const clearCache = () => {
  localStorage.clear()
}

export { readFromCache, removeFromCache, removeExpiredItems, clearCache }
