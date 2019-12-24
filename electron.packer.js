/* eslint-disable @typescript-eslint/explicit-function-return-type */

const path     = require("path");
const packager = require("electron-packager");
const readJson = require("read-package-json");

const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;

function jsonLogger(log, warn, error) {
    log && console.log(log);
    warn && console.warn(warn);
    error && console.error(error);
}

function readPackageJson() {
    return new Promise((resolve, reject) => {
        readJson("./package.json", jsonLogger, true, (error, data) => {
            if (error) {
                reject(error);
            }

            resolve(data);
        });
    });
}

async function main() {
    const appInfo = await readPackageJson();
    const outDir  = "out";
    const srcDir  = ".";

    // TODO: arch
    // TODO: platform
    const options = {
        dir:            path.resolve(__dirname, srcDir),
        appCopyright:   `Copyright 2019 ${appInfo.author.name}`,
        appVersion:     appInfo.version,
        executableName: appInfo.name,
        name:           appInfo.productName,
        out:            path.resolve(__dirname, outDir),
        overwrite:      true,
        ignore:         _path => _path.length > 0 &&
            !(_path.startsWith("/dist") ||
            _path.startsWith("/node_modules") ||
            _path === "/package.json"),
    };

    const paths = await packager(options);

    console.log("Done packaging application");
    paths.forEach(_path => { console.log(_path); });

    return EXIT_SUCCESS;
}

main().
    then(code => {
        process.exit(code);
    }).catch(error => {
        console.error(error);
        process.exit(EXIT_FAILURE);
    });
