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
                <v-btn text @click="resolve()">{{ options.dismissText }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
    import _                     from "lodash";
    import Vue                   from "vue";
    import { AlertModalOptions } from "./index";

    const DEFAULT_OPTIONS: AlertModalOptions = {
        main:        "",
        dismissText: "Dismiss",
        maxWidth:    500,
    };

    export default Vue.extend({
        name: "AlertModal",
        data: function () {
            return {
                options: {} as AlertModalOptions,
                resolve: (() => undefined) as () => void,
                dialog:  false,
            };
        },
        methods: {
            open(options: AlertModalOptions): Promise<void> {
                return new Promise<void>(resolve => {
                    this.options = _.defaultTo<AlertModalOptions>(options, DEFAULT_OPTIONS);
                    this.resolve = () => {
                        this.dialog = false;
                        resolve();
                    };

                    this.dialog = true;
                });
            },
        },
    });
</script>
