# BridgeCmdr

A/V switch and monitor controller

## License

### BridgeCmdr

Copyright ©2019-2020 Matthew Holder

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public
License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see
<https://www.gnu.org/licenses/>.

`SPDX-License-Identifier: GPL-3.0-or-later`

## Installation

> TODO: Update for AppImage or snap or whatever...

To install BridgeCmdr on the Raspberry Pi, all you need do is download the
[latest release](https://github.com/6XGate/bridgecmdr/releases) and install it with
`sudo apt install ./bridgecmdr_<version>-<revision>_armhf.deb -y`

### System Requirements

I've only tested this software on a Raspberry Pi 3 Model B+. In general I would recommend at minimal a Raspberry Pi 3
Model B or better. Which would include every configuration of the Raspberry Pi 4 Model B. It may run on other models,
but this has not been tested.

You will also need a touchscreen, such as the official Raspberry Pi touchscreen, or a mouse and screen. You will also
need a keyboard while setting up your configuration, but it is not needed during day-to-day use.

You may also need additional USB-to-serial adapters or a serial HAT. Some supported monitors and switches can be
controlled over ethernet. For those you will need an ethernet cable; and if you have more than one such device, an
ethernet hub or switch. See [Wiki](https://github.com/6XGate/bridgecmdr/wiki) for more information on how to connect to
supported monitors and switches.

## Tools, Frameworks, Libraries, and Assets

BridgeCmdr uses the following libraries and frameworks are a major part of its makeup.

| Framework/Library                                                        | License                                                                       |
|--------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| [Electron](https://electronjs.org/)                                      | [MIT](https://github.com/electron/electron/blob/master/LICENSE)               |
| [Vue.js](https://vuejs.org/)                                             | [MIT](https://github.com/vuejs/vue/blob/master/LICENSE)                       |
| [Vuetify](https://vuetifyjs.com/)                                        | [MIT](https://github.com/vuetifyjs/vuetify/blob/master/LICENSE.md)            |
| [Vue i18n](https://vue-i18n.intlify.dev/)                                | [MIT](https://github.com/intlify/vue-i18n-next/blob/master/LICENSE)           |
| [PouchDB](https://pouchdb.com/)                                          | [Apache 2.0](https://github.com/pouchdb/pouchdb/blob/master/LICENSE)          |
| [LevelDOWN](https://github.com/Level/leveldown)                          | [MIT](https://github.com/Level/leveldown/blob/master/LICENSE)                 |
| [SerialPort](https://serialport.io/)                                     | [MIT](https://github.com/serialport/node-serialport/blob/master/LICENSE)      |
| [Vuelidate](https://vuelidate-next.netlify.app/)                         | [MIT](https://github.com/vuelidate/vuelidate/blob/next/LICENSE)               |

For a complete list of dependencies and other utilized libraries, see the `package.json` file.
Any other dependencies not listed above or in the package file are dependencies of those packages.

BridgeCmdr also uses the [Material Design Icons](https://pictogrammers.com/library/mdi/) SVG
graphics which are licensed under the
[Pictogrammers Free License](https://pictogrammers.com/docs/general/license/).

## Building

The following tools or libraries are used to build BridgeCmdr.

- [TypeScript](https://www.typescriptlang.org/).
- [ESLint](https://eslint.org/), and the following third-party plug-ins;
    - [ESLint TypeScript plug-in](https://typescript-eslint.io/),
    - [ESLint Import plug-in](https://github.com/benmosher/eslint-plugin-import),
    - [ESLint Promise plug-in](https://github.com/xjamundx/eslint-plugin-promise),
    - [ESLint Node plug-in](https://github.com/eslint-community/eslint-plugin-n),
    - [Vue.js plug-in](https://eslint.vuejs.org/),
- [Electron Vite](https://evite.netlify.app/), and the following third-party plug-ins;
    - [Vue plug-in](https://github.com/vitejs/vite-plugin-vue),
    - [Vue i18n plug-in](https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n),
    - [Dart Sass](https://sass-lang.com/dart-sass),
- [Electron Toolkit](https://github.com/alex8088/electron-toolkit).
- [Electron Installer (Debian)](https://github.com/electron-userland/electron-installer-debian).
- [VisualStudio Code](https://code.visualstudio.com/)

For a complete list of tools, see the `package.json` file. Any other dependencies not listed above
or in the package file are dependencies of those packages.

### Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) with:
  - [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur)
  - [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)
  - [Dotenv + Vault](https://marketplace.visualstudio.com/items?itemName=dotenv.dotenv-vscode)
  - [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [i18n Ally](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally)
  - [Todo Tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree)
  - [YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)

#### Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take-Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

### Development

If you want to help with the development of BridgeCmdr, downloading, building, then running the project on a GNU/Linux
based operating system is required. The following steps will get you setup on a Debian-base operating system.

1. Install the `build-essential` package; `sudo apt install build-essential git -y`
2. Acquire the source:
    - **Preferred**, Fork the [GitHub repository](https://github.com/6XGate/bridgecmdr), you may then issue pull
      requests back to the official source code. Also start personal branches from `develop`.
    - Download the [source](https://github.com/6XGate/bridgecmdr/archive/develop.zip) and extract it.
3. Open a terminal clone and go to the folder into which source was cloned or extracted.
4. Install the node packages; `npm ci`
5. Build and run the app;
  - For hot-reload mode: `npm run dev`
  - For product build preview: `npm run preview`

### Docker and ARM support

If you want to run this in an ARM version of Linux, and don't have an ARM system or want to run on
one. You can set up your system to support running ARM Docker container via QEMU's static user
binary format translation. See
[this article on Docker.com](https://www.docker.com/blog/getting-started-with-docker-for-arm-on-linux/)
for more information. Some Linux distribution have packages or instruction for their own
packaged version of QEMU and the binary translation support.

The docker container can be built and activated in one command in this repository with
`npm run docker:sh`. You may need to run `npm ci` to reinstall all packages with the
proper ARM bindings. Using this container is really only useful when packaging the
application with `npm run dist`.

### Packaging the Installer

To package or build the install, you will need to follow the above steps you acquire the a working copy of the source
code on a Raspberry Pi running Raspbian, the only supported operating system.

There are two ways to build the installer package depending on which model of Raspberry Pi you have.

#### Using a 1GiB Raspberry Pi and a desktop computer.

The following systems must use this method:

- Raspberry Pi 3 Model B
- Raspberry Pi 3 Model B+
- 1GiB Raspberry Pi 4 Model B,
- Any model with lesser specs than those above, though this is as untested as running BridgeCmdr on it.

Though not optimal, the only way to build a package on a 1GiB Raspberry Pi is to use a desktop computer running a
GNU/Linux based operating system to build the user interface and the Pi to build the installer package.

1. On both systems, install the node packages; `npm ci`
2. On the desktop system, build the user interface source; `npm run build`
3. Copy the `dist` folder from the desktop system to project folder on the Raspberry Pi system.
4. Package the installer on the Raspberry Pi system; `npm run dist`

#### Using Raspberry Pi with more RAM.

If you are running a Raspberry Pi 4 with 2GiB or 4GiB, all instructions can be done without copying the user interface
files and you will only use that single system. This is a simplest process.

1. Install the node packages; `npm ci`
2. Build the installer package; `npm run dist`

#### The Package

> TODO: Update based on AppImage or snap or whatever...

You should now have a Raspbian package ending in `.deb` in the `out` folder. This package can be installed with `apt` on
the Raspberry Pi.
