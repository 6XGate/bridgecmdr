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

/* eslint-disable vue/prop-name-casing */
import _                             from "lodash";
import Vue, { CreateElement, VNode } from "vue";
import { VBtn, VIcon, VTextField }   from "vuetify/lib";

const upKeys: { [code: string]: boolean } = {
    "ArrowUp": true,
    "Numpad8": true,
};

const downKeys: { [code: string]: boolean } = {
    "ArrowDown": true,
    "Numpad2":   true,
};

const NumberInput = Vue.extend({
    name:  "NumberInput",
    model: {
        prop:  "value",
        event: "change",
    },
    props: {
        // Component properties
        min:             { type: Number, default: undefined },
        max:             { type: Number, default: undefined },
        // Common properties
        color:           { type: String,  default: undefined },
        dark:            { type: Boolean, default: false },
        height:          { type: [ String, Number ], default: undefined },
        light:           { type: Boolean, default: false },
        loading:         { type: [ Boolean, String ], default: false },
        outlined:        { type: Boolean, default: false },
        rounded:         { type: Boolean, default: false },
        // Text field properties
        autofocus:       { type: Boolean, default: false },
        backgroundColor: { type: String,  default: undefined },
        disable:         { type: Boolean, default: false },
        error:           { type: Boolean, default: false },
        errorCount:      { type: [ String, Number ], default: 1 },
        errorMessages:   { type: [ String, Array ],  default: () => [] },
        filled:          { type: Boolean, default: false },
        flat:            { type: Boolean, default: false },
        fullWidth:       { type: Boolean, default: false },
        hideDetails:     { type: Boolean, default: false },
        hint:            { type: String,  default: "" },
        id:              { type: String,  default: "" },
        label:           { type: String,  default: undefined },
        loaderHeight:    { type: [ String, Number ], default: 2 },
        messages:        { type: [ String, Array ],  default: () => [] },
        persistentHint:  { type: Boolean, default: false },
        placeholder:     { type: String, default: undefined },
        prefix:          { type: String, default: undefined },
        readonly:        { type: Boolean, default: false },
        reverse:         { type: Boolean, default: false },
        rules:           { type: Array, default: () => [] },
        shaped:          { type: Boolean, default: false },
        singleLine:      { type: Boolean, default: false },
        solo:            { type: Boolean, default: false },
        soloInverted:    { type: Boolean, default: false },
        success:         { type: Boolean, default: false },
        successMessages: { type: [ String, Array ],  default: () => [] },
        suffix:          { type: String,  default: "" },
        validateOnBlur:  { type: Boolean, default: false },
        value:           { type: Number,  default: 0 },
        // Button properties
        depressed:       { type: Boolean, default: false },
        elevation:       { type: [ String, Number ], default: undefined },
        ripple:          { type: [ Boolean, Object ], default: undefined },
    },
    data: function () {
        return {
            current: this.value,
        };
    },
    watch: {
        value: function (value) {
            this.current = value;
        },
    },
    methods: {
        button(slot: string, icon: string, click: () => void, create: CreateElement): VNode {
            const attrs = {
                icon:      true,
                color:     this.color,
                dark:      this.dark,
                depressed: this.depressed,
                elevation: this.elevation,
                height:    this.height,
                light:     this.light,
                loading:   this.loading,
                outlined:  this.outlined,
                ripple:    this.ripple,
                rounded:   this.rounded,
            };

            const on = {
                click,
            };

            return create(VBtn, { slot, attrs, on }, [create(VIcon, [icon])]);
        },
        valueChanged(value: string, event: string): void {
            let next = Number(value);

            if (!_.isNil(this.max) && next > this.max) {
                next = this.current;
            }

            if (!_.isNil(this.min) && next < this.min) {
                next = this.current;
            }

            this.$nextTick(() => {
                this.current = next;
                this.$forceUpdate();
            });

            this.$emit(event, next);
        },
        change(value: string): void {
            this.valueChanged(value, "change");
        },
        input(value: string): void {
            this.valueChanged(value, "input");
        },
        keydown(event: KeyboardEvent): void {
            let prevent = false;

            if (!_.isNil(this.max) && this.current >= this.max && Boolean(upKeys[event.code])) {
                event.preventDefault();
                prevent = true;
            }

            if (!_.isNil(this.min) && this.current <= this.min && Boolean(downKeys[event.code])) {
                event.preventDefault();
                prevent = true;
            }

            if (!prevent) {
                this.$emit("keydown", event);
            }
        },
        increment(): void {
            let next = this.current + 1;
            if (!_.isNil(this.max) && next > this.max) {
                next = this.current;
            }

            this.current = next;

            this.$emit("change", this.current);
            this.$emit("input", this.current);
        },
        decrement(): void {
            let next = this.current - 1;
            if (!_.isNil(this.min) && next < this.min) {
                next = this.current;
            }

            this.current = next;

            this.$emit("change", this.current);
            this.$emit("input", this.current);
        },
    },
    render(create: CreateElement): VNode {
        const attrs: Record<string, string> = {
            type: "number",
        };

        const props: Record<string, unknown> = {
            "min":              this.min,
            "max":              this.max,
            "autofocus":        this.autofocus,
            "background-color": this.backgroundColor,
            "color":            this.color,
            "dark":             this.dark,
            "disable":          this.disable,
            "error":            this.error,
            "error-count":      this.errorCount,
            "error-messages":   this.errorMessages,
            "filled":           this.filled,
            "flat":             this.flat,
            "fullWidth":        this.fullWidth,
            "height":           this.height,
            "hide-details":     this.hideDetails,
            "hint":             this.hint,
            "id":               this.id,
            "label":            this.label,
            "light":            this.light,
            "loader-height":    this.loaderHeight,
            "loading":          this.loading,
            "messages":         this.messages,
            "outlined":         this.outlined,
            "persistent-hint":  this.persistentHint,
            "placeholder":      this.placeholder,
            "prefix":           this.prefix,
            "readonly":         this.readonly,
            "reverse":          this.reverse,
            "rounded":          this.rounded,
            "rules":            this.rules,
            "shaped":           this.shaped,
            "single-line":      this.singleLine,
            "solo":             this.solo,
            "solo-inverted":    this.soloInverted,
            "success":          this.success,
            "success-messages": this.successMessages,
            "suffix":           this.suffix,
            "validate-on-blur": this.validateOnBlur,
            "value":            String(this.current),
        };

        const on = {
            "blur":         (...args: unknown[]) => this.$emit("blur", ...args),
            "change":       (value: string) => this.change(value),
            "focus":        (...args: unknown[]) => this.$emit("focus", ...args),
            "keydown":      (event: KeyboardEvent) => this.keydown(event),
            "input":        (value: string) => this.input(value),
            "update:error": (...args: unknown[]) => this.$emit("update:error", ...args),
        };

        return create(VTextField, { props, attrs, on }, [
            this.button("prepend", "mdi-minus", () => this.decrement(), create),
            this.button("append-outer", "mdi-plus", () => this.increment(), create),
        ]);
    },
});

export type NumberInputComponent = InstanceType<typeof NumberInput>;

export default NumberInput;
