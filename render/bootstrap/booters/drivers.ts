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

// The main driver module.
import Driver from "../../system/driver";
// The available drivers.
import ExtronMatrixSwitch         from "../../drivers/extron-matrix-switch";
import SonySerialMonitor from "../../drivers/sony-serial--monitor";
import TeslaSmartMatrixSwitch     from "../../drivers/tesla-smart-matrix-switch";

// Now we register our known drivers.
Driver.register(ExtronMatrixSwitch);
Driver.register(SonySerialMonitor);
Driver.register(TeslaSmartMatrixSwitch);

// This module is resolved once it executes.
export default Promise.resolve();
