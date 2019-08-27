/*
BridgeCmdr - A/V switch and monitor controller
Copyright (C) 2019 Matthew Holder

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import Driver, { DriverCapabilities, DriverConfiguration, DriverDescriptor } from "../system/driver";

export default class ExtronMatrixSwitch extends Driver {
    static about(): DriverDescriptor {
        return {
            guid:  "4C8F2838-C91D-431E-84DD-3666D14A6E2C",
            title: "Extron SIS-compatible matrix switch",
        };
    }

    get guid(): string {
        return ExtronMatrixSwitch.about().guid;
    }

    get title(): string {
        return ExtronMatrixSwitch.about().title;
    }

    constructor(config: DriverConfiguration) {
        super(config, DriverCapabilities.CAN_DECOUPLE_AUDIO_OUTPUT | DriverCapabilities.HAS_MULTIPLE_OUTPUTS);
    }

    setTie(inputChannel: number, videoOutputChannel: number, audioOutputChannel: number): Promise<void> {
        console.log(inputChannel);
        console.log(videoOutputChannel);
        console.log(audioOutputChannel);

        return Promise.resolve();
    }

    powerOn(): Promise<void> {
        return Promise.resolve();
    }

    powerOff(): Promise<void> {
        return Promise.resolve();
    }
}
