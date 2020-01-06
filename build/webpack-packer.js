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

/*
 * =====================================================================================================================
 * Common modules.
 */
const _             = require("lodash");
const path          = require("path");
const readJson      = require("read-package-json");
const nodeExternals = require("webpack-node-externals");

/*
 * =====================================================================================================================
 * Plug-ins
 */
const CopyPlugin           = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin    = require("html-webpack-plugin");
const VueLoaderPlugin      = require("vue-loader/lib/plugin");

/*
 * =====================================================================================================================
 * Specials
 */

const isDev = process.env.NODE_ENV !== "development";

/*
 * =====================================================================================================================
 * Utilities
 */

// TODO: Resolve the packer configuration rather than hard-code it.
const packerConfigPath = "..";

/** @type {string} */
let productName;

/** @type {Promise<Array>} */
const allReady = Promise.all([
    new Promise((resolve, reject) =>
        readJson(path.resolve(__dirname, packerConfigPath, "package.json"), console.error, true,
            function cb_(error, data) {
                if (error) {
                    reject(error);

                    return;
                }

                // eslint-disable-next-line dot-notation
                productName = data["productName"];
                resolve(productName);
            })),
]);

/*
 * =====================================================================================================================
 * Packer private field symbols
 */
const myRules   = Symbol("[[Rules]]");
const myLoaders = Symbol("[[Loaders]]");
const myOutdir  = Symbol("[[Output Directory]]");
const myHtml    = Symbol("[[HTML Template]]");
const myEntry   = Symbol("[[Entry Point]]");
const myAssets  = Symbol("[[Raw Assets]]");
const myStyles  = Symbol("[[Main Style Sheet]]");
const mySass    = Symbol("[[Main SCSS Style Sheet]]");
const myPlugins = Symbol("[[Extra Plugins]]");
const myExtras  = Symbol("[[Extra configuration]]");

/*
 * =====================================================================================================================
 * Packer private method symbols
 */
const GenerateEntry   = Symbol("Generate Entry-Point");
const GeneratePlugins = Symbol("Generate Plug-in List");

class Packer {
    constructor() {
        /** @type {{[string]: RuleSetUseItem}} Common configuration */
        const loaders = {
            esLint: {
                loader: "eslint-loader",
            },
            typeScript: {
                loader:  "ts-loader",
                options: {
                    appendTsSuffixTo: [(/\.vue$/u)],
                },
            },
            vue: {
                loader:  "vue-loader",
                options: {
                    optimizeSSR: false,
                },
            },
            style: {
                loader:  MiniCssExtractPlugin.loader,
                options: {
                    // None specified...
                },
            },
            css: {
                loader:  "css-loader",
                options: {
                    // None specified...
                },
            },
            resolveUrl: {
                loader:  "resolve-url-loader",
                options: {
                    keepQuery: true,
                },
            },
            sass: {
                loader:  "sass-loader",
                options: {
                    sourceMap:      isDev,
                    implementation: require("sass"),
                    sassOptions:    {
                        fiber: require("fibers"),
                    },
                },
            },
            file: {
                loader:  "file-loader",
                options: {
                    name: "assets/[contenthash].[ext]",
                },
            },
        };

        /** @type {{[string]: RuleSetRule}} Common rules */
        const rules = {
            lint: {
                enforce: "pre",
                test:    (/\.(js|ts|vue)$/u),
                exclude: (/node_modules/u),
                use:     [loaders.esLint],
            },
            typeScript: {
                test: (/\.ts$/u),
                use:  [loaders.typeScript],
            },
            css: {
                test: (/\.css$/u),
                use:  [
                    loaders.style,
                    loaders.css,
                ],
            },
            sass: {
                test: (/\.s[ac]ss$/u),
                use:  [
                    loaders.style,
                    loaders.css,
                    loaders.resolveUrl,
                    loaders.sass,
                ],
            },
            vue: {
                test: (/\.vue$/u),
                use:  [loaders.vue],
            },
            images: {
                test: (/\.(png|svg|jpg|gif)$/u),
                use:  [loaders.file],
            },
            fonts: {
                test: (/\.(woff|woff2|eot|ttf|otf)$/u),
                use:  [loaders.file],
            },
        };

        /** @type {{[string]: RuleSetUse}} */
        this[myLoaders] = loaders;
        /** @type {{[string]: RuleSetRule}} */
        this[myRules] = rules;
        /** @type {string} */
        this[myOutdir] = "";
        /** @type {string} */
        this[myHtml] = "";
        /** @type {string} */
        this[myEntry] = "";
        /** @type {string} */
        this[myStyles] = "";
        /** @type {string} */
        this[mySass] = "";
        /** @type {string} */
        this[myAssets] = {};
        /** @type {(WebpackPluginInstance | WebpackPluginFunction)[]} */
        this[myPlugins] = [];
        /** @type {Partial<WebpackOptions>} */
        this[myExtras] = {};
    }

