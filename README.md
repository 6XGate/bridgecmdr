
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

BridgeCmdr uses the following libraries and frameworks which are available under their respective license.

| Framework/Library                                                        | License                                                                       |
|--------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| [Electron](https://electronjs.org/)                                      | [MIT](https://github.com/electron/electron/blob/master/LICENSE)               |
| [Vue.js](https://vuejs.org/)                                             | [MIT](https://github.com/vuejs/vue/blob/master/LICENSE)                       |
| [Vuetify](https://vuetifyjs.com/)                                        | [MIT](https://github.com/vuetifyjs/vuetify/blob/master/LICENSE.md)            |
| [PouchDB](https://pouchdb.com/)                                          | [Apache 2.0](https://github.com/pouchdb/pouchdb/blob/master/LICENSE)          |
| [SerialPort](https://serialport.io/)                                     | [MIT](https://github.com/serialport/node-serialport/blob/master/LICENSE)      |
| [VeeValidate](https://logaretm.github.io/vee-validate/)                  | [MIT](https://github.com/logaretm/vee-validate/blob/master/LICENSE)           |
| [Lodash](https://lodash.com/)                                            | [MIT](https://github.com/lodash/lodash/blob/master/LICENSE)                   |
| [Node UUID](https://github.com/kelektiv/node-uuid)                       | [MIT](https://github.com/kelektiv/node-uuid/blob/master/LICENSE.md)           |
| [electron-unhandled](https://github.com/sindresorhus/electron-unhandled) | [MIT](https://github.com/sindresorhus/electron-unhandled/blob/master/license) |
| [xdg-basedir](https://github.com/sindresorhus/xdg-basedir)               | [MIT](https://github.com/sindresorhus/xdg-basedir/blob/master/license)        |
| [vue-typed-mixins](https://github.com/ktsn/vue-typed-mixins)             | [MIT](https://github.com/ktsn/vue-typed-mixins/blob/master/LICENSE)           |

Other dependencies not listed are part of one of the above packages and share the same license.

BridgeCmdr also uses the [Material Design Icons](https://dev.materialdesignicons.com/) font and SVG graphics which are
licensed under the [SIL Open Font License](https://github.com/Templarian/MaterialDesign/blob/master/LICENSE) v1.0.

Finally, the following tools or libraries were used to build BridgeCmdr.

- [cross-env](https://github.com/kentcdodds/cross-env).
- [moment](https://momentjs.com/).
- [read-package-json](https://github.com/npm/read-package-json).
- [TypeScript](https://www.typescriptlang.org/).
- [ESLint](https://eslint.org/), and the following third-party plug-ins;
    - [ESLint Import Plug-in](https://github.com/benmosher/eslint-plugin-import),
    - [ESLint Promise Plug-in](https://github.com/xjamundx/eslint-plugin-promise),
    - [ESLint Node Plug-in](https://github.com/mysticatea/eslint-plugin-node),
- [WebPack](https://webpack.js.org/), and the following third-party plug-ins;
    - [TypeScript Loader](https://github.com/TypeStrong/ts-loader),
    - [Resolve URL Loader](https://github.com/bholloway/resolve-url-loader),
    - [Node Externals](https://github.com/liady/webpack-node-externals),
    - [HTML WebPack Plug-in](https://github.com/jantimon/html-webpack-plugin),
    - [Dart Sass](https://sass-lang.com/dart-sass), and the following third-party plug-ins;
        - [Node Fibers](https://github.com/laverdet/node-fibers)
- [Electron DevTools Installer](https://github.com/MarshallOfSound/electron-devtools-installer).
- [Electron Installer (Debian)](https://github.com/electron-userland/electron-installer-debian).
- [PHPStorm](https://www.jetbrains.com/phpstorm/), but no PHP code was harmed in the making of this software.
- [VisualStudio Code](https://code.visualstudio.com/)

Other tools or licenses not listed are part of one of the above packages.

## Building

### Development

If you want to help with the development of BridgeCmdr, downloading, building, then running the project on a GNU/Linux
based operating system is required. The following steps will get you setup on a Debian-base operating system.

1. Install the `build-essential` package; `sudo apt install build-essential -y`
2. Acquire the source:
    - **Preferred**, Fork the [GitHub repository](https://github.com/6XGate/bridgecmdr), you may then issue pull
      requests back to the official source code. Also start personal branches from `develop`.
    - Download the [source](https://github.com/6XGate/bridgecmdr/archive/develop.zip) and extract it.
3. Open a terminal clone and go to the folder into which source was cloned or extracted.
4. Install the node packages; `npm ci`
5. Build the user interface source; `npm run prod` or `npm run dev`

You should now be able to run the program with `npm run start`.

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
2. On the desktop system, build the user interface source; `npm run prod`
3. Copy the `dist` folder from the desktop system to project folder on the Raspberry Pi system.
4. Package the installer on the Raspberry Pi system; `npm run pack`

#### Using Raspberry Pi with more RAM.

If you are running a Raspberry Pi 4 with 2GiB or 4GiB, all instructions can be done without copying the user interface
files and you will only use that single system. This is a simplest process.

1. Install the node packages; `npm ci`
2. Build the installer package; `npm run package`

#### The Package

You should now have a Raspbian package ending in `.deb` in the `out` folder. This package can be installed with `apt` on
the Raspberry Pi.
