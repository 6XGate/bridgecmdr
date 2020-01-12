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
