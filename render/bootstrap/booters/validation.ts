import Vue                                                from "vue";
import { extend, ValidationObserver, ValidationProvider } from "vee-validate";
import { ValidationMessageTemplate, ValidationRule }      from "vee-validate/dist/types/types";

Vue.component("ValidationProvider", ValidationProvider);
Vue.component("ValidationObserver", ValidationObserver);

// Import the rules.
const rules: { [rule: string]: ValidationRule }                          = require("vee-validate/dist/rules");
const en:    { messages: { [rule: string]: ValidationMessageTemplate } } = require("vee-validate/dist/locale/en.json");
for (const rule in rules) {
    if (rules.hasOwnProperty(rule)) {
        extend(rule, {
            ...rules[rule],
            message: en.messages[rule],
        });
    }
}

export default Promise.resolve();
