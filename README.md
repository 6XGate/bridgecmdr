
# BridgeCmdr

A/V switch and monitor controller

## License

### BridgeCmdr

Copyright ©2019 Matthew Holder

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public
License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see
<https://www.gnu.org/licenses/>.

`SPDX-License-Identifier: GPL-3.0-or-later`

## Installation

> TODO

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

Other dependencies not listed are part of one of the above packages and share the same license.

BridgeCmdr also uses the [Material Design Icons](https://dev.materialdesignicons.com/) font and SVG graphics which is
licensed under the [SIL Open Font License](https://github.com/Templarian/MaterialDesign/blob/master/LICENSE) v1.0.

Finally, the following tools or libraries were used to build BridgeCmdr.

- [moment](https://momentjs.com/).
- [read-package-json](https://github.com/npm/read-package-json).
- [TypeScript](https://www.typescriptlang.org/)
- [ESLint](https://eslint.org/), and the following third-party plug-ins;
    - [ESLint Import Plug-in](https://github.com/benmosher/eslint-plugin-import)
    - [ESLint Promise Plug-in](https://github.com/xjamundx/eslint-plugin-promise)
    - [ESLint Node Plug-in](https://github.com/mysticatea/eslint-plugin-node)
- [WebPack](https://webpack.js.org/), and the following third-party plug-ins;
    - [TypeScript Loader](https://github.com/TypeStrong/ts-loader)
    - [Resolve URL Loader](https://github.com/bholloway/resolve-url-loader)
    - [Node Externals](https://github.com/liady/webpack-node-externals)
    - [HTML WebPack Plug-in](https://github.com/jantimon/html-webpack-plugin)
    - [Dart Sass](https://sass-lang.com/dart-sass), and the following third-party plug-ins;
        - [Node Fibers](https://github.com/laverdet/node-fibers)
- [Electron Installer (Debian)](https://github.com/electron-userland/electron-installer-debian).
- [PHPStorm](https://www.jetbrains.com/phpstorm/), but no PHP code was harmed in the making of this software.
- [VisualStudio Code](https://code.visualstudio.com/)

Other tools or licenses not listed are part of one of the above packages.

## Building

### Development

If you want to help with the development of BridgeCmdr, downloading, building, and running the project on a Linux system
is easy.

1. Download the [source](https://github.com/6XGate/bridgecmdr/archive/master.zip) and extract it.
2. Open a terminal clone and go to the folder into which source was extracted.
3. Install the `build-essential` package.
    - `sudo apt install build-essential -y`
4. Install the node packages.
    - `npm ci` or `npm install`
5. Build the user interface source.
    - `npm run prod` or `npm run dev`

You should now be able to run the program with `npm run start`.

### Packaging the Installer

Though not optimal, the only way to currently building a package requires a Raspberry Pi with Raspbian and a desktop
computer running Debian or Ubuntu.  This should change in the future.  Other desktop Linux distributions may work, but
 it's not tested.

 With a Raspberry Pi 4, given the larger memory configuration, it may be possible to do all of this on the Raspberry Pi
 system alone.

1. Download the [source](https://github.com/6XGate/bridgecmdr/archive/develop.zip) and extract it on both systems.
2. On both systems; open a terminal clone and go to the folder into which source was extracted.
3. On both systems; install the `build-essential` package.
    - `sudo apt install build-essential -y`
4. On both systems; install the node packages.
    - `npm ci` or `npm install`
5. On the desktop system, build the user interface source.
    - `npm run prod` or `npm run dev`
6. Copy the `dist` folder from the desktop system to project folder on the Raspberry Pi system.
7. Package the installer on the Raspberry Pi system.
    - `npm run pack`

You should now have a Debian package in the `out` folder. This package can be installed with `apt` on the Raspberry Pi.
