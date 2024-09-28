# BridgeCmdr

A/V switch and monitor controller

## License

### BridgeCmdr

Copyright ©2019-2020 Matthew Holder

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public
License as published by the Free Software Foundation, either version 3 of the License, or (at your option)
any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
more details.

You should have received a copy of the GNU General Public License along with this program. If not, see
<https://www.gnu.org/licenses/>.

`SPDX-License-Identifier: GPL-3.0-or-later`

## Installation

To install BridgeCmdr on the Raspberry Pi, all you need do is download the
[latest release](https://github.com/6XGate/bridgecmdr/releases), grant
the execution permission and run it. It is recommended that you use
something like the `appimagelauncher` to better integrate it with
you desktop environment.

### Requirements

Currently, BridgeCmdr requires a 32-bit version of Raspberry Pi OS, at least v11, a.k.a. `bullseye`, or later with
FUSE v2 installed.

### System Requirements

I've only tested this software on a Raspberry Pi 3 Model B+. In general I would recommend at minimal a Raspberry Pi 3
Model B or better. Which would include every configuration of the Raspberry Pi 4 Model B. It may run on other
models, but this has not been tested.

You will want a touchscreen, such as the official Raspberry Pi touchscreen, or a mouse and screen. You will also need a
keyboard while setting up your configuration, but it is not needed during day-to-day use.

You may also need additional USB-to-serial adapters or a serial HAT. Some supported monitors and switches can be
controlled over ethernet. For those you will need an ethernet cable; and if you have more than one such device,
an ethernet hub or switch. See [Wiki](https://github.com/6XGate/bridgecmdr/wiki) for more information on how
to connect to supported monitors and switches.

## Tools, Frameworks, Libraries, and Assets

BridgeCmdr uses the following libraries and frameworks are a major part of its makeup.

| Framework/Library                                  | License                                                                  |
| -------------------------------------------------- | ------------------------------------------------------------------------ |
| [Electron](https://electronjs.org/)                | [MIT](https://github.com/electron/electron/blob/master/LICENSE)          |
| [Vue.js](https://vuejs.org/)                       | [MIT](https://github.com/vuejs/vue/blob/master/LICENSE)                  |
| [Vuetify](https://vuetifyjs.com/)                  | [MIT](https://github.com/vuetifyjs/vuetify/blob/master/LICENSE.md)       |
| [PouchDB](https://pouchdb.com/)                    | [Apache 2.0](https://github.com/pouchdb/pouchdb/blob/master/LICENSE)     |
| [LevelDOWN](https://github.com/Level/leveldown)    | [MIT](https://github.com/Level/leveldown/blob/master/LICENSE)            |
| [Vue I18n](https://vue-i18n.intlify.dev/)          | [MIT](https://github.com/intlify/vue-i18n/blob/master/LICENSE)           |
| [SerialPort](https://serialport.io/)               | [MIT](https://github.com/serialport/node-serialport/blob/master/LICENSE) |
| [Vuelidate](https://vuelidate-next.netlify.app/)   | [MIT](https://github.com/vuelidate/vuelidate/blob/next/LICENSE)          |
| [zip.js](https://gildas-lormeau.github.io/zip.js/) | [BSD](https://github.com/gildas-lormeau/zip.js/blob/master/LICENSE)      |

For a complete list of dependencies and other utilized libraries, see the `package.json` file. Any other dependencies
not listed above or in the package file are dependencies of those packages.

BridgeCmdr also uses the [Material Design Icons](https://pictogrammers.com/library/mdi/) SVG graphics which are
licensed under the [Pictogrammers Free License](https://pictogrammers.com/docs/general/license/).

## Building

The following tools or libraries are used to build and maintain BridgeCmdr.

- [TypeScript](https://www.typescriptlang.org/).
- [Prettier](https://prettier.io/)
- [ESLint](https://eslint.org/), and the following third-party plug-ins;
  - [ESLint TypeScript plug-in](https://typescript-eslint.io/),
  - [ESLint Import plug-in](https://github.com/benmosher/eslint-plugin-import),
  - [ESLint Promise plug-in](https://github.com/xjamundx/eslint-plugin-promise),
  - [ESLint Node plug-in](https://github.com/eslint-community/eslint-plugin-n),
  - [ESLint Vue.js plug-in](https://eslint.vuejs.org/).
- [Electron Vite](https://evite.netlify.app/), and the following third-party plug-ins;
  - [Vue.js plug-in](https://github.com/vitejs/vite-plugin-vue),
  - [Dart Sass](https://sass-lang.com/dart-sass),
  - [@intlify/bundle-tools](https://github.com/intlify/bundle-tools).
- [electron-builder)](https://www.electron.build/).
- [VisualStudio Code](https://code.visualstudio.com/)

For a complete list of tools, see the `package.json` file. Any other dependencies not listed above or in the package
file are dependencies of those packages.

### Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) with:

- [i18n Ally](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [Dotenv + Vault](https://marketplace.visualstudio.com/items?itemName=dotenv.dotenv-vscode)
- [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Todo Tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree)
- [YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)

#### Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for
type checking.

### Development

If you want to help with the development of BridgeCmdr, downloading, building, then running the project on a GNU/Linux
based operating system is required. The following steps will get you setup on a Debian-base operating system.

1. Install the `build-essential` package; `sudo apt install build-essential git -y`
2. Acquire the source:
   - **Preferred**, Fork the [GitHub repository](https://github.com/6XGate/bridgecmdr), you may then issue pull
     requests back to the official source code. Also start personal branches from `develop`.
   - Download the [source](https://github.com/6XGate/bridgecmdr/archive/develop.zip) and extract it.
3. Open a terminal clone and go to the folder into which source was cloned or extracted.
4. Install the node packages; `yarn`
5. Build and run the app;

- For hot-reload development mode: `yarn dev`
- For product builds: `yarn build`
- For packaged application: `yarn make`

### Docker and ARM support

You can run ARM Docker containers on IA32 or AMD64 to package the application using the following means:

- Docker Desktop with multi-platform support enabled.
- On Linux, using [qemu static binary format support](https://www.docker.com/blog/getting-started-with-docker-for-arm-on-linux/).

You can start a container for building purposes by calling `docker compose run --build -it --rm build`. After doing so
you will need to run `yarn` to reinstall the native code dependencies with their proper native bindings.

### Packaging the Installer

To package the application, you will need to use `yarn package` steps you acquire the working copy of the source code
on an ARM system or in an ARM Docker container. It is not recommended to build directly on the Raspberry Pi since
the systems can be underpowered for such a purpose.

#### The Package

You should now have a package ending in `.AppImage` in the `dist` folder. This package can be run like any other
AppImage file.

### Releasing

- Start a the build docker conatiner: `docker compose run --build -it --rm build`
- Fresh install the packages: `yarn --force`
- Package the application: `yarn make`
- Land and tag the release.
- Create a release from the tag and copy the following files to the release assets:
  - `bridgecmdr-<version>-armv7l.AppImage`
  - `latest-linux-arm.yml`
