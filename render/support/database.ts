import PouchDB from "pouchdb-browser";
import Find    from "pouchdb-find";

PouchDB.
    plugin(Find);

export default PouchDB;
