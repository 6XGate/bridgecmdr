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

import _            from "lodash";
import Source       from "../models/source";
import { Document } from "../support/store";
import Controller   from "../support/controller";
// import Tie     from "../models/tie";

type SourceDocument = Document<{
    title: string;
    image: string;
}>;

class SourceController extends Controller<Source, SourceDocument> {
    public constructor() {
        super("sources");
    }

    public async all(): Promise<Source[]> {
        const docs    = await this.store.all();
        const records = [] as Source[];
        for (const doc of docs) {
            if (!_.isNil(doc._attachments) && !_.isNil(doc._attachments[doc.image])) {
                const attachment = doc._attachments[doc.image] as PouchDB.Core.FullAttachment;
                if (!_.isNil(attachment.data)) {
                    records.push({
                        _id:   doc._id,
                        title: doc.title,
                        image: new File([attachment.data as Blob], doc.image, { type: attachment.content_type }),
                    });
                }
            }
        }

        return records;
    }

    public async get(id: string): Promise<Source> {
        const doc = await this.store.get(id);
        if (!_.isNil(doc._attachments) && !_.isNil(doc._attachments[doc.image])) {
            const attachment = doc._attachments[doc.image] as PouchDB.Core.FullAttachment;
            if (!_.isNil(attachment.data)) {
                return {
                    _id:   doc._id,
                    title: doc.title,
                    image: new File([attachment.data as Blob], doc.image, { type: attachment.content_type }),
                };
            }
        }

        throw new ReferenceError(`Source "${id}" not found`);
    }

    public async add(record: Source): Promise<Source> {
        const doc = await this.store.add({
            _id:   record._id,
            title: record.title,
            image: record.image.name,
        }, record.image);

        return {
            _id:   doc._id,
            title: doc.title,
            image: record.image,
        };
    }

    public async update(record: Source): Promise<Source> {
        let doc = await this.store.get(record._id);
        doc     = await this.store.update(_.tap(doc, value => {
            value.title = record.title;
            value.image = record.image.name;
        }), record.image);

        return {
            _id:   doc._id,
            title: doc.title,
            image: record.image,
        };
    }

    public remove(id: string): Promise<void> {
        // TODO: Remove all ties for the source.
        return this.store.remove(id);
    }
}

export default new SourceController();
