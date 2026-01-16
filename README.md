# BridgeCmdr

A/V switch and monitor controller

## License

### BridgeCmdr

Copyright ©2019-2026 Matthew Holder

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
controlled over Ethernet. For those you will need an Ethernet cable; and if you have more than one such device,
an Ethernet hub or switch. See [Wiki](https://github.com/6XGate/bridgecmdr/wiki) for more information on how
to connect to supported monitors and switches.

## Tools, Frameworks, Libraries, and Assets

BridgeCmdr uses the following libraries and frameworks are a major part of its makeup.

> TODO: Update licenses as dependencies are updated.

| Framework/Library | License |
|-------------------| ------- |

For a complete list of dependencies and other utilized libraries, see the Gradle files. Any other dependencies not
listed above or in the package file are dependencies of those packages.

BridgeCmdr also uses the [Material Design Icons](https://pictogrammers.com/library/mdi/) SVG graphics which are licensed
under the [Pictogrammers Free License](https://pictogrammers.com/docs/general/license/).

## Building

The following tools or libraries are used to build and maintain BridgeCmdr.

> TODO: Update the list of build requirements.

For a complete list of tools, see the Gradle files. Any other dependencies not listed above or in the package file are
dependencies of those packages.

### Build and Run Android Application

To build and run the development version of the Android app, use the run configuration from the run widget in your IDE’s
toolbar or build it directly from the terminal:

```shell
./gradlew :composeApp:assembleDebug
```

### Build and Run Desktop (JVM) Application

To build and run the development version of the desktop app, use the run configuration from the run widget in your IDE’s
toolbar or run it directly from the terminal:

```shell
./gradlew :composeApp:run
```

### Recommended IDE Setup

> TODO: Update recommended IDE setup.

### Development

> TODO: Update the development instructions.

### Docker and ARM support

You can run ARM Docker containers on IA32 or AMD64 to package the application using the following means:

- Docker Desktop with multi-platform support enabled.
- On Linux, using [qemu static binary format support](https://www.docker.com/blog/getting-started-with-docker-for-arm-on-linux/).

You can start a container for building purposes by calling `docker compose run --build -it --rm build`. After doing so
you will need to run `yarn` to reinstall the native code dependencies with their proper native bindings.

### Packaging the Installer

> TODO: Update the packaging instructions.

### Releasing

- Start the build docker conatiner: `docker compose run --build -it --rm build`
- > TODO: Update the release instructions.
- Create a release from the tag and copy the following files to the release assets:
  - `bridgecmdr-<version>-armv7l.AppImage`
  - `latest-linux-arm.yml`

## Source Code Structure

This is a Kotlin Multiplatform project targeting Android and Desktop (JVM).

* [/composeApp](./composeApp/src) is for code that will be shared across the Compose Multiplatform applications.
  It contains several subfolders:
  - [androidMain](./composeApp/src/androidMain/kotlin) is the code for the Android target.
  - [commonMain](./composeApp/src/commonMain/kotlin) is for code that’s common for all targets.
  - [jvmMain](./composeApp/src/commonMain/kotlin) is the code for the Desktop (JVM) target.

