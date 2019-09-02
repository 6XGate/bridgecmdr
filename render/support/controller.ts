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

import _       from "lodash";
import uuid    from "uuid/v4";
import PouchDB from "pouchdb-browser";
import Model   from "./model";

type IndexFields  = string[];
type IndexList    = IndexFields[];
type NamedIndices = { [name: string]: IndexFields };
type Indices      = IndexList|NamedIndices;

export type ExistingDocument<T> = PouchDB.Core.ExistingDocument<T & PouchDB.Core.AllDocsMeta>;
export type Document<T>         = PouchDB.Core.Document<T> & PouchDB.Core.GetMeta;

export default abstract class Controller<T extends Model> {
    private readonly db: PouchDB.Database<T>;
    private readonly namedIndices:  Map<string, IndexFields>;
    private readonly basicIndices: IndexFields[];

    protected constructor(name: string, ...indicesBlocks: Indices[]) {
        // TODO: ow validation

        this.db = new PouchDB<T>(name);
        this.namedIndices = new Map<string, IndexFields>();
        this.basicIndices = [];
        for (const indices of indicesBlocks) {
            if (indices instanceof Array) {
                this.basicIndices.push(...indices);
            } else {
                for (const key in indices) {
                    if (indices.hasOwnProperty(key)) {
                        this.namedIndices.set(key, indices[key]);
                    }
                }
            }
        }
    }

    /**
     * Provides a means to boot up the database for indices.
     */
    public async boot(): Promise<void> {
        const waits = [] as Promise<void>[];

        for (const fields of this.basicIndices) {
            waits.push(this.db.createIndex({ index: { fields } }).then(() => undefined));
        }

        for (const [ name, fields ] of this.namedIndices) {
            waits.push(this.db.createIndex({ index: { fields, name } }).then(() => undefined));
        }

        await Promise.all(waits);
    }

    /**
     * Provides a means to tap into the database interface directly.
     */
    public query<Result>(callback: (db: PouchDB.Database<T>) => Promise<Result>): Promise<Result> {
        return callback(this.db);
    }

    /**
     * Gets all records from the database.
     */
    public async all(): Promise<ExistingDocument<T>[]> {
        const response = await this.db.allDocs({
            // eslint-disable-next-line @typescript-eslint/camelcase
            include_docs: true,
            attachments:  true,
            binary:       true,
            // Since we use GUIDs, the first character will be between these values.
            startkey:     "0",
            endkey:       "[",
        });

        return _(response.rows).map(row => row.doc as ExistingDocument<T>).value();
    }

    /**
     * Gets the specified record from the database.
     */
    public get(id: string, attachments = true): Promise<Document<T>> {
        // TODO: ow validation

        return this.db.get<T>(id, attachments ? {
            attachments: true,
            binary:      true,
        } : {});
    }

    public async add(row: T, ...attachments: File[]): Promise<T> {
        // TODO: ow validation

        row._id = uuid().toUpperCase();

        await this.db.put(row);
        if (attachments.length > 0) {
            await this.addAttachments(row._id, attachments);
        }

        return this.get(row._id);
    }

    public async update(row: T, ...attachments: File[]): Promise<T> {
        // TODO: ow validation

        const id = row._id;

        const doc = await this.get(id);
        this.beforeUpdate(row, doc);

        await this.db.put(doc);
        if (attachments.length > 0) {
            await this.addAttachments(id, attachments);
        }

        return this.get(id);
    }

    public async remove(id: string): Promise<void> {
        // TODO: ow validation

        const doc = await this.get(id, false);

        this.beforeRemove(doc);
        await this.db.remove(doc);
        this.afterRemove(doc);
    }

    protected abstract beforeUpdate(_row: T, _doc: Document<T>): void;

    // eslint-disable-next-line class-methods-use-this
    protected beforeRemove(_doc: Document<T>): void {
        // Does nothing, overridable.
    }

    // eslint-disable-next-line class-methods-use-this
    protected afterRemove(_doc: Document<T>): void {
        // Does nothing, overridable.
    }

    protected async addAttachments(id: string, attachments: File[]): Promise<void> {
        const waits = [] as Promise<void>[];
        for (const attachment of attachments) {
            waits.push(this.get(id).
                then(doc => this.db.putAttachment(id, attachment.name, doc._rev, attachment, attachment.type)).
                then(() => undefined));
        }

        await Promise.all(waits).then(() => undefined);
    }
}
