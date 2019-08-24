import uuid   from "uuid/v4";
import db     from "../support/database";
import Switch from "../models/Switch";
import Tie    from "../models/Tie";

export default {
    /**
     * Gets all the switches
     *
     * @returns {Promise<Switch[]>}
     */
    all() {
        return Switch().then(rows => rows);
    },

    /**
     * Gets the specified switches.
     *
     * @param {...string} guids
     *
     * @returns {Promise<Switch[]>}
     */
    get(...guids) {
        return Switch().whereIn("id", guids).then(rows => rows);
    },

    /**
     * Adds a new switch.
     *
     * @param {string}              driverGuid
     * @param {string}              title
     * @param {DriverConfiguration} config
     *
     * @returns {Promise<void>}
     */
    async add(driverGuid, title, config) {
        // TODO: ow validation

        const guid = String(uuid()).toUpperCase();
        // eslint-disable-next-line camelcase
        const driver_guid = String(driverGuid).toUpperCase();

        await Switch().insert({
            guid,
            driver_guid,
            title,
            config,
        });
    },

    /**
     * Removes the specified switches.
     *
     * @param {...string} guids
     *
     * @returns {Promise<void>}
     */
    remove(...guids) {
        return db.transaction(async function (trx) {
            await Tie(trx).whereIn("switch_guid", guids).delete();
            await Switch(trx).whereIn("id", guids).delete();
        });
    },
};
