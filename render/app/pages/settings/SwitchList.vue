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
        <template slot="end">
            <b-navbar-item tag="router-link" :to="toNewSwitch()">
                <b-icon icon="plus"/>
            </b-navbar-item>
        </template>
        <section class="section">
            <div class="panel">
                <router-link v-for="row of switches" :key="row._id" class="panel-block panel-level"
                             :to="toExistingSwitch(row)">
                    <div class="level">
                        <div class="level-left">
                            <div class="level-item">{{ row.title }}</div>
                        </div>
                        <div class="level-right">
                            <div class="level-item">
                                <b-button icon-left="delete" type="is-danger"
                                          @click.prevent.stop="onDeleteClicked(row)"/>
                            </div>
                        </div>
                    </div>
                </router-link>
            </div>
        </section>
    </settings-panel>
</template>

<script lang="ts">
    import Vue          from "vue";
    import { Location } from "vue-router";
    import modals       from "../../../components/modals";
    import switches     from "../../../controller/switches";
    import Switch       from "../../../models/switch";

    export default Vue.extend({
        name: "SwitchList",
        data: function () {
            return {
                switches: <Switch[]>[],
            };
        },
        methods: {
            async refresh(): Promise<void> {
                try {
                    this.switches = await switches.all();
                } catch (error) {
                    await modals.alert(this, {
                        type:   "is-danger",
                        icon:   "alert-circle",
                        title:  "Unable to list switches",
                        message: error,
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
                const remove = await modals.confirm(this, {
                    type:        "is-danger",
                    icon:        "close-octagon",
                    title:       "Do you want to remove this switch?",
                    message:     `You are about to remove "${row.title}"`,
                    confirmText: "Remove",
                    cancelText:  "Keep",
                    focusOn:     "cancel",
                });

                if (remove) {
                    try {
                        await switches.remove(row._id);
                        this.refresh();
                    } catch (error) {
                        await modals.alert(this, {
                            type:   "is-danger",
                            icon:   "alert-circle",
                            title:  "Unable to remove switch",
                            message: error,
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
