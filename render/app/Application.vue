<!--
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
-->

<template>
    <v-app id="bridgecmdr">
        <v-content>
            <v-container>
                &nbsp;
            </v-container>
        </v-content>
        <settings-page transition="dialog-bottom-transition" #activator="{ on }">
            <v-btn color="secondary" class="secondaryText--text" fab fixed bottom right v-on="on">
                <v-icon>mdi-wrench</v-icon>
            </v-btn>
        </settings-page>
        <alert-modal ref="alert"/>
        <confirm-modal ref="confirm"/>
    </v-app>
</template>

<script lang="ts">
    import Vue, { VueConstructor } from "vue";
    import Vuetify                 from "vuetify";
    import colors                  from "vuetify/lib/util/colors";
    import SettingsPage            from "./pages/SettingsPage.vue";

    import {
        AlertModal,
        AlertModalOptions,
        ConfirmModal,
        ConfirmModalOptions,
    } from "../components/modals";

    const vuetify = new Vuetify({
        icons: {
            iconfont: "mdi",
        },
        theme: {
            themes: {
                light: {
                    primary:       colors.indigo.base,
                    secondary:     colors.indigo.lighten3,
                    accent:        colors.teal.lighten5,
                    primaryText:   "#FFFFFF",
                    secondaryText: "#000000",
                },
                dark: {
                    primary:       colors.indigo.base,
                    secondary:     colors.indigo.lighten3,
                    accent:        colors.teal.darken4,
                    primaryText:   "#FFFFFF",
                    secondaryText: "#000000",
                },
            },
        },
    });

    interface References {
        $refs: {
            alert:   AlertModal;
            confirm: ConfirmModal;
        };
    }

    const vue = Vue as VueConstructor<Vue & References>;
    export default vue.extend({
        name:       "Application",
        components: {
            SettingsPage,
        },
        mounted() {
            Vue.prototype.$modals = {
                alert:   (options: AlertModalOptions) => this.$refs.alert.open(options),
                confirm: (options: ConfirmModalOptions) => this.$refs.confirm.open(options),
            };
        },
        vuetify,
    });
</script>

<style lang="scss">
    @import "~@mdi/font";
    @import '~vuetify/src/styles/styles';
</style>
