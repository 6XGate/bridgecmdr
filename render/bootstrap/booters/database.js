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

import fs     from "fs";
import path   from "path";
import db     from "../../support/database";
import config from "../../../knexfile";

/**
 * @param {string|Buffer|URL} dirPath
 *
 * @returns {Promise<void>}
 */
function makeDir(dirPath) {
    return new Promise(function (resolve, reject) {
        fs.mkdir(dirPath, { recursive: true }, function (error) {
            error ? reject(error) : resolve();
        });
    });
}

/**
 * @returns {Promise<void>}
 */
async function readyConfigDatabase() {
    try {
        // Get the configuration directory and ensure it exists.
        const databaseBaseDir = path.dirname(config.connection.filename);
        await makeDir(databaseBaseDir);

        // Run any pending migrations.
        await db.migrate.latest();
    } catch (error) {
        console.log(error);
    }
}

export default readyConfigDatabase();
