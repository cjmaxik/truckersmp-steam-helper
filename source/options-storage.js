import OptionsSync from 'webext-options-sync'

export default new OptionsSync({
  defaults: {
    showInProfile: true,
    showInFriends: true,
    showInInvites: true,
    showDiscord: true,
    showPatreon: true,
    friendsMaxWidth: false
  },
  migrations: [
    OptionsSync.migrations.removeUnused
  ],
  logging: true
})
