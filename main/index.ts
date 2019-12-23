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

import { app, BrowserWindow } from "electron";

let window: BrowserWindow|null = null;

function createWindow(): void {
    window = new BrowserWindow({
        width:          800,
        height:         600,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    window.removeMenu();
    if (process.env.NODE_ENV === "production") {
        window.setFullScreen(true);
    }

    window.loadFile("dist/render/index.html").
        then((): void => console.log("Starting BridgeCmdr...")).
        catch((error: Error): void => {
            console.error(error);
            process.exit(1);
        });

    if (process.env.NODE_ENV !== "production") {
        window.webContents.openDevTools({
            mode: "undocked",
        });
    }

    window.on("closed", (): void => {
        // The window was closed, so we want to dereference it to indicate the interface is no longer running.  This is
        // really only relevant on macOS.
        window = null;
    });
}

process.on("SIGTERM", () => {
    if (window !== null) {
        window.close();
    }
});

app.on("ready", (): void => {
    if (process.env.NODE_ENV !== "production") {
        require("./devtools");
    }

    createWindow();
});

app.on("window-all-closed", (): void => {
    if (process.platform !== "darwin") {
        // On macOS, it is common to leave the application running even after all windows are closed.  Only on other
        // platform will we quit.
        app.quit();
    }
});

app.on("activate", (): void => {
    if (window === null) {
        // If an attempt is made to activate the application again, only create a new window if the current one was
        // closed. This should only happen on macOS where it is common to leave the application running even after all
        // windows for it are closed.
        createWindow();
    }
});
