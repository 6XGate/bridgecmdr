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

/*
 | ---------------------------------------------------------------------------------------------------------------------
 | Vue, the main general purpose UI/UX component framework.
 | ---------------------------------------------------------------------------------------------------------------------
*/

import Vue from "vue";

/*
 | ---------------------------------------------------------------------------------------------------------------------
 | Vuetify, the main component UI/UX framework.
 | ---------------------------------------------------------------------------------------------------------------------
*/

import Vuetify from "vuetify";

Vue.use(Vuetify);

/*
 | ---------------------------------------------------------------------------------------------------------------------
 | VeeValidate, the UI validation framework.
 | ---------------------------------------------------------------------------------------------------------------------
*/

import { configure, extend, ValidationObserver, ValidationProvider } from "vee-validate";
import * as rules                                                    from "vee-validate/dist/rules";
import en                                                            from "vee-validate/dist/locale/en.json";

Vue.component("ValidationProvider", ValidationProvider);
Vue.component("ValidationObserver", ValidationObserver);

const messages = en.messages as Record<string, string>;
for (const [ rule, validators ] of Object.entries(rules)) {
    extend(rule, { ...validators, message: messages[rule] });
}

configure({ mode: "lazy" });

/*
 | ---------------------------------------------------------------------------------------------------------------------
 | Common components
 | ---------------------------------------------------------------------------------------------------------------------
*/

import AlertModal   from "../../components/modals/alert.vue";
import ConfirmModal from "../../components/modals/confirm.vue";
import NumberInput  from "../../components/NumberInput";

// Modals
Vue.component("AlertModal",   AlertModal);
Vue.component("ConfirmModal", ConfirmModal);

// Controls
Vue.component("NumberInput",  NumberInput);

/* ------------------------------------------------------------------------------------------------------------------ */

export default Promise.resolve();
