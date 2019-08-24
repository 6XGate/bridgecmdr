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

/** @type {Map<string, Source>} */
const knownSources = new Map();

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
     * @param {Tie[]}  ties
     */
    static add(guid, title, image, ties) {
        // TODO: ow validation

        guid = String(guid).toUpperCase();
        if (knownSources.has(guid)) {
            throw new ReferenceError(`Cannot register source "${title}" to GUID ${guid}, it is already used`);
        }

        const newSource = new Source(guid, title, image, ties);
        knownSources.set(guid, newSource);

        return newSource;
    }

    /**
     * Clears all known sources.
     */
    static clear() {
        knownSources.clear();
    }

    /**
     * Finds a known source.
     *
     * @param {string} guid
     *
     * @returns {Source}
     */
    static find(guid) {
        // TODO: ow validation

        guid = String(guid).toUpperCase();
        if (!knownSources.has(guid)) {
            throw new ReferenceError(`No source is registered for "${guid}"`);
        }

        return knownSources.get(guid);
    }

    /**
     * Initializes a new instance of the Source class.
     *
     * @param {string} guid  The GUID that identifies the source.
     * @param {string} title The title for the source.
     * @param          image An image to represent the source.
     * @param {Tie[]}  ties  The ties needed for switching to the source.
     */
    constructor(guid, title, image, ties) {
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
         * @type {any}
         * @readonly
         */
        this.image = image;

        /**
         * @type {Tie[]}
         * @readonly
         */
        this.ties = Object.freeze(ties);

        // Ensure all current properties are read-only.
        Object.freeze(this);
    }

    /**
     * Connect the channel ties to select the source.
     *
     * @returns {Promise<void>}
     */
    select() {
        /** @type {Promise<void>[]} */
        const promises = [];
        for (const tie of this.ties) {
            promises.push(tie.switch.setTie(tie.input, tie.output.video, tie.output.audio));
        }

        // noinspection JSValidateTypes
        return Promise.all(promises);
    }
}
