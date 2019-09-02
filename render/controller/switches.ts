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

import Switch                   from "../models/switch";
import Controller, { Document } from "../support/controller";
// import Tie     from "../models/tie";

class SwitchController extends Controller<Switch> {
    public constructor() {
        super("switches");
    }

    // eslint-disable-next-line class-methods-use-this
    protected beforeUpdate(row: Switch, doc: Document<Switch>): void {
        // eslint-disable-next-line @typescript-eslint/camelcase
        doc.driverId = row.driverId;
        doc.title    = row.title;
        doc.config   = row.config;
    }

    // eslint-disable-next-line class-methods-use-this
    protected afterRemove(_doc: Document<Switch>): void {
        // TODO: Remove all ties for this source.
    }
}

export default new SwitchController();
