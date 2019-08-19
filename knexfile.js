const path       = require("path");
const xdgBasedir = require("xdg-basedir");

// noinspection SpellCheckingInspection
/** @type {string} */
const configBaseDir = path.resolve(xdgBasedir.config, "org.sleepingcats.bridgecmdr");
/** @type {string} */
const settingsDatabase = path.resolve(configBaseDir, "settings.db");

module.exports = {
    client:     "sqlite3",
    connection: {
        filename: settingsDatabase,
    },
    migrations: {
        directory: "./migrations",
        tableName: "migrations",
    },
};
