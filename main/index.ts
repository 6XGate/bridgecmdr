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

    window.loadFile("dist/render/index.html").
        then((): void => console.log("Starting BridgeCmdr...")).
        catch((error: Error): void => {
            console.error(error);
            process.exit(1);
        });

    window.webContents.openDevTools({
        mode: "undocked",
    });

    window.on("closed", (): void => {
        // The window was closed, so we want to dereference it to indicate the interface is no longer running.  This is
        // really only relevant on macOS.
        window = null;
    });
}

app.on("ready", (): void => {
    // eslint-disable-next-line dot-notation
    if (process.env["NODE_DEV"] !== "production") {
        const installer: () => void = require("vue-devtools").install;
        installer();
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
