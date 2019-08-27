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

import _           from "lodash";
import database    from "./database";
import SourceModel from "../../models/source";
import SwitchModel from "../../models/switch";
import TieModel    from "../../models/tie";
import Driver      from "../../system/driver";
import Source      from "../../system/source";
import Switch      from "../../system/switch";
import Tie         from "../../system/tie";

async function loadConfiguration() {
    await database;

    // Get the switches from the database.
    const switches = await SwitchModel();
    for (const model of switches) {
        try {
            const driver = Driver.load(model.driver_guid, JSON.parse(model.config as string));
            Switch.add(model.guid, model.title, driver);
        } catch (error) {
            console.error(error);
        }

        console.log(model);
    }

    // Gets the ties from the database.
    /** @type {Map<string, Tie[]>} */
    const tieMap = new Map();
    const ties   = await TieModel();
    for (const model of ties) {
        try {
            /** @type {string} */
            const guid = String(model.source_guid).toUpperCase();
            /** @type {Tie[]} */
            const tieSet = tieMap.has(guid) ? tieMap.get(guid) : [];
            tieSet.push(new Tie(model.switch_guid, model.input_channel,
                model.video_output_channel, model.audio_output_channel));

            tieMap.set(guid, tieSet);
        } catch (error) {
            console.log(error);
        }

        console.log(model);
    }

    // Get the source from the database.
    const sources = await SourceModel();
    for (const model of sources) {
        try {
            const guid = String(model.guid).toUpperCase();
            let tieSet = tieMap.get(guid);
            if (_.isNil(tieSet)) {
                console.warn(`Source "${model.title}" has no ties`);
                tieSet = [];
            }

            Source.add(guid, model.title, model.image, tieSet);
        } catch (error) {
            console.log(error);
        }

        console.log(model);
    }
}

export default loadConfiguration();
