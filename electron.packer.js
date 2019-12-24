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

const packager = require("./build/electron-packer");

packager.source(".").target("linux", "arm").
    ignore(
        // In the root, exclude these patterns or paths
        new RegExp("^/\\.", "u"),
        new RegExp("^/main", "u"),
        new RegExp("^/render", "u"),
        new RegExp("^/build", "u"),
        new RegExp("^/bridgecmdr$", "u"),
        new RegExp("^/[^/]+\\.txt$", "u"),
        new RegExp("^/[^/]+\\.md", "u"),
        new RegExp("^/[^/]+\\.dic", "u"),
        new RegExp("^/[^/]+\\.packer\\.js", "u"),
        new RegExp("^/[^/]+-lock\\.json", "u"),

        // At all levels, exclude these patterns
        new RegExp("/tsconfig.json$", "u"),
        new RegExp("\\.ts", "u"),
    ).
    installer({
        productDescription: "Professional Raspberry Pi A/V switch and monitor controller for retro gaming.",
    });
