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

import fs   from "fs";
import path from "path";
import db   from "../../support/database";

function makeDir(dirPath: string|Buffer|URL): Promise<void> {
    return new Promise(function (resolve, reject): void {
        fs.mkdir(dirPath, { recursive: true }, function (error) {
            error ? reject(error) : resolve();
        });
    });
}

async function readyConfigDatabase(): Promise<void> {
    try {
        // Get the configuration directory and ensure it exists.
        const databaseBaseDir = path.dirname(require("../../../knexfile").connection.filename);
        await makeDir(databaseBaseDir);

        // Run any pending migrations.
        await db.migrate.latest();
    } catch (error) {
        console.log(error);
    }
}

export default readyConfigDatabase();
