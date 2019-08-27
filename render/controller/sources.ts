import _      from "lodash";
import uuid   from "uuid/v4";
import Source from "../models/source";
import Tie    from "../models/tie";
import db     from "../support/database";

export default {
    /**
     * Gets all sources.
     */
    all(): Promise<Source[]> {
        return Source().then(rows => rows);
    },

    /**
     * Gets the specified sources.
     */
    get(...guids: string[]): Promise<Source[]> {
        // TODO: ow validation

        guids = _.map(guids, guid => guid.toUpperCase());

        return Source().whereIn("guid", guids).then(rows => rows);
    },

    /**
     * Adds a new source.
     */
    async add(title: string, image: any): Promise<Source> {
        // TODO: ow validation

        const guid = uuid().toUpperCase();

        const newRow: Source = {
            guid,
            title,
            image,
        };

        await Source().insert(newRow);

        return newRow;
    },

    /**
     * Removes the specified sources.
     */
    remove(...guids: string[]): Promise<void> {
        // TODO: ow validation

        guids = _.map(guids, guid => guid.toUpperCase());

        return db.transaction(async function (trx) {
            await Tie(trx).whereIn("source_guid", guids).delete();
            await Source(trx).whereIn("guid", guids).delete();
        });
    },
};
