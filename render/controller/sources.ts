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

import Source                   from "../models/source";
import Controller, { Document } from "../support/controller";
// import Tie     from "../models/tie";

class SourceController extends Controller<Source> {
    public constructor() {
        super("sources");
    }

    // eslint-disable-next-line class-methods-use-this
    protected beforeUpdate(row: Source, doc: Document<Source>): void {
        doc.title = row.title;
        doc.image = row.image;
    }

    // eslint-disable-next-line class-methods-use-this
    protected afterRemove(_doc: Document<Source>): void {
        // TODO: Remove all ties for this source.
    }
}

export default new SourceController();
