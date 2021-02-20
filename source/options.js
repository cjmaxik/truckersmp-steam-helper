import optionsStorage from './options-storage.js'

if (window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark')
}

optionsStorage.syncForm('#options-form')

const openRepo = () => {
  chrome.tabs.create({ url: 'https://github.com/cjmaxik/truckersmp-steam-helper' })
}
document.getElementById('openRepo').addEventListener('click', openRepo)
