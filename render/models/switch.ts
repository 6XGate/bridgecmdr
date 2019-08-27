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

import Knex from "knex";
import db   from "../support/database";

const Switch = (trx: Knex<Switch> = db) => trx("switches");
interface Switch {
    guid:        string;
    driver_guid: string;
    title:       string;
    config:      string|{ [key: string]: (boolean|number|string) };
}

export default Switch;
