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
    <v-app id="bridgecmdr">
        <v-content class="black">
            <v-container>
                <v-row no-gutters>
                    <v-col cols="auto">
                        <v-row justify="start" no-gutters>
                            <v-card v-for="button of buttons" :key="button.key" class="ma-1" :class="button.classes"
                                    tile @click="() => button.activate()">
                                <v-img :src="button.image" width="128px" height="128px"/>
                            </v-card>
                        </v-row>
                    </v-col>
                </v-row>
            </v-container>
        </v-content>
        <v-layout row class="ma-3 text-right fab-container">
            <v-btn color="red" class="mx-2 secondaryText--text" fab @click="powerOff">
                <v-icon>mdi-power</v-icon>
            </v-btn>
            <settings-page #activator="{ open }" transition="dialog-bottom-transition" @done="refresh">
                <v-btn color="secondary" class="mx-2 secondaryText--text" fab @click="open">
                    <v-icon>mdi-wrench</v-icon>
                </v-btn>
            </settings-page>
        </v-layout>
        <alert-modal ref="alert"/>
        <confirm-modal ref="confirm"/>
    </v-app>
</template>

<script lang="ts">
    import Vue                       from "vue";
    import mixins                    from "vue-typed-mixins";
    import SettingsPage              from "./pages/SettingsPage.vue";
    import vuetify                   from "../config/vuetify";
    import { Button, makeDashboard } from "../controllers/dashboard";
    import withRefs                  from "../foundation/concerns/with-refs";
    import * as helpers              from "../foundation/helpers";
    import registry                  from "../foundation/system/registry";
    import Switch                    from "../foundation/system/switch";
    import doFirstRun                from "../support/first-run";
    import {
        AlertModal,
        AlertModalOptions,
        ConfirmModal,
        ConfirmModalOptions,
    } from "../components/modals";

    type References = {
        alert:   AlertModal;
        confirm: ConfirmModal;
    };

    export default mixins(withRefs<References>()).extend({
        name:       "Application",
        components: {
            SettingsPage,
        },
        data: function () {
            return {
                buttons: [] as Button[],
            };
        },
        methods: {
            async refresh() {
                this.buttons = [];
                await registry.reload();
                this.buttons = await makeDashboard();
            },
            async powerOff() {
                try {
                    await Promise.all(Switch.all().map(_switch => _switch.powerOff()));
                } catch (error) {
                    console.error(error);
                }

                if (process.env.NODE_ENV === "production") {
                    await helpers.signalShutdown();
                }

                window.close();
            },
        },
        mounted() {
            Vue.prototype.$modals = {
                alert:   (options: AlertModalOptions) => this.$refs.alert.open(options),
                confirm: (options: ConfirmModalOptions) => this.$refs.confirm.open(options),
            };

            // On the first run, check for an auto-start file. Ask the user if they wish to make one.
            this.$nextTick(() => doFirstRun(this));

            // Load and create the buttons.
            this.$nextTick(async () => { this.buttons = await makeDashboard(); });
        },
        vuetify,
    });
</script>