    /**
     * @param {string} out
     * @returns {Packer}
     */
    output(out) {
        this[myOutdir] = path.resolve(__dirname, packerConfigPath, out);

        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {string} main
     * @returns {Packer}
     */
    html(main) {
        this[myHtml] = path.resolve(__dirname, packerConfigPath, main);

        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {string} main
     * @returns {Packer}
     */
    js(main) {
        this[myEntry]  = path.resolve(__dirname, packerConfigPath, main);

        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {string} main
     * @returns {Packer}
     */
    css(main) {
        this[myStyles] = path.resolve(__dirname, packerConfigPath, main);

        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {string} main
     * @returns {Packer}
     */
    sass(main) {
        this[mySass] = path.resolve(__dirname, packerConfigPath, main);

        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {string} source
     * @param {string} dest
     * @returns {Packer}
     */
    assets(source, dest) {
        this[myAssets] = {
            [dest]: path.resolve(__dirname, packerConfigPath, source),
        };

        return this;
    }

    /**
     * @param {WebpackPluginInstance | WebpackPluginFunction} plugin
     * @returns {Packer}
     */
    plugin(plugin) {
        this[myPlugins].push(plugin);

        return this;
    }

    /**
     * @param {Partial<WebpackOptions>} more
     * @returns {Packer}
     */
    merge(more) {
        this[myExtras] = more;

        return this;
    }

    /**
     * @param {string}                          name
     * @param {Extract<RuleSetUseItem, Object>} changes
     * @returns {Packer}
     */
    loader(name, changes) {
        if (_.isObject(changes)) {
            const loader = this[myLoaders][name];
            if (loader) {
                this[myLoaders][name] = _.merge(loader, changes);
            } else {
                throw new ReferenceError("`name` does references a known built-in loader");
            }
        } else {
            throw new TypeError("`changes` must be a single `RuleSetUseItem` object");
        }

        return this;
    }

    /**
     * @param {string}      name
     * @param {RuleSetRule} changes
     * @returns {Packer}
     */
    rule(name, changes) {
        if (_.isObject(changes)) {
            const rule = this[myRules][name];
            if (rule) {
                this[myRules][name] = _.merge(rule, changes);
            } else {
                this[myRules][name] = rule;
            }
        } else {
            throw new TypeError("`changes` must be a single `RuleSetRule` object");
        }

        return this;
    }

    /**
     * @returns {EntryStatic}
     */
    [GenerateEntry]() {
        const entries = [String(this[myEntry])];

        const styles = String(this[myStyles]);
        if (styles.length > 0) {
            entries.push(styles);
        }

        const sass = String(this[mySass]);
        if (sass.length > 0) {
            entries.push(sass);
        }

        return { "index": entries };
    }

    /**
     * @returns {(WebpackPluginInstance|WebpackPluginFunction)[]}
     */
    [GeneratePlugins]() {
        const plugins = this[myPlugins].concat([
            new MiniCssExtractPlugin({
                filename:      "[name].css",
                chunkFilename: "[id].css",
            }),
            new VueLoaderPlugin({
                productionMode: process.env.NODE_ENV === "production",
            }),
        ]);

        const outdir = String(this[myOutdir]);

        const html = String(this[myHtml]);
        if (html.length > 0) {
            plugins.push(new HtmlWebpackPlugin({
                title:    productName,
                filename: path.resolve(packerConfigPath, outdir, "index.html"),
                template: path.resolve(packerConfigPath, html),
                minify:   isDev,
                // TODO: favicon, meta
            }));
        }

        const assets = this[myAssets];
        if (!_.isEmpty(assets)) {
            plugins.push(new CopyPlugin(
                _.map(assets, (src, dest) => ({ from: src, to: path.resolve(packerConfigPath, outdir, dest) })),
            ));
        }

        return plugins;
    }

    /**
     * @param {Object.<string, string>} env
     * @param {string}                  target
     * @return {Promise<WebpackOptions>}
     */
    generate(env, target) {
        return allReady.then(() => _.merge({
            mode:   env.NODE_ENV,
            target: target,
            stats:  {
                builtAt:      false, // Don't need to know when it was built.
                children:     false, // Don't need to see all the children.
                chunks:       false, // Don't really need to know the chunks.
                chunkGroups:  false, // Don't really need to know the chunk groups.
                chunkModules: false, // Don't need to know the modules in a chunk.
                chunkOrigins: false, // Don't really need to know the chunk origins.
                hash:         false, // Don't really need to know the hash.
                modules:      false, // Don't need to know the modules.
                reasons:      false, // Don't need to know why modules are included.
            },
            externals: [
                nodeExternals({
                    modulesFromFile: {
                    // Anything in development dependencies are expected to be packed or used for packing.
                        exclude: ["devDependencies"],
                        // Anything in standard dependencies are expected not be packed for any number of reasons.
                        include: ["dependencies"],
                    },
                }),
            ],
            entry:  this[GenerateEntry](),
            output: {
                path:     String(this[myOutdir]),
                filename: "index.js",
            },
            devtool: isDev ? "source-map" : undefined,
            module:  {
                rules: [
                    this[myRules].lint,
                    this[myRules].typeScript,
                    this[myRules].css,
                    this[myRules].sass,
                    this[myRules].vue,
                    this[myRules].images,
                    this[myRules].fonts,
                ],
            },
            plugins: this[GeneratePlugins](),
            resolve: {
                extensions: [ ".wasm", ".vue", ".ts", ".mjs", ".js", ".json" ],
            },
        }, this[myExtras]));
    }
}

Packer.main   = new Packer();
Packer.render = new Packer();

module.exports = Packer;
