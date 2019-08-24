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

import axios from "axios";

/* eslint-disable dot-notation */

// noinspection JSUnresolvedVariable
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
// noinspection JSUnresolvedVariable
axios.defaults.headers.common["Accept"] = "application/json";

// This module is resolved once it executes.
export default Promise.resolve();
