import _             from "lodash";
import uuid          from "uuid/v4";
import Tie           from "../models/tie";
import db            from "../support/database";
import { TieOutput } from "../system/tie";

export default {
    all(): Promise<Tie[]> {
        return Tie().then(row => row);
    },

    get(...guids: string[]): Promise<Tie[]> {
        // TODO: ow validation

        guids = _.map(guids, guid => guid.toUpperCase());

        return Tie().whereIn("guid", guids).then(rows => rows);
    },

    forSource(guid: string): Promise<Tie> {
        // TODO: ow validation

        guid = guid.toUpperCase();

        return Tie().where("source_guid", guid).then(rows => {
            if (rows.length > 0) {
                return rows[0];
            }

            throw new ReferenceError(`No such tie exists for "${guid}"`);
        });
    },

    async add(sourceGuid: string, switchGuid: string, intput: number, output: TieOutput): Promise<Tie> {
        // TODO: ow validation

        const guid = uuid().toUpperCase();
        sourceGuid = sourceGuid.toUpperCase();
        switchGuid = switchGuid.toUpperCase();

        const newRow: Tie = {
            guid,
            // eslint-disable-next-line @typescript-eslint/camelcase
            source_guid:          sourceGuid,
            // eslint-disable-next-line @typescript-eslint/camelcase
            switch_guid:          switchGuid,
            // eslint-disable-next-line @typescript-eslint/camelcase
            input_channel:        intput,
            // eslint-disable-next-line @typescript-eslint/camelcase
            video_output_channel: output.video,
            // eslint-disable-next-line @typescript-eslint/camelcase
            audio_output_channel: output.audio,
        };

        await Tie().insert(newRow);

        return newRow;
    },

    remove(...guids: string[]): Promise<void> {
        // TODO: ow validation

        guids = _.map(guids, guid => guid.toUpperCase());

        return db.transaction(function (trx) {
            Tie(trx).whereIn("guid", guids).delete().then(() => undefined);
        });
    },
};
