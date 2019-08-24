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

import database    from "./database";
import SwitchModel from "../../models/Switch";
import Driver      from "../../system/Driver";
import Switch      from "../../system/Switch";

async function loadConfiguration() {
    await database;

    // Get the switches in the database.
    const switches = await SwitchModel();
    for (const model of switches) {
        try {
            const driver = Driver.load(model.driver_guid, JSON.parse(model.config));
            Switch.add(model.guid, model.title, driver);
        } catch (error) {
            console.error(error);
        }

        console.log(model);
    }
}

export default loadConfiguration();
