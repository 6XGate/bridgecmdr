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
        <slot name="activator" :open="openSource"/>
        <v-dialog v-model="visible" fullscreen hide-overlay :transition="transition">
            <v-card tile>
                <v-app-bar>
                    <v-btn icon @click="visible = false"><v-icon>mdi-arrow-left</v-icon></v-btn>
                    <v-toolbar-title>{{ subject.title }}</v-toolbar-title>
                    <div class="flex-grow-1"></div>
                    <v-toolbar-items>
                        <v-btn text @click="onEditClicked">Edit</v-btn>
                    </v-toolbar-items>
                </v-app-bar>
                <tie-editor #activators="{ edit, create }" @done="refresh">
                    <v-list>
                        <v-list-item two-line>
                            <v-list-item-content>
                                <v-list-item-title class="headline">{{ subject.title }}</v-list-item-title>
                                <v-list-item-subtitle>Source</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-avatar size="64" tile><v-img :src="image"/></v-list-item-avatar>
                        </v-list-item>
                        <!-- The ties -->
                        <v-list-item v-for="row of ties" :key="row._id" two-line>
                            <v-list-item-content>
                                <v-list-item-title>switches[row.switchId].title</v-list-item-title>
                                <v-list-item-subtitle>Inputs and/or driver name</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                    <v-btn color="primary" fab fixed bottom right @click="() => create(subject)">
                        <v-icon class="primaryText--text">mdi-plus</v-icon>
                    </v-btn>
                </tie-editor>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
    import _            from "lodash";
    import Vue          from "vue";
    import TieEditor    from "./TieEditor.vue";
    import switches     from "../../../controller/switches";
    import ties         from "../../../controller/ties";
    import Source       from "../../../models/source";
    import Switch       from "../../../models/switch";
    import Tie          from "../../../models/tie";
    import * as helpers from "../../../support/helpers";

    const EMPTY_SOURCE: Source = {
        _id:   "",
        title: "",
        image: new File([], "none"),
    };

    export default Vue.extend({
        name:       "SourcePage",
        components: {
            TieEditor,
        },
        props: {
            transition: { type: String,  default: "dialog-transition" },
        },
        data: function () {
            return {
                visible:  false,
                subject:  _.clone(EMPTY_SOURCE),
                image:    "no/such/image",
                switches: {} as { [id: string]: Switch },
                ties:     [] as Tie[],
            };
        },
        methods: {
            async refresh(): Promise<void> {
                try {
                    this.ties     = await ties.forSource(this.subject._id);
                    this.switches = _(await switches.all()).map(row => [ row._id, row ]).fromPairs().value();
                } catch (error) {
                    const ex = error as Error;
                    await this.$modals.alert({
                        main:      "Unable to list switches",
                        secondary: ex.message,
                    });

                    this.visible = false;
                }
            },
            openSource(subject: Source): void {
                this.$nextTick(async () => {
                    await this.readySubject(subject);
                    this.visible = true;
                });
            },
            onEditClicked(): void {
                this.$emit("edit", this.subject);
                this.visible = false;
            },
            async updateImageUrl(blob: Blob): Promise<void> {
                this.image = await helpers.toDataUrl(blob);
            },
            async readySubject(subject: Source): Promise<void> {
                this.subject = subject;
                await this.updateImageUrl(subject.image);
                this.refresh();
            },
        },
    });
</script>
