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
    useNullAsDefault: true,
};
