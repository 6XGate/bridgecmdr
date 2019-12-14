import _       from "lodash";
import PouchDB from "pouchdb-browser";
import uuid from "uuid/v4";

type IndexFields  = Array<string>;
type IndexList    = Array<IndexFields>;
type NamedIndices = Record<string, IndexFields>;

export type Indices             = IndexList|NamedIndices;
export type ExistingDocument<T> = PouchDB.Core.ExistingDocument<T & PouchDB.Core.AllDocsMeta>;
export type GetDocument<T>      = PouchDB.Core.Document<T> & PouchDB.Core.GetMeta;
export type Document<T>         = PouchDB.Core.Document<T>;

export default class Store<Doc extends {}> {
    private readonly db: PouchDB.Database<Doc>;
    private readonly namedIndices: Map<string, IndexFields>;
    private readonly basicIndices: IndexFields[];

    public constructor(name: string, ...indicesBlocks: Indices[]) {
        // TODO: ow validation

        // Create the database.
        this.db = new PouchDB<Doc>(name);

        // Add the indices.
        this.namedIndices = new Map<string, IndexFields>();
        this.basicIndices = [];
        for (const indices of indicesBlocks) {
            if (indices instanceof Array) {
                this.basicIndices.push(...indices);
            } else {
                for (const key in indices) {
                    if (Object.prototype.hasOwnProperty.call(indices, key)) {
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
     * Compacts the database.
     */
    public compact(): Promise<void> {
        return this.db.compact().then(() => undefined);
    }

    /**
     * Provides a means to tap into the database interface directly.
     */
    public query<Result>(callback: (db: PouchDB.Database<Doc>) => Promise<Result>): Promise<Result> {
        return callback(this.db);
    }

    /**
     * Gets all document from the database.
     */
    public async all(): Promise<ExistingDocument<Doc>[]> {
        const response = await this.db.allDocs({
            // eslint-disable-next-line @typescript-eslint/camelcase
            include_docs: true,
            attachments:  true,
            binary:       true,
            // Since we use GUIDs, the first character will be between these values.
            startkey:     "0",
            endkey:       "Z",
        });

        return _(response.rows).map(row => row.doc as ExistingDocument<Doc>).value();
    }


    /**
     * Gets the specified document from the database.
     */
    public get(id: string, attachments = true): Promise<GetDocument<Doc>> {
        // TODO: ow validation

        return this.db.get<Doc>(id, attachments ? {
            attachments: true,
            binary:      true,
        } : {});
    }

    /**
     * Adds a document to the database.
     */
    public async add(doc: Document<Doc>, ...attachments: File[]): Promise<GetDocument<Doc>> {
        // TODO: ow validation

        doc._id = uuid().toUpperCase();

        await this.db.put(doc);
        if (attachments.length > 0) {
            await this.addAttachments(doc._id, attachments);
        }

        return this.get(doc._id);
    }

    /**
     * Updates an existing document in the database.
     */
    public async update(doc: GetDocument<Doc>, ...attachments: File[]): Promise<GetDocument<Doc>> {
        // TODO: ow validation

        const id  = doc._id;
        await this.db.put(doc);
        if (attachments.length > 0) {
            await this.addAttachments(id, attachments);
        }

        return this.get(id);
    }

    /**
     * Removes a document from the database.
     */
    public async remove(id: string): Promise<void> {
        // TODO: ow validation

        const doc = await this.get(id, false);
        await this.db.remove(doc);
    }

    /**
     * Adds attachments to a document.
     */
    protected async addAttachments(id: string, attachments: File[]): Promise<void> {
        // Add each attachment one-at-a-time, this must be serial.
        for (const attachment of attachments) {
            // eslint-disable-next-line no-await-in-loop
            const doc = await this.get(id, false);
            // eslint-disable-next-line no-await-in-loop
            await this.db.putAttachment(id, attachment.name, doc._rev, attachment, attachment.type);
        }
    }
}
