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
    <settings-panel title="Sources">
        <template slot="end">
            <b-navbar-item tag="router-link" :to="toNewSource()">
                <b-icon icon="plus"/>
            </b-navbar-item>
        </template>
        <section class="section">
            <div class="panel">
                <router-link v-for="row of sources" :key="row._id" class="panel-block panel-level"
                             :to="toExistingSource(row)">
                    <div class="level">
                        <div class="level-left">
                            <div class="level-item">{{ row.title }}</div>
                        </div>
                        <div class="level-right">
                            <div class="level-item">
                                <b-button label="Edit Ties" type="is-primary"/>
                            </div>
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
    import sources      from "../../../controller/sources";
    import Source       from "../../../models/source";

    export default Vue.extend({
        name: "SourceList",
        data: function () {
            return {
                sources: <Source[]>[],
            };
        },
        methods: {
            async refresh(): Promise<void> {
                this.sources = await sources.all();
            },
            async onDeleteClicked(row: Source): Promise<void> {
                const remove = await modals.confirm(this, {
                    type:        "is-danger",
                    icon:        "close-octagon",
                    title:       "Do you want to remove this source?",
                    message:     `You are about to remove "${row.title}"`,
                    confirmText: "Remove",
                    cancelText:  "Keep",
                    focusOn:     "cancel",
                });

                if (remove) {
                    await sources.remove(row._id);
                    this.refresh();
                }
            },
            toNewSource(): Location {
                return { name: "source", params: { subjectId: "new" } };
            },
            toExistingSource(row: Source): Location {
                return { name: "source", params: { subjectId: row._id } };
            }
        },
        mounted() {
            this.refresh();
        },
    });
</script>
