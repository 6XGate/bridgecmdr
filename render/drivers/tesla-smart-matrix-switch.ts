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

import Driver, { DriverCapabilities, DriverDescriptor } from "../support/system/driver";

const capabilities = DriverCapabilities.NONE;
const about        = {
    guid:  "91D5BC95-A8E2-4F58-BCAC-A77BA1054D61",
    title: "TeslaSmart-compatible matrix switch",
    capabilities,
};

export default class TeslaSmartMatrixSwitch extends Driver {
    public static about(): DriverDescriptor {
        return about;
    }

    public static load(path: string): Promise<Driver> {
        return Promise.resolve(new TeslaSmartMatrixSwitch(path));
    }

    // eslint-disable-next-line class-methods-use-this
    public get guid(): string {
        return about.guid;
    }

    // eslint-disable-next-line class-methods-use-this
    public get title(): string {
        return about.title;
    }

    private constructor(_path: string) {
        super(capabilities);
    }

    public setTie(inputChannel: number): Promise<void> {
        console.log(`Tesla: ${inputChannel}`);

        return Promise.resolve();
    }

    public powerOn(): Promise<void> {
        return Promise.resolve();
    }

    public powerOff(): Promise<void> {
        return Promise.resolve();
    }
}
