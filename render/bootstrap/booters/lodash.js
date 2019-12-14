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

import _ from "lodash";
import Vue from "vue";

// Remove lodash from the global object so that it must be imported.
delete window._;


// Add lodash based filters.
Vue.filter("get", (input, path, def = null) => _.get(input, path, def));
Vue.filter("has", (input, path) => _.has(input, path));

// This module is resolved once it executes.
export default Promise.resolve();
