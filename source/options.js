import optionsStorage from './options-storage.js'

if (window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark')
}

optionsStorage.syncForm('#options-form').catch(e => console.error(e))

// Links
const links = document.getElementsByClassName('openURL')
Array.from(links).forEach((element) => {
  element.addEventListener('click', (event) => {
    const url = event.target.getAttribute('data-href')
    if (url) chrome.tabs.create({ url })
  })
})

document.getElementById('version').innerHTML = chrome.runtime.getManifest().version
