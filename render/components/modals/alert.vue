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
