const friendTemplate = require('../templates/friend.hbs')
const inviteTemplate = require('../templates/invite.hbs')

const init = () => {
  chrome.runtime.sendMessage(
    {
      contentScriptQuery: 'queryOptions'
    },
    (options) => {
      if (options.showInFriends) {
        const friends = document.querySelectorAll('div.friend_block_v2')
        friends.forEach((friend) => render(friend, 'div.friend_block_content', friendTemplate))
      }

      if (options.showInInvites) {
        const invites = document.querySelectorAll('div.invite_row')
        invites.forEach((invite) => render(invite, 'div.invite_block_details', inviteTemplate))
      }

      if (options.friendsMaxWidth) {
        const pageContent = document.querySelectorAll('div.pagecontent')
        if (pageContent.length) pageContent.forEach(element => element.classList.add('max_width'))
      }
    }
  )
}

const isSteamId = (steamId) => {
  return (steamId && steamId.length === 17 && steamId.startsWith('765611'))
}

const render = (mainSelector, targetSelector, template) => {
  const steamId = mainSelector.getAttribute('data-steamid')

  if (!isSteamId(steamId)) return

  chrome.runtime.sendMessage(
    {
      contentScriptQuery: 'queryPlayer',
      steamId
    },
    (playerInfo) => {
      let player = null
      if (playerInfo.data && !playerInfo.data.error) {
        player = playerInfo.data.response
      }

      const blockContent = mainSelector.querySelector(targetSelector)
      blockContent.insertAdjacentHTML('beforeEnd', template(
        {
          ...player, iconURL: chrome.extension.getURL('icons/tmp.png')
        }
      ))
    }
  )
}

// Check for URL changes (friends menu is ajax)
let lastUrl = location.href
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href
    onUrlChange()
  }
}).observe(document, { subtree: true, childList: true })

function onUrlChange () {
  init()
}

init()
