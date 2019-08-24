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

import Driver from "../system/Driver";

/**
 * @final
 */
export default class ExtronMatrixSwitch extends Driver {
    /**
     * @returns {DriverDescriptor}
     */
    static about() {
        return {
            guid:  "4C8F2838-C91D-431E-84DD-3666D14A6E2C",
            title: "ExtronMatrixSwitch SIS-compatible matrix switch",
        };
    }
};
