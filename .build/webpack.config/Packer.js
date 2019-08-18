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

/*
 * =====================================================================================================================
 * Common modules.
 */
const path          = require("path");
const readJson      = require('read-package-json');
const nodeExternals = require('webpack-node-externals');

/*
 * =====================================================================================================================
 * Plug-ins
 */
const CopyPlugin           = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin    = require("html-webpack-plugin");
const VueLoaderPlugin      = require("vue-loader/lib/plugin");

/*
 * =====================================================================================================================
 * Specials
 */
const isDev = process.env["NODE_ENV"] !== "development";

/*
 * =====================================================================================================================
 * Utilities
 */

// TODO: Resolve the packer configuration rather than hard-code it.
const packerConfigPath = "../..";

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

                productName = data["productName"];
                resolve(productName);
            })),
]);

/*
 * =====================================================================================================================
 * Common configuration
 */
const vueLoader = {
    loader: "vue-loader",
    options: {
        optimizeSSR: false,
    },
};

const styleLoader = {
    loader: MiniCssExtractPlugin.loader,
    options: {
        // None specified...
    },
};

const cssLoader = {
    loader: "css-loader",
    options: {
        // None specified...
    },
};

const resolveUrlLoader = {
    loader: "resolve-url-loader",
    options: {
        keepQuery: true,
    },
};

const sassLoader = {
    loader:  "sass-loader",
    options: {
        sourceMap:         isDev,
        sourceMapContents: false,
        implementation:    require("sass"),
    },
};

const fileLoader = {
    loader: "file-loader",
    options: {
        name: "assets/[contenthash].[ext]",
    },
};


/*
 * =====================================================================================================================
 * Common rules
 */
const rules = {
    css: {
        test: (/\.css$/u),
        use:  [
            styleLoader,
            cssLoader,
        ],
    },
    sass: {
        test: (/\.scss$/u),
        use:  [
            styleLoader,
            cssLoader,
            resolveUrlLoader,
            sassLoader,
        ],
    },
    vue: {
        test: (/\.vue$/u),
        use: [
            vueLoader,
        ],
    },
    images: {
        test: (/\.(png|svg|jpg|gif)$/u),
        use: [
            fileLoader,
        ],
    },
    fonts: {
        test: (/\.(woff|woff2|eot|ttf|otf)$/u),
        use: [
            fileLoader,
        ],
    },
};

/*
 * =====================================================================================================================
 * Packer private field symbols
 */
const myOutdir = Symbol("[[Output Directory]]");
const myHtml   = Symbol("[[HTML Template]]");
const myEntry  = Symbol("[[Entry Point]]");
const myAssets = Symbol("[[Raw Assets]]");
const myStyles = Symbol("[[Main Style Sheet]]");
const mySass   = Symbol("[[Main SCSS Style Sheet]]");

/*
 * =====================================================================================================================
 * Packer private method symbols
 */
const GenerateEntry   = Symbol("Generate Entry-Point");
const GeneratePlugins = Symbol("Generate Plug-in List");

module.exports = class Packer {
    constructor() {
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
    }

    /**
     * @param {string} out
     * @returns {Packer}
     */
    output(out) {
        this[myOutdir] = path.resolve(__dirname, packerConfigPath, out);

        return this;
    }

    /**
     * @param {string} main
     * @returns {Packer}
     */
    html(main) {
        this[myHtml] = path.resolve(__dirname, packerConfigPath, main);

        return this;
    }

    /**
     * @param {string} main
     * @returns {Packer}
     */
    js(main) {
        this[myEntry]  = path.resolve(__dirname, packerConfigPath, main);

        return this;
    }

    /**
     * @param {string} main
     * @returns {Packer}
     */
    css(main) {
        this[myStyles] = path.resolve(__dirname, packerConfigPath, main);

        return this;
    }

    /**
     * @param {string} main
     * @returns {Packer}
     */
    sass(main) {
        this[mySass] = path.resolve(__dirname, packerConfigPath, main);

        return this;
    }

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
     * @returns {EntryStatic}
     */
    [GenerateEntry]() {
        const entries = [ String(this[myEntry]) ];

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
     * @returns {WebpackPluginInstance[]}
     */
    [GeneratePlugins]() {
        const plugins = [
            new MiniCssExtractPlugin({
                filename:      "[name].css",
                chunkFilename: "[id].css",
            }),
            new VueLoaderPlugin(),
        ];

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
        for (const key in assets) {
            if (assets.hasOwnProperty(key)) {
                plugins.push(new CopyPlugin([
                    {
                        from: assets[key],
                        to:   path.resolve(packerConfigPath, outdir, key),
                    }
                ]));
            }
        }

        return plugins;
    }

    /**
     * @param {Object.<string, string>} env
     * @return {Promise<WebpackOptions>}
     */
    generate(env) {
        return allReady.then(() => ({
            mode:      env["NODE_ENV"],
            target:    "node",
            externals: [ nodeExternals() ],
            entry:     this[GenerateEntry](),
            output:    {
                path:     String(this[myOutdir]),
                filename: "index.js",
            },
            devtool: isDev ? "source-map" : undefined,
            module:  {
                rules: [
                    rules.css,
                    rules.sass,
                    rules.vue,
                    rules.images,
                    rules.fonts,
                ]
            },
            plugins: this[GeneratePlugins](),
            resolve: {
                extensions: [".wasm", ".mjs", ".js", ".vue"],
            },
        }));
    }
};
