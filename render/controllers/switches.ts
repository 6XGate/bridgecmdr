/*
BridgeCmdr - A/V switch and monitor controller
Copyright (C) 2019-2020 Matthew Holder

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

import Controller from "../foundation/controller";
import Switch     from "../models/switch";
import ties       from "./ties";

class SwitchController extends Controller<Switch> {
    public constructor() {
        super("switches");
    }

    public async remove(id: string): Promise<void> {
        await this.store.remove(id);
        await Promise.all((await ties.forSwitch(id)).map(tie => ties.remove(tie._id)));
    }
}

export default new SwitchController();
