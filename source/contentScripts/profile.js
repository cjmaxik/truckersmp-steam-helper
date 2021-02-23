const template = require('../templates/profile.hbs')

const init = () => {
  return chrome.runtime.sendMessage(
    {
      query: 'options'
    },
    (options) => {
      let steamId = null
      steamId = getSteamId()

      if (!steamId) {
        console.log('steamId cannot be found! Aborted.')
        return
      }

      if (options.showInProfile) renderPlayerInfo(steamId, options)
    }
  )
}

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

const renderPlayerInfo = (steamId, options) => {
  chrome.runtime.sendMessage(
    {
      query: 'player',
      steamId,
      key: 0
    },
    (playerInfo) => {
      let player = null
      if (playerInfo.data && !playerInfo.data.error) {
        player = playerInfo.data.response
      }

      return render(player, options, playerInfo.data.timeout !== 0)
    }
  )
}

const render = (player, options, isCached) => {
  if (player) {
    player = currentTier(player)
  }

  const mainSelector = 'div.profile_leftcol'
  let mainTarget = 'beforeBegin'
  let selector = mainSelector
  if (!options.showFirstInProfile) {
    selector += ' > :last-child'
  } else {
    selector += ' > :first-child'
  }

  selector = document.querySelector(selector)
  if (!selector) {
    selector = document.querySelector(mainSelector)
    mainTarget = 'afterBegin'
  }

  selector.insertAdjacentHTML(mainTarget, template(
    {
      ...player, ...options, isCached, iconURL: chrome.extension.getURL('icons/tmp.png')
    }
  ))
}

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
