[![Build Status](https://travis-ci.org/PhilippLgh/mist-react-shell.svg?branch=master)](https://travis-ci.org/PhilippLgh/mist-react-shell)

# Steps to release with CI
- Bump version number
- Push / merge to master
- TODO set trigger for Electron releases (with auto-updater), mist-ui-react releases (without auto-updater)

# Steps to test release (locally)
- npm run prepare-release
  - will download latest app release and package it with shell
- npm run build
- double check that release/unpacked/Mist.exe is working

# Steps to release (locally)
- get github access token and insert into .env as GH_TOKEN
- TODO changelog, and release draft
- TODO installer signing
- npm run release -> auto publishes
- go to github, check everything, edit description and change from draft to release
