/*
BridgeCmdr - A/V switch and monitor controller
Copyright (C) 2019-2020 Matthew Holder

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

import _                                         from "lodash";
import Model                                     from "./model";
import Store, { GetDocument, Document, Indices } from "./store";

export default abstract class Controller<T extends Model, Doc extends T|Document<{}> = T> {
    protected readonly store: Store<Doc>;

    protected constructor(name: string, ...indicesBlocks: Indices[]) {
        // TODO: ow validation

        this.store = new Store<Doc>(name, ...indicesBlocks);
    }

    /**
     * Provides a means to boot up the database for indices.
     */
    public boot(): Promise<void> {
        return this.store.boot();
    }

    /**
     * Compacts the database.
     */
    public compact(): Promise<void> {
        return this.store.compact();
    }

    /**
     * Gets all records from the database.
     */
    public all(): Promise<T[]> {
        return this.store.all() as Promise<T[]>;
    }

    /**
     * Gets the specified record from the database.
     */
    public get(id: string): Promise<T> {
        return this.store.get(id) as Promise<T>;
    }

    /**
     * Adds a new record to the database.
     */
    public add(record: T): Promise<T> {
        return this.store.add(record as Doc) as Promise<T>;
    }

    /**
     * Updates a record in the database.
     */
    public async update(record: T): Promise<T> {
        const doc = await this.store.get(record._id);

        return this.store.update(_.tap(record as GetDocument<Doc>, value => {
            value._rev = doc._rev;
        })) as Promise<T>;
    }

    /**
     * Removes a record from the database.
     */
    public remove(id: string): Promise<void> {
        return this.store.remove(id);
    }
}
