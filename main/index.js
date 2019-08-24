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

// We only want to allow a single window.
let window = null;

function createWindow() {
    const Driver = require("../render/system/Driver").default;
    console.log(Driver.load);

    window = new BrowserWindow({
        width:          800,
        height:         600,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    window.loadFile("dist/render/index.html").
        then(() => console.log("Starting BridgeCmdr...")).
        catch(error => {
            console.error(error);
        });

    window.webContents.openDevTools({
        mode: "undocked",
    });

    window.on("closed", () => {
        // The window was closed, so we want to dereference it to indicate the interface is no longer running.  This is
        // really only relevant on macOS.
        window = null;
    });
}

app.on("ready", () => {
    // eslint-disable-next-line dot-notation
    if (process.env["NODE_DEV"] !== "production") {
        require("vue-devtools").install();
    }

    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        // On macOS, it is common to leave the application running even after all windows are closed.  Only on other
        // platform will we quit.
        app.quit();
    }
});

app.on("activate", () => {
    if (window === null) {
        // If an attempt is made to activate the application again, only create a new window if the current one was
        // closed. This should only happen on macOS where it is common to leave the application running even after all
        // windows for it are closed.
        createWindow();
    }
});
