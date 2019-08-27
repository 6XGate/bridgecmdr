import _                       from "lodash";
import uuid                    from "uuid/v4";
import Switch                  from "../models/switch";
import Tie                     from "../models/tie";
import db                      from "../support/database";
import { DriverConfiguration } from "../system/driver";

export default {
    /**
     * Gets all the switches
     */
    all(): Promise<Switch[]> {
        return Switch().then(rows => rows);
    },

    /**
     * Gets the specified switches.
     */
    get(...guids: string[]): Promise<Switch[]> {
        // TODO: ow validation

        return Switch().whereIn("guid", guids).then(rows => rows);
    },

    /**
     * Adds a new switch.
     */
    async add(driverGuid: string, title: string, config: string|DriverConfiguration): Promise<Switch> {
        // TODO: ow validation

        const guid = String(uuid()).toUpperCase();
        // eslint-disable-next-line @typescript-eslint/camelcase
        const driver_guid = String(driverGuid).toUpperCase();

        const newRow: Switch = {
            guid,
            // eslint-disable-next-line @typescript-eslint/camelcase
            driver_guid,
            title,
            config: typeof config === "string" ? config : JSON.stringify(config),
        };

        await Switch().insert(newRow);

        return newRow;
    },

    /**
     * Removes the specified switches.
     */
    remove(...guids: string[]): Promise<void> {
        // TODO: ow validation

        guids = _.map(guids, guid => guid.toUpperCase());

        return db.transaction(async function (trx) {
            await Tie(trx).whereIn("switch_guid", guids).delete();
            await Switch(trx).whereIn("guid", guids).delete();
        });
    },
};
