import fs         from "fs";
import path       from "path";
import knex       from "knex";
import xdgBasedir from "xdg-basedir";

// noinspection SpellCheckingInspection
/** @type {string} */
const configBaseDir = path.resolve(xdgBasedir.config, "org.sleepingcats.bridgecmdr");
/** @type {string} */
const settingsDatabase = path.resolve(configBaseDir, "settings.db");

// Touch the file to ensure it exist.
fs.mkdirSync(configBaseDir, { recursive: true });
fs.closeSync(fs.openSync(settingsDatabase, "w"));

// Configure the database.
const db = knex({
    client:     "sqlite3",
    connection: {
        filename: settingsDatabase,
    },
    migrations: {
        directory: "./migrations",
        tableName: "migrations",
    },
});

// Run any pending migrations.
db.migrate.latest().catch(error => console.error(error));

// Now, we can export the database connection.
export default db;
