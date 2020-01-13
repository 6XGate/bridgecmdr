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

import { promises as fs } from "fs";
import path from "path";
import Vue from "vue";
import xdgBasedir from "xdg-basedir";

export default async function doFirstRun(parent: Vue): Promise<void> {
    const configDir    = xdgBasedir.config;
    const doneFirstRun = Number(window.localStorage.getItem("doneFirstRun") || 0);
    if (doneFirstRun < 1) {
        // 1. Auto-start file creation.
        if (configDir) {
            const autoStartDir = path.resolve(configDir, "autostart");
            await fs.mkdir(autoStartDir, { recursive: true });

            const autoStartFile = "org.sleepingcats.BridgeCmdr.desktop";
            const autoStartPath = path.resolve(autoStartDir, autoStartFile);

            const autoStartExists = await fs.stat(autoStartPath).
                then(stat => stat.isFile()).catch(() => false);
            if (!autoStartExists) {
                const createAutoStart = await parent.$modals.confirm({
                    main:      "Do you want BridgeCmdr to start on boot?",
                    secondary: "You can start BridgeCmdr when your system starts",
                });

                if (createAutoStart) {
                    const needsExecProxy = (/electron$/u).test(process.execPath);
                    const exec = needsExecProxy ?
                        path.resolve(window.__dirname, "../../bridgecmdr") :
                        "bridgecmdr";
                    try {
                        const entry = await fs.open(autoStartPath, "w", 0o644);
                        await entry.write("[Desktop Entry]\n");
                        await entry.write("Name=BridgeCmdr\n");
                        await entry.write(`Exec=${exec}\n`);
                        await entry.write("NoDisplay=true\n");
                        await entry.write("Terminal=false\n");
                    } catch (error) {
                        const ex = error as Error;
                        await parent.$modals.alert({
                            main:      "Unable create auto-start entry",
                            secondary: ex.message,
                        });
                    }
                }
            }
        }

        window.localStorage.setItem("doneFirstRun", String(1));
    }
}
