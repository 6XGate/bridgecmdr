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

import Vue                                                           from "vue";
import { configure, extend, ValidationObserver, ValidationProvider } from "vee-validate";
import { ValidationMessageTemplate, ValidationRule }                 from "vee-validate/dist/types/types";

Vue.component("ValidationProvider", ValidationProvider);
Vue.component("ValidationObserver", ValidationObserver);

// Import the rules.
const rules = require("vee-validate/dist/rules") as { [rule: string]: ValidationRule };
const en    = require("vee-validate/dist/locale/en.json") as { messages: { [rule: string]: ValidationMessageTemplate } };
for (const rule in rules) {
    if (rules.hasOwnProperty(rule)) {
        extend(rule, {
            ...rules[rule],
            message: en.messages[rule],
        });
    }
}

configure({
    mode: "eager",
});

export default Promise.resolve();
