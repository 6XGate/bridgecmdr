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
    <div>
        <slot name="activator" :open="openList"/>
        <v-dialog v-model="visible" persistent fullscreen hide-overlay :transition="transition">
            <v-card tile>
                <v-app-bar>
                    <v-btn icon @click="visible = false"><v-icon>mdi-arrow-left</v-icon></v-btn>
                    <v-toolbar-title>Switches</v-toolbar-title>
                </v-app-bar>
                <v-card-text>
                    <switch-editor #activators="{ edit, create }" transition="slide-x-transition" @done="refresh">
                        <v-list>
                            <v-list-item v-for="row of switches" :key="row._id" @click="edit(row)">
                                <v-list-item-content v-text="row.title"/>
                                <v-list-item-action>
                                    <v-btn icon @click.prevent.stop="onDeleteClicked(row)">
                                        <v-icon>mdi-delete</v-icon>
                                    </v-btn>
                                </v-list-item-action>
                            </v-list-item>
                        </v-list>
                        <v-btn color="primary" class="primaryText--text" fab fixed bottom right @click="create">
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>
                    </switch-editor>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
    import Vue          from "vue";
    import SwitchEditor from "./SwitchEditor.vue";
    import switches     from "../../../controller/switches";
    import Switch       from "../../../models/switch";

    export default Vue.extend({
        name:       "SwitchList",
        components: {
            SwitchEditor,
        },
        props: {
            transition: { type: String,  default: "dialog-transition" },
        },
        data: function () {
            return {
                visible:  false,
                switches: [] as Switch[],
            };
        },
        methods: {
            openList(): void {
                this.visible = true;
                this.refresh();
            },
            async refresh(): Promise<void> {
                try {
                    this.switches = await switches.all();
                } catch (error) {
                    const ex = error as Error;
                    await this.$modals.alert({
                        main:      "Unable to list switches",
                        secondary: ex.message,
                    });

                    this.visible = false;
                }
            },
            async onDeleteClicked(row: Switch): Promise<void> {
                const remove = await this.$modals.confirm({
                    main:        "Do you want to remove this switch?",
                    secondary:   `You are about to remove "${row.title}"`,
                    confirmText: "Remove",
                    rejectText:  "Keep",
                });

                if (remove) {
                    try {
                        await switches.remove(row._id);
                    } catch (error) {
                        const ex = error as Error;
                        await this.$modals.alert({
                            main:      "Unable to remove switch",
                            secondary: ex.message,
                        });
                    }

                    await this.refresh();
                }
            },
        },
    });
</script>
