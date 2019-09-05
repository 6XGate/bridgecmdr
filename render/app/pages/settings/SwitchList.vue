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
    <settings-panel title="Switches">
        <v-row>
            <v-col>
                <v-list>
                    <v-list-item v-for="row of switches" :key="row._id" :to="toExistingSwitch(row)">
                        <v-list-item-content v-text="row.title"/>
                        <v-list-item-action>
                            <v-btn icon @click.prevent="onDeleteClicked(row)">
                                <v-icon color="red">mdi-delete</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </v-list>
            </v-col>
        </v-row>
        <template slot="post-content">
            <v-btn color="cyan" fab fixed bottom right :to="toNewSwitch()">
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </template>
    </settings-panel>
</template>

<script lang="ts">
    import Vue          from "vue";
    import { Location } from "vue-router";
    import switches     from "../../../controller/switches";
    import Switch       from "../../../models/switch";

    export default Vue.extend({
        name: "SwitchList",
        data: function () {
            return {
                switches: [] as Switch[],
                width:    0,
                height:   0,
            };
        },
        methods: {
            onResize() {
                this.width  = window.innerWidth - this.$vuetify.application.left - this.$vuetify.application.right;
                this.height = window.innerHeight - this.$vuetify.application.top - this.$vuetify.application.bottom;
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

                    this.$router.back();
                }
            },
            toNewSwitch(): Location {
                return { name: "switch", params: { subjectId: "new" } };
            },
            toExistingSwitch(row: Switch): Location {
                return { name: "switch", params: { subjectId: row._id } };
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
                        this.refresh();
                    } catch (error) {
                        const ex = error as Error;
                        await this.$modals.alert({
                            main:      "Unable to remove switch",
                            secondary: ex.message,
                        });
                    }
                }
            },
        },
        mounted() {
            this.refresh();
        },
    });
</script>
