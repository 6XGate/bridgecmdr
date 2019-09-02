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

import Tie                                        from "../models/tie";
import Controller, { ExistingDocument, Document } from "../support/controller";

class TieController extends Controller<Tie> {
    public constructor() {
        super("ties", {
            sourceId: ["sourceId"],
        });
    }

    public forSource(id: string): Promise<ExistingDocument<Tie>[]> {
        return this.query(async function (db: PouchDB.Database<Tie>): Promise<ExistingDocument<Tie>[]> {
            const response = await db.find({
                selector: { sourceId: id },
            });

            return response.docs;
        });
    }

    // eslint-disable-next-line class-methods-use-this
    protected beforeUpdate(row: Tie, doc: Document<Tie>): void {
        doc.sourceId             = row.sourceId;
        doc.switchId             = row.switchId;
        doc.inputChannel         = row.inputChannel;
        doc.outputChannels.video = row.outputChannels.video;
        doc.outputChannels.audio = row.outputChannels.audio;
    }
}

export default new TieController();
