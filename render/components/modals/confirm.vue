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
                    this.options = _.defaultTo<ConfirmModalOptions>(options, DEFAULT_OPTIONS);
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
