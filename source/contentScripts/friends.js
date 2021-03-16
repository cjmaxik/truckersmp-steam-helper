const friendTemplate = require('../templates/friend.hbs')
const inviteTemplate = require('../templates/invite.hbs')

const init = () => {
  browser.runtime.sendMessage(
    {
      query: 'options'
    }
  ).then((options) => {
    warningMessage()

    if (options.showInFriends) {
      const friends = document.querySelectorAll('div.friend_block_v2')
      friends.forEach((friend, key) => render(friend, 'div.friend_block_content', friendTemplate, key))
    }

    if (options.showInInvites) {
      const invites = document.querySelectorAll('div.invite_row')
      invites.forEach((invite, key) => render(invite, 'div.invite_block_details', inviteTemplate, key))
    }

    if (options.friendsMaxWidth) {
      const pageContent = document.querySelectorAll('div.pagecontent')
      if (pageContent.length) pageContent.forEach(element => element.classList.add('max_width'))
    }
  })
}

/**
 * Insert a warning message
 */
const warningMessage = () => {
  const template = `<div class="search_results_none">Due to <img src="${browser.extension.getURL('icons/tmp.png')}" alt="Icon"> API limits, new data might load with a noticeable delay. Be patient 😉 --CJMAXiK</div>`
  const titleBarSelector = document.querySelectorAll('div.profile_friends.title_bar')

  if (titleBarSelector) titleBarSelector[0].insertAdjacentHTML('beforebegin', template)
}

/**
 * Check Steam ID correctness
 * @param {String} steamId
 * @return {Boolean}
 */
const isSteamId = (steamId) => {
  return (steamId && steamId.length === 17 && steamId.startsWith('765611'))
}

/**
 * Render the template
 * @param {Element} mainSelector
 * @param {String} targetSelector
 * @param {Function} template
 * @param {Number} key
 */
const render = (mainSelector, targetSelector, template, key) => {
  const steamId = mainSelector.getAttribute('data-steamid')

  if (!isSteamId(steamId)) return

  browser.runtime.sendMessage(
    {
      query: 'player',
      steamId,
      key,
      withGames: false
    }
  ).then((playerInfo) => {
    let player = null
    if (playerInfo.data && !playerInfo.data.error) {
      player = playerInfo.data.response
    }

    const blockContent = mainSelector.querySelector(targetSelector)
    blockContent.insertAdjacentHTML('beforeend', template(
      {
        ...player,
        iconURL: browser.extension.getURL('icons/tmp.png')
      }
    ))
  })
}

// Check for URL changes (friends menu is ajax)
let lastUrl = location.href
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href
    init()
  }
}).observe(document, {
  subtree: true,
  childList: true
})

init()
