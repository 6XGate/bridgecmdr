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

// import Tie from "./Tie";

/** @type {Map<string, Source>} */
const knownSources = new Map();

// TODO: Add ties.

/**
 * Provides information about and a means to select a source.
 */
export default class Source {
    /**
     * Registers a new known source.
     *
     * @param {string} guid
     * @param {string} title
     * @param          image
     */
    static add(guid, title, image) {
        // TODO: ow validation

        guid = String(guid).toUpperCase();
        if (knownSources.has(guid)) {
            throw new ReferenceError(`Cannot register source "${title}" to GUID ${guid}, it is already used`);
        }

        const newSource = new Source(guid, title, image);
        knownSources.set(guid, newSource);

        return newSource;
    }

    /**
     * Clears all known sources.
     */
    static clear() {
        knownSources.clear();
    }

    static find(guid) {
        // TODO: ow validation

        guid = String(guid).toUpperCase();
        if (!knownSources.has(guid)) {
            throw new ReferenceError(`No source is registered for "${guid}"`);
        }

        return knownSources.get(guid);
    }

    /**
     * Creates a new instance of the Source class.
     *
     * @param {string} guid
     * @param {string} title
     * @param          image
     */
    constructor(guid, title, image) {
        // TODO: ow validation

        /**
         * @type {string}
         * @readonly
         */
        this.guid = guid;

        /**
         * @type {string}
         * @readonly
         */
        this.title = title;

        // TODO: Figure out type.

        /**
         * @type {*}
         * @readonly
         */
        this.image = image;

        // Ensure all current properties are read-only.
        Object.freeze(this);
    }

    /**
     * @returns {Promise<void>}
     */
    select() {
        // TODO: Select the device by selecting all related ties.

        return Promise.resolve();
    }
}
