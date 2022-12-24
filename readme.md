# ![icon](/source/icons/icon24.png) TruckersMP Steam Helper

> Chrome / Firefox extension to provide useful information about TruckersMP players in Steam.

---

# Deprecation notice
**This extension is now fully-featured and complete, no updates will be performed. It should work as long as Chrome v2 manifest is available.**

---

![GitHub release (latest by date)](https://img.shields.io/github/v/release/cjmaxik/truckersmp-steam-helper?style=flat-square&label=Release&logo=github) ![Chrome Web Store](https://img.shields.io/chrome-web-store/v/lodcclicinbifbajhlapkolpedcjgbme?label=Chrome&style=flat-square&logo=google-chrome) ![Mozilla Add-on](https://img.shields.io/amo/v/truckersmp-steam-helper@cjmaxik.github.com?label=Firefox&style=flat-square&logo=firefox)

### [TruckersMP forum topic](https://forum.truckersmp.com/index.php?/topic/102560-truckersmp-steam-helper/)

## Installation links
- Google Chrome, Vivaldi - [click here](https://chrome.google.com/webstore/detail/truckersmp-steam-helper/lodcclicinbifbajhlapkolpedcjgbme)
- Mozilla Firefox - [click here](https://addons.mozilla.org/addon/truckersmp-steam-helper/)
- Opera (incl. GX) - install [this extension](https://addons.opera.com/en/extensions/details/install-chrome-extensions/) first, then [click here](https://chrome.google.com/webstore/detail/truckersmp-steam-helper/lodcclicinbifbajhlapkolpedcjgbme)
- Microsoft Edge - [click here](https://chrome.google.com/webstore/detail/truckersmp-steam-helper/lodcclicinbifbajhlapkolpedcjgbme), click "Allow extensions from other stores", then install

## Screenshots
![Profile](/media/profile-registered.png)

![Profile](/media/profile-not-registered.png)

![Friends](/media/friends.png)

## Features
- TruckersMP Info panel in Community Profile
- Steam Privacy settings checkout (if no TruckersMP profile found)
- Compact TruckersMP Info in Friends tab (including Pending Invites)
- Various additional settings, including Steam-related

*This extension is inspired by TruckersMP Helper and internal TruckersMP Team tools.*

## For Delevopers
Install `Node.js` and `npm`, run `npm install` in the project's root folder.
Use `distribution` folder as the extracted extension path.

Scripts:
- `npm run watch` - for development (you need to update the extension manually to refresh content scripts)
- `npm run build` - for the testing

## License
This browser extension is released under [MIT license](LICENSE.md).

## Credits
- [browser-extension-template](https://github.com/fregante/browser-extension-template)
- [Handlebars](https://handlebarsjs.com/)
- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)
- [Augmented Steam](https://github.com/tfedor/AugmentedSteam)
- [TruckersMP API](https://truckersmp.com)
