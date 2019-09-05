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
    <settings-panel title="General">
        <v-row align="center" justify="center">
            <v-col>
                <v-list>
                    <v-list-item :to="{ name: 'sources' }">
                        <v-list-item-icon>
                            <v-icon>mdi-gamepad-variant</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            Sources
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item :to="{ name: 'switches' }">
                        <v-list-item-icon>
                            <v-icon>mdi-video-switch</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            Switches
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-col>
        </v-row>
    </settings-panel>
</template>

<script lang="ts">
    import Vue from "vue";

    export default Vue.extend({
        name: "SettingsPage",
        data: function () {
            return {
                width:  0,
                height: 0,
            };
        },
        methods: {
            onResize() {
                const dimensions = {
                    width:  window.document.documentElement.clientWidth,
                    height: window.document.documentElement.clientHeight,
                };

                console.log(dimensions);

                this.width  = dimensions.width - this.$vuetify.application.left - this.$vuetify.application.right;
                this.height = dimensions.height - this.$vuetify.application.top - this.$vuetify.application.bottom;
            },
        },
    });
</script>
