/* eslint-disable @typescript-eslint/explicit-function-return-type */

const _        = require("lodash");
const path     = require("path");
const readJson = require("read-package-json");
const packager = require("electron-packager");

const { EXIT_SUCCESS } = require("./build.common");

const archs = {
    ia32: {
        electron: "ia32",
        debian:   "i386",
    },
    amd64: {
        electron: "x64",
        debian:   "amd64",
    },
    arm: {
        electron: "arm71",
        debian:   "arm",
    },
    arm64: {
        electron: "arm64",
        debian:   "arm64",
    },
};

const myAppName      = Symbol("[[ApplicationName]]");
const myAppCopyright = Symbol("[[ApplicationCopyright]]");
const myAppVersion   = Symbol("[[ApplicationVersion]]");
const myPlatform     = Symbol("[[Platform]]");
const myArchitecture = Symbol("[[Architecture]]");
const myExeName      = Symbol("[[ExecutableName]]");
const mySrcDir       = Symbol("[[SourceDirectory]]");
const myIntDir       = Symbol("[[IntermediateDirectory]]");
const myOutDir       = Symbol("[[OutputDirectory]]");
const myIgnores      = Symbol("[[Ignores]]");

const PreCheckConfig       = Symbol("Pre-check Config");
const PostCheckConfig      = Symbol("Post-check Config");
const GetPackageInfo       = Symbol("Get Package Info");
const ApplyPackageDefaults = Symbol("Apply Package Defaults");
const MakePackagerOptions  = Symbol("Make Packager Options");

function jsonLogger(log, warn, error) {
    log && console.log(log);
    warn && console.warn(warn);
    error && console.error(error);
}

class Packager {
    constructor() {
        this[myAppName]      = "";
        this[myAppCopyright] = "";
        this[myAppVersion]   = "";
        this[myPlatform]     = "";
        this[myArchitecture] = "";
        this[myExeName]      = "";
        this[mySrcDir]       = "";
        this[myIntDir]       = "";
        this[myOutDir]       = "";
        this[myIgnores]      = [];
    }

    app(name, version) {
        this[myAppName]    = name;
        this[myAppVersion] = version;

        return this;
    }

    copyright(line) {
        this[myAppCopyright] = line;

        return this;
    }

    target(platform, arch) {
        this[myPlatform]     = platform;
        this[myArchitecture] = arch;

        return this;
    }

    source(_path) {
        this[mySrcDir] = path.resolve(_path);

        // Default the IntDir and OutDir.
        this[myIntDir] = path.resolve(_path, "int");
        this[myOutDir] = path.resolve(_path, "out");

        return this;
    }

    intermediate(_path) {
        this[myIntDir] = _path;

        return this;
    }

    output(_path, file) {
        this[myOutDir]  = _path;
        this[myExeName] = file || "";

        return this;
    }

    ignore(rule) {
        if (_.isString(rule)) {
            rule = _path => _path === rule;
        } else if (_.isRegExp(rule)) {
            rule = _path => rule.test(_path);
        }

        if (_.isFunction(rule)) {
            this[myIgnores].push(rule);

            return this;
        }

        throw new TypeError("Invalid rule type, must be a string, function, or RegExp");
    }

    [PreCheckConfig]() {
        if (_.isEmpty(this[myPlatform])) {
            throw new Error("No platform defined");
        }

        if (_.isEmpty(this[myArchitecture])) {
            throw new Error("No architecture defined");
        }

        if (_.isEmpty(this[mySrcDir])) {
            throw new Error("No source directory defined");
        }

        if (_.isEmpty(this[myIntDir])) {
            throw new Error("No intermediate directory defined");
        }

        if (_.isEmpty(this[myOutDir])) {
            throw new Error("No output directory defined");
        }
    }

    [PostCheckConfig]() {
        if (_.isEmpty(this[myAppName])) {
            throw new Error("No application name defined");
        }

        if (_.isEmpty(this[myAppVersion])) {
            throw new Error("No application version defined");
        }

        if (_.isEmpty(this[myExeName])) {
            throw new Error("No executable name defined");
        }
    }

    [GetPackageInfo]() {
        return new Promise((resolve, reject) => {
            readJson(path.resolve(this[mySrcDir], "package.json"), jsonLogger, true, (error, data) => {
                if (error) {
                    reject(error);
                }

                resolve(data);
            });
        });
    }

    async [ApplyPackageDefaults]() {
        const appInfo      = await this[GetPackageInfo]();
        this[myAppName]    = this[myAppName] || appInfo.productName || appInfo.name || "";
        this[myAppVersion] = this[myAppVersion] || appInfo.version || "";
        this[myExeName]    = this[myExeName] || appInfo.name || "";
    }

    [MakePackagerOptions](platform, arch) {
        const ignore   = _path => _path.length > 0 && _.some(this[myIgnores], _rule => _rule(_path));

        return {
            dir:            this[mySrcDir],
            appCopyright:   this[myAppCopyright],
            appVersion:     this[myAppVersion],
            executableName: this[myExeName],
            name:           this[myAppName],
            arch:           arch.electron,
            platform:       platform,
            out:            this[myIntDir],
            overwrite:      true,
            ignore,
        };
    }

    async package() {
        this[PreCheckConfig]();

        const platform = this[myPlatform];
        const arch     = archs[this[myArchitecture]];

        if (platform !== "linux") {
            throw new Error("Unknwon platform");
        }

        if (_.isNil(arch)) {
            throw new Error("Unknwon architecture");
        }

        await this[ApplyPackageDefaults]();
        this[PostCheckConfig]();

        const packagerOptions = this[MakePackagerOptions](platform, arch);

        const bundlePath = _.head(await packager(packagerOptions));
        console.log(`Application bundle successfully created at ${bundlePath}`);

        // TODO: Create platform installer.

        return EXIT_SUCCESS;
    }
}

module.exports = new Packager();
