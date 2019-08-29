import _                       from "lodash";
import uuid                    from "uuid/v4";
import Switch                  from "../models/switch";
import Tie                     from "../models/tie";
import db                      from "../support/database";
import { DriverConfiguration } from "../system/driver";

export function ensureConfigParsed(row: Switch): Switch {
    row.config = _.isString(row.config) ? JSON.parse(row.config as string) as DriverConfiguration :
        row.config as DriverConfiguration;

    return row;
}

export function ensureAllConfigsParsed(rows: Switch[]): Switch[] {
    return _(rows).each(row => ensureConfigParsed(row)).value();
}

function ensureReadyToSave(row: Switch): Switch {
    row.guid = row.guid.toUpperCase();
    // eslint-disable-next-line @typescript-eslint/camelcase
    row.driver_guid = row.driver_guid.toUpperCase();
    row.config      = _.isString(row.config) ? row.config as string : JSON.stringify(row.config);

    return row;
}

export default {
    /**
     * Gets all the switches
     */
    all(): Promise<Switch[]> {
        return Switch().then(rows => ensureAllConfigsParsed(rows));
    },

    /**
     * Gets the specified switches.
     */
    get(...guids: string[]): Promise<Switch[]> {
        // TODO: ow validation

        return Switch().whereIn("guid", _.map(guids, guid => guid.toUpperCase())).
            then(rows => ensureAllConfigsParsed(rows));
    },

    /**
     * Adds a new switch.
     */
    async add(row: Switch): Promise<Switch> {
        // TODO: ow validation

        row.guid = uuid();
        await Switch().insert(ensureReadyToSave(row));

        return row;
    },

    /**
     * Updates an existing switch.
     */
    async update(row: Switch): Promise<Switch> {
        // TODO: ow validation

        await Switch().update(ensureReadyToSave(row)).where("guid", row.guid.toUpperCase());

        return row;
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
