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
import db from "../support/database";

const Tie = (trx: Knex<Tie> = db) => trx("ties");
interface Tie {
    guid:                 string;
    source_guid:          string;
    switch_guid:          string;
    input_channel:        number;
    video_output_channel: number;
    audio_output_channel: number;
}

export default Tie;
