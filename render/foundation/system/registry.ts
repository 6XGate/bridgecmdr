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

import _        from "lodash";
import Driver   from "./driver";
import Source   from "./source";
import Switch   from "./switch";
import Tie      from "./tie";
import database from "../../boot/modules/database";
import sources  from "../../controllers/sources";
import switches from "../../controllers/switches";
import ties     from "../../controllers/ties";

async function loadRegistry(): Promise<void> {
    await database;

    // First ensure all existing switches are unloaded.
    await Promise.all(Switch.all().map(_switch => _switch.unload()));

    // Now clear all the sources and switches.
    Switch.clear();
    Source.clear();

    // Get the switches from the database.
    for (const model of await switches.all()) {
        try {
            // Let's not parallelize this.
            // eslint-disable-next-line no-await-in-loop
            const driver = await Driver.load(model.driverId, model.path);
            Switch.add(model._id, model.title, driver);
        } catch (error) {
            console.error(error);
        }
    }

    // Gets the ties from the database.
    const tieMap = new Map<string, Tie[]>();
    for (const model of await ties.all()) {
        try {
            /** @type {string} */
            const guid = model.sourceId.toUpperCase();
            /** @type {Tie[]} */
            const tieSet = tieMap.get(guid) || [];
            tieSet.push(new Tie(model.switchId, model.inputChannel,
                model.outputChannels.video, model.outputChannels.audio));

            tieMap.set(guid, tieSet);
        } catch (error) {
            console.error(error);
        }
    }

    // Get the source from the database.
    for (const model of await sources.all()) {
        try {
            const id = model._id.toUpperCase();
            let tieSet = tieMap.get(id);
            if (_.isNil(tieSet)) {
                console.warn(`Source "${model.title}" has no ties`);
                tieSet = [];
            }

            Source.add(id, model.title, model.image, tieSet);
        } catch (error) {
            console.error(error);
        }
    }
}

let loaded: Promise<void> = loadRegistry();

export default {
    load(): Promise<void> {
        return loaded;
    },
    reload(): Promise<void> {
        loaded = loadRegistry();

        return loaded;
    },
};
