<!--
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
-->

<template>
    <v-dialog v-model="dialog" :max-width="options.maxWidth">
        <v-card>
            <v-card-title class="headline">{{ options.main }}</v-card-title>
            <v-card-text v-show="Boolean(options.secondary)">{{ options.secondary }}</v-card-text>
            <v-card-actions>
                <div class="flex-grow-1"></div>
                <v-btn text @click="resolve(false)">{{ options.rejectText }}</v-btn>
                <v-btn text @click="resolve(true)">{{ options.confirmText }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
    import _                       from "lodash";
    import Vue                     from "vue";
    import { ConfirmModalOptions } from "./index";

    const DEFAULT_OPTIONS: ConfirmModalOptions = {
        main:        "",
        confirmText: "Yes",
        rejectText:  "No",
        maxWidth:    500,
    };

    export default Vue.extend({
        name: "ConfirmModal",
        data: function () {
            return {
                options: {} as ConfirmModalOptions,
                resolve: ((_value: boolean) => undefined) as (value: boolean) => void,
                dialog:  false,
            };
        },
        methods: {
            open(options: ConfirmModalOptions): Promise<boolean> {
                return new Promise<boolean>(resolve => {
                    this.options = _.defaults(options, DEFAULT_OPTIONS);
                    this.resolve = value => {
                        this.dialog = false;
                        resolve(value);
                    };

                    this.dialog = true;
                });
            },
        },
    });
</script>
