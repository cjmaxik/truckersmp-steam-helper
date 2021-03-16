const Handlebars = require('handlebars/runtime')
Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 === arg2) ? options.fn(this) : options.inverse(this)
})

const profileTemplate = require('../templates/profile.hbs')
const noProfileTemplate = require('../templates/noProfile.hbs')

const init = () => {
  browser.runtime.sendMessage(
    {
      query: 'options'
    }
  ).then((options) => {
    let steamId = null
    steamId = getSteamId()

    if (!steamId) {
      console.log('steamId cannot be found! Aborted.')
      return
    }

    if (options.showInProfile) queryPlayer(steamId, options)
  })
}

/**
 * Find and return Steam ID
 * @return {String|null} SteamID
 */
const getSteamId = () => {
  if (document.querySelector('#reportAbuseModal')) {
    return document.querySelector('input[name=abuseID]').value
  } else {
    const profileData = document.querySelector('div.responsive_page_template_content > script').innerText
    const regex = /"steamid":"(\d{17})"/gm

    const data = regex.exec(profileData)
    if (data !== null && data[1].length === 17 && data[1].startsWith('765611')) {
      return data[1].toString()
    }
  }

  return null
}

/**
 * Query player from TruckersMP API
 * @param {String} steamId
 * @param {Object} options
 */
const queryPlayer = (steamId, options) => {
  browser.runtime.sendMessage(
    {
      query: 'player',
      steamId: steamId,
      key: 0,
      withGames: true
    }
  ).then((playerInfo) => {
    if (playerInfo.data && !playerInfo.data.error) {
      return renderProfile(playerInfo.data.response, options, playerInfo.data.timeout !== 0)
    }
    console.warn('Something wrong with TruckersMP data! Looking for the games on Steam profile...', playerInfo)

    if (playerInfo.games) {
      return renderNoProfile(playerInfo.games, options)
    }
    console.error('Something wrong with the Steam profile! Aborted.')
  })
}

/**
 * Render block for not registered user
 * @param {Object} games
 * @param {Object} options
 */
const renderNoProfile = (games, options) => {
  const template = noProfileTemplate({
    ...games,
    ...options,
    iconURL: browser.extension.getURL('icons/tmp.png')
  })

  insertTemplate(template)
}

/**
 * Render profile with TruckersMP data
 * @param {Object} player
 * @param {Object} options
 * @param {Boolean} isCached
 */
const renderProfile = (player, options, isCached) => {
  if (player) {
    player = currentTier(player)
  }

  const template = profileTemplate({
    ...player,
    ...options,
    isCached,
    iconURL: browser.extension.getURL('icons/tmp.png')
  })

  insertTemplate(template)
}

/**
 * Insert template
 * @param {String} template
 */
const insertTemplate = (template) => {
  const fallbackSelector = 'div.profile_leftcol'
  const mainSelector = fallbackSelector + ' > :first-child'
  let mainTarget = 'beforebegin'

  let selector = document.querySelector(mainSelector)
  if (!selector) {
    selector = document.querySelector(fallbackSelector)
    mainTarget = 'afterbegin'
  }

  selector.insertAdjacentHTML(mainTarget, template)
}

/**
 * Describe Patreon tier for the player
 * @param {Object} player
 * @param {Object} player.patreon
 * @param {Number} player.patreon.tierId
 * @param {Number} player.patreon.currentPledge
 * @return {*}
 */
const currentTier = (player) => {
  let currentTier = null

  switch (player.patreon.tierId) {
    case 3822370:
      currentTier = 'Trucker tier'
      break

    case 3825320:
      currentTier = 'Fan tier'
      break

    case 3894844:
      currentTier = 'Master Trucker tier'
      break

    default:
      currentTier = '$' + player.patreon.currentPledge / 100
      break
  }
  player.patreon.currentTier = currentTier

  return player
}

init()
