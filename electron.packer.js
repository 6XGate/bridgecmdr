/* eslint-disable @typescript-eslint/explicit-function-return-type */

const packager = require("./build/electron-packer");

packager.source(".").target("linux", "amd64").
    ignore(_path => !(_path.startsWith("/dist") ||
        _path.startsWith("/node_modules") ||
        _path === "/package.json"));
