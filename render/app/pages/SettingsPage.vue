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
    <div>
        <slot name="activator" :open="() => visible = true"/>
        <v-dialog v-model="visible" persistent fullscreen hide-overlay scrollable :transition="transition">
            <v-card tile>
                <div>
                    <v-toolbar>
                        <v-btn icon @click="done"><v-icon>mdi-arrow-left</v-icon></v-btn>
                        <v-toolbar-title>Settings</v-toolbar-title>
                    </v-toolbar>
                </div>
                <v-card-text>
                    <v-list>
                        <source-list #activator="{ open }" transition="slide-x-transition">
                            <v-list-item @click="open">
                                <v-list-item-avatar color="blue">
                                    <v-icon class="white--text">mdi-gamepad-variant</v-icon>
                                </v-list-item-avatar>
                                <v-list-item-content>
                                    Sources
                                </v-list-item-content>
                            </v-list-item>
                        </source-list>
                        <switch-list #activator="{ open }" transition="slide-x-transition">
                            <v-list-item @click="open">
                                <v-list-item-avatar color="red darken-2">
                                    <v-icon class="white--text">mdi-video-switch</v-icon>
                                </v-list-item-avatar>
                                <v-list-item-content>
                                    Switches
                                </v-list-item-content>
                            </v-list-item>
                        </switch-list>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
    import Vue        from "vue";
    import SourceList from "./settings/SourceList.vue";
    import SwitchList from "./settings/SwitchList.vue";

    export default Vue.extend({
        name:       "SettingsPage",
        components: {
            SourceList,
            SwitchList,
        },
        props: {
            transition: { type: String,  default: "dialog-transition" },
        },
        data: function () {
            return {
                visible: false,
            };
        },
        methods: {
            done() {
                this.visible = false;
                this.$emit("done");
            },
        },
    });
</script>
