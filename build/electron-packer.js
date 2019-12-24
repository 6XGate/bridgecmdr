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

/* eslint-disable @typescript-eslint/explicit-function-return-type */

const _         = require("lodash");
const moment    = require("moment");
const path      = require("path");
const readJson  = require("read-package-json");
const packager  = require("electron-packager");
const installer = require("electron-installer-debian");

const { EXIT_SUCCESS } = require("./build.common");

const EPOCH = moment.utc("2019-01-01T00:00:00.000");

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
        electron: "armv7l",
        debian:   "arm",
    },
    arm64: {
        electron: "arm64",
        debian:   "arm64",
    },
};

// callthru, set via the fluent methods.
// merged, set via a debian(options) call.
// calculated, set via calculation only.
// Anything not mentioned will be handled via the debian(options) call or from existing inferred or defined information.
// TODO: both:             callthru, [options.icon], will require some thought to implement...
// TODO: debian-installer: merged, [options.size = calculated size of bundle]
const myAppName          = Symbol("[[ApplicationName]]");
const myAppCopyright     = Symbol("[[ApplicationCopyright]]");
const myAppVersion       = Symbol("[[ApplicationVersion]]");
const myAppDescription   = Symbol("[[ApplicationDescription]]");
const myAuthorName       = Symbol("[[AuthorName]]");
const myAuthorEMail      = Symbol("[[AuthorEMail]]");
const myHomepage         = Symbol("[[Homepage]]");
const myPlatform         = Symbol("[[Platform]]");
const myArchitecture     = Symbol("[[Architecture]]");
const myExeName          = Symbol("[[ExecutableName]]");
const mySrcDir           = Symbol("[[SourceDirectory]]");
const myIntDir           = Symbol("[[IntermediateDirectory]]");
const myOutDir           = Symbol("[[OutputDirectory]]");
const myIgnores          = Symbol("[[Ignores]]");
const myInstallerOptions = Symbol("[[InstallerOptions]]");

const PreCheckConfig       = Symbol("Pre-check Config");
const PostCheckConfig      = Symbol("Post-check Config");
const GetPackageInfo       = Symbol("Get Package Info");
const ApplyPackageDefaults = Symbol("Apply Package Defaults");
const MakePackagerOptions  = Symbol("Make Packager Options");
const MakeInstallerOptions = Symbol("Make Installer Options");

function jsonLogger(log, warn, error) {
    log && console.log(log);
    warn && console.warn(warn);
    error && console.error(error);
}

class Packager {
    constructor() {
        this[myAppName]          = "";
        this[myAppCopyright]     = "";
        this[myAppVersion]       = "";
        this[myAppDescription]   = "";
        this[myAuthorName]       = "";
        this[myAuthorEMail]      = "";
        this[myHomepage]         = "";
        this[myPlatform]         = "";
        this[myArchitecture]     = "";
        this[myExeName]          = "";
        this[mySrcDir]           = "";
        this[myIntDir]           = "";
        this[myOutDir]           = "";
        this[myIgnores]          = [];
        this[myInstallerOptions] = {};
    }

    app(name, version, description) {
        this[myAppName]        = String(name) || "";
        this[myAppVersion]     = String(version) || "";
        this[myAppDescription] = String(description) || "";

        return this;
    }

    author(name, email) {
        this[myAuthorName]  = String(name) || "";
        this[myAuthorEMail] = String(email) || "";
    }

    homepage(url) {
        this[myHomepage] = String(url) || "";
    }

    copyright(line) {
        this[myAppCopyright] = String(line) || "";

        return this;
    }

    target(platform, arch) {
        this[myPlatform]     = String(platform) || "";
        this[myArchitecture] = String(arch) || "";

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
        this[myIntDir] = String(_path);

        return this;
    }

    output(_path, file) {
        this[myOutDir]  = String(_path);
        this[myExeName] = String(file) || "";

        return this;
    }

    ignore(...rules) {
        for (const rule of rules) {
            if (_.isRegExp(rule)) {
                this[myIgnores].push(rule);
            }
        }

        return this;
    }

    installer(options) {
        this[myInstallerOptions] = _.isObject(options) ? options : {};
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
        const appInfo          = await this[GetPackageInfo]();
        this[myAppName]        = this[myAppName] || appInfo.productName || appInfo.name || "";
        this[myAppVersion]     = this[myAppVersion] || appInfo.version || "";
        this[myAppDescription] = this[myAppDescription] || appInfo.description || "";
        this[myAuthorName]     = this[myAuthorName] || appInfo.author.name || "";
        this[myAuthorEMail]    = this[myAuthorEMail] || appInfo.author.email || "";
        this[myHomepage]       = this[myHomepage] || appInfo.homepage || appInfo.author.url || "";
        this[myExeName]        = this[myExeName] || appInfo.name || "";
    }

    [MakePackagerOptions](platform, arch) {
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
            ignore:         this[myIgnores],
        };
    }

    [MakeInstallerOptions](platform, arch) {
        const options = this[myInstallerOptions];

        return {
            // TODO: icon
            bin:                this[myExeName],
            dest:               this[myOutDir],
            name:               this[myExeName],
            productName:        this[myAppName],
            genericName:        options.genericName || this[myAppName],
            description:        _.isEmpty(this[myAppDescription]) ? undefined : this[myAppDescription],
            productDescription: options.productDescription,
            version:            this[myAppVersion],
            section:            options.section,
            priority:           options.priority,
            arch:               arch.debian,
            size:               options.size,
            depends:            options.depends,
            recommends:         options.recommends,
            suggests:           options.suggests,
            enhances:           options.enhances,
            preDepends:         options.preDepends,
            homepage:           _.isEmpty(this[myHomepage]) ? undefined : this[myHomepage],
            categories:         options.categories,
            mimeType:           options.mimeType,
            lintianOverrides:   options.lintianOverrides,
            scripts:            options.scripts,

            // Get the revision from the merged options or calculate one.
            revision: options.revision || (() => {
                const hours = moment.duration(moment.utc().diff(EPOCH)).asHours();

                return String(hours.toFixed());
            })(),

            // Get the maintainer from it's possible combinations formats.
            maintainer: (() => {
                if (!_.isEmpty(this[myAuthorName])) {
                    return !_.isEmpty(this[myAuthorEMail]) ?
                        `${this[myAuthorName]} <${this[myAuthorEMail]}>` :
                        this[myAuthorName];
                } else if (!_.isEmpty(this[myAuthorEMail])) {
                    return this[myAuthorEMail];
                }

                return undefined;
            })(),
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

        const packagerOptions  = this[MakePackagerOptions](platform, arch);
        const bundlePath       = _.head(await packager(packagerOptions));
        console.log(`Application bundle successfully created at ${bundlePath}`);

        const installerOptions = this[MakeInstallerOptions](platform, arch);
        installerOptions.src   = bundlePath;
        await installer(installerOptions);
        console.log(`Application installer successfully created at ${installerOptions.dest}`);

        return EXIT_SUCCESS;
    }
}

module.exports = new Packager();
