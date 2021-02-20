const init = () => {
  chrome.runtime.sendMessage(
    {
      contentScriptQuery: 'queryOptions'
    },
    (options) => {
      if (options.showInFriends) {
        const friends = document.querySelectorAll('div.friend_block_v2')
        friends.forEach(renderFriend)
      }

      if (options.showInInvites) {
        const invites = document.querySelectorAll('div.invite_row')
        invites.forEach(renderInvite)
      }
    }
  )
}

/**
 * @param {Element} friendSelector
 */
const renderFriend = (friendSelector) => {
  const steamId = friendSelector.getAttribute('data-steamid')

  if (!steamId) return

  chrome.runtime.sendMessage(
    {
      contentScriptQuery: 'queryPlayer',
      steamId
    },
    (playerInfo) => {
      let template = null
      if (!playerInfo.data || playerInfo.data.error) {
        template = '<br /> <span class="friend_small_text" style="color: #898989 !important;">TMP: not registered</span>'
      } else {
        playerInfo = playerInfo.data.response
        template = `<br /><span class="friend_small_text" style="color: ${playerInfo.groupColor}">TMP: ${playerInfo.groupName}</span>`
      }

      const blockContent = friendSelector.querySelector('div.friend_block_content')
      blockContent.insertAdjacentHTML('beforeEnd', template)
    }
  )
}

const renderInvite = (inviteSelector) => {
  const steamId = inviteSelector.getAttribute('data-steamid')

  if (!steamId) return

  chrome.runtime.sendMessage(
    {
      contentScriptQuery: 'queryPlayer',
      steamId
    },
    (playerInfo) => {
      let template = null
      if (!playerInfo.data || playerInfo.data.error) {
        template = '<span>TMP: not registered</span>'
      } else {
        playerInfo = playerInfo.data.response
        template = `<span style="color: ${playerInfo.groupColor}">TMP: ${playerInfo.groupName}</span>`
      }

      const blockContent = inviteSelector.querySelector('div.invite_block_details')
      blockContent.insertAdjacentHTML('beforeEnd', template)
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
