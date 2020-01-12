import Vue from "vue";

const DoesValidation = Vue.extend({
    methods: {
        validatesWith(errors: string[]) {
            return {
                "error":          errors.length > 0,
                "error-count":    errors.length,
                "error-messages": errors,
            };
        },
    },
});

export default DoesValidation;
