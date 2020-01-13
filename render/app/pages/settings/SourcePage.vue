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
        <slot name="activator" :open="openSource"/>
        <v-dialog v-model="visible" persistent fullscreen hide-overlay scrollable :transition="transition">
            <v-card tile>
                <div>
                    <v-toolbar>
                        <v-btn icon @click="visible = false"><v-icon>mdi-arrow-left</v-icon></v-btn>
                        <v-toolbar-title>{{ subject.title }}</v-toolbar-title>
                        <div class="flex-grow-1"></div>
                        <v-toolbar-items>
                            <v-btn text @click="onEditClicked">Edit</v-btn>
                        </v-toolbar-items>
                    </v-toolbar>
                </div>
                <v-card-text>
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
                            <v-list-item v-for="row of ties" :key="row._id" two-line @click="edit(row)">
                                <v-list-item-content>
                                    <v-list-item-title>{{ getSwitchTitleForTie(row) }}</v-list-item-title>
                                    <v-list-item-subtitle>
                                        <span v-if="getTieInputChannel(row)">
                                            <span class="mdi mdi-import"/>
                                            <span>{{ getTieInputChannel(row) }}</span>
                                        </span>
                                        <span v-if="getTieOutputVideoChannel(row)">
                                            <span class="mdi mdi-export"/>
                                            <span v-if="getTieOutputVideoChannel(row)">{{ getTieOutputVideoChannel(row) }}</span>
                                        </span>
                                        <span v-if="getTieOutputAudioChannel(row)">
                                            <span class="mdi mdi-volume-medium"/>
                                            <span v-if="getTieOutputAudioChannel(row)">{{ getTieOutputAudioChannel(row) }}</span>
                                        </span>
                                        <span v-if="getDriverTitleForTie(row)">
                                            <span class="mdi mdi-settings"/>
                                            <span>{{ getDriverTitleForTie(row) }}</span>
                                        </span>
                                    </v-list-item-subtitle>
                                </v-list-item-content>
                                <v-list-item-action>
                                    <v-btn icon @click.prevent.stop="onDeleteClicked(row)">
                                        <v-icon>mdi-delete</v-icon>
                                    </v-btn>
                                </v-list-item-action>
                            </v-list-item>
                        </v-list>
                        <v-btn color="primary" fab fixed bottom right @click="() => create(subject)">
                            <v-icon class="primaryText--text">mdi-plus</v-icon>
                        </v-btn>
                    </tie-editor>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
    import _            from "lodash";
    import Vue          from "vue";
    import TieEditor    from "./TieEditor.vue";
    import switches     from "../../../controllers/switches";
    import ties         from "../../../controllers/ties";
    import * as helpers from "../../../foundation/helpers";
    import Driver       from "../../../foundation/system/driver";
    import Source       from "../../../models/source";
    import Switch       from "../../../models/switch";
    import Tie          from "../../../models/tie";

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
                drivers:  Driver.all(),
                switches: {} as { [id: string]: Switch },
                ties:     [] as Tie[],
            };
        },
        methods: {
            getSwitchTitleForTie(row: Tie) {
                return row && this.switches[row.switchId] && this.switches[row.switchId].title;
            },
            getTieInputChannel(row: Tie) {
                return row && row.inputChannel;
            },
            getTieOutputVideoChannel(row: Tie) {
                return row && row.outputChannels && row.outputChannels.video;
            },
            getTieOutputAudioChannel(row: Tie) {
                return row && row.outputChannels && row.outputChannels.audio;
            },
            getDriverTitleForTie(row: Tie) {
                const switcher = this.switches[row.switchId];
                const driver   = switcher && _.find(this.drivers, _driver => _driver.guid === switcher.driverId);

                return driver && driver.title;
            },
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
            onDeleteClicked(row: Tie): void {
                this.$nextTick(async () => {
                    const remove = await this.$modals.confirm({
                        main:        "Do you want to remove this tie?",
                        secondary:   `You are about to remove the tie for "${this.getSwitchTitleForTie(row)}"`,
                        confirmText: "Remove",
                        rejectText:  "Keep",
                    });

                    if (remove) {
                        try {
                            await ties.remove(row._id);
                        } catch (error) {
                            const ex = error as Error;
                            await this.$modals.alert({
                                main:      "Unable to remove tie",
                                secondary: ex.message,
                            });
                        }

                        await this.refresh();
                    }
                });
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
