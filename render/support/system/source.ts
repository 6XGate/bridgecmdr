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

import Tie from "./tie";

const knownSources = new Map<string, Source>();

/**
 * Provides information about and a means to select a source.
 */
export default class Source {
    /**
     * Registers a new known source.
     *
     * @param guid
     * @param title
     * @param image
     * @param ties
     */
    static add(guid: string, title: string, image: Blob, ties: Tie[]): Source {
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
    static clear(): void {
        knownSources.clear();
    }

    /**
     * Finds a known source.
     *
     * @param guid
     */
    static find(guid: string): Source {
        // TODO: ow validation

        guid = String(guid).toUpperCase();
        const source = knownSources.get(guid);
        if (source === undefined) {
            throw new ReferenceError(`No source is registered for "${guid}"`);
        }

        return source;
    }

    public readonly guid: string;

    public readonly title: string;

    public readonly image: Blob;

    public readonly ties: Readonly<Tie[]>;

    /**
     * Initializes a new instance of the Source class.
     *
     * @param guid  The GUID that identifies the source.
     * @param title The title for the source.
     * @param image An image to represent the source.
     * @param ties  The ties needed for switching to the source.
     */
    constructor(guid: string, title: string, image: Blob, ties: Tie[]) {
        // TODO: ow validation

        this.guid  = guid;
        this.title = title;
        this.image = image;
        this.ties  = Object.freeze(ties);

        // Ensure all current properties are read-only.
        Object.freeze(this);
    }

    /**
     * Connect the channel ties to select the source.
     */
    select(): Promise<void> {
        const promises: Promise<void>[] = [];
        for (const tie of this.ties) {
            promises.push(tie.switch.setTie(tie.input, tie.output.video, tie.output.audio));
        }

        return Promise.all(promises).then(() => undefined);
    }
}
