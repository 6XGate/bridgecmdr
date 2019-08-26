import uuid                    from "uuid/v4";
import db                      from "../support/database";
import Switch                  from "../models/Switch";
import Tie                     from "../models/Tie";
import { DriverConfiguration } from "../system/Driver";

export default {
    /**
     * Gets all the switches
     */
    all(): Promise<Switch[]> {
        return Switch().then((rows: Array<Switch>) => rows);
    },

    /**
     * Gets the specified switches.
     */
    get(...guids: string[]): Promise<Switch[]> {
        return Switch().whereIn("guid", guids).then(rows => rows);
    },

    /**
     * Adds a new switch.
     */
    async add(driverGuid: string, title: string, config: DriverConfiguration): Promise<void> {
        // TODO: ow validation

        const guid = String(uuid()).toUpperCase();
        // eslint-disable-next-line @typescript-eslint/camelcase
        const driver_guid = String(driverGuid).toUpperCase();

        await Switch().insert({
            guid,
            // eslint-disable-next-line @typescript-eslint/camelcase
            driver_guid,
            title,
            config: JSON.stringify(config),
        });
    },

    /**
     * Removes the specified switches.
     */
    remove(...guids: string[]): Promise<void> {
        return db.transaction(async function (trx) {
            await Tie(trx).whereIn("switch_guid", guids).delete();
            await Switch(trx).whereIn("id", guids).delete();
        });
    },
};
