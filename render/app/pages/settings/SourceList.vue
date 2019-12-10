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
        <slot name="activator" :on="{ click: openList }"/>
        <v-dialog v-model="visible" fullscreen hide-overlay :transition="transition">
            <v-card tile>
                <v-app-bar>
                    <v-btn icon @click="visible = false"><v-icon>mdi-arrow-left</v-icon></v-btn>
                    <v-toolbar-title>Sources</v-toolbar-title>
                </v-app-bar>
                <v-card-text>
                    <source-editor #activators="{ edit, create }" transition="slide-x-transition" @done="refresh">
                        <source-page #activator="{ open }" transition="slide-x-transition" @edit="edit">
                            <v-list>
                                <v-list-item v-for="row of sources" :key="row._id" @click="open(row)">
                                    <v-list-item-avatar>
                                        <v-img :src="images[row._id]"/>
                                    </v-list-item-avatar>
                                    <v-list-item-content v-text="row.title"/>
                                    <v-list-item-action>
                                        <v-btn icon @click.prevent.stop="onDeleteClicked(row)">
                                            <v-icon>mdi-delete</v-icon>
                                        </v-btn>
                                    </v-list-item-action>
                                </v-list-item>
                            </v-list>
                        </source-page>
                        <v-btn color="primary" class="primaryText--text" fab fixed bottom right @click="create">
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>
                    </source-editor>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
    import Vue          from "vue";
    import SourceEditor from "./SourceEditor.vue";
    import SourcePage   from "./SourcePage.vue";
    import sources      from "../../../controller/sources";
    import Source       from "../../../models/source";
    import * as helpers from "../../../support/helpers";

    export default Vue.extend({
        name:       "SourceList",
        components: {
            SourceEditor,
            SourcePage,
        },
        props: {
            transition: { type: String, default: "dialog-transition" },
        },
        data: function () {
            return {
                visible: false,
                sources: [] as Source[],
                images:  {} as { [id: string]: string },
            };
        },
        methods: {
            openList() {
                this.visible = true;
                this.refresh();
            },
            refresh(): void {
                this.$nextTick(async () => {
                    try {
                        this.sources = await sources.all();
                        for (const source of this.sources) {
                            helpers.toDataUrl(source.image).then(url => this.$set(this.images, source._id, url));
                        }
                    } catch (error) {
                        const ex = error as Error;
                        await this.$modals.alert({
                            main:      "Unable to list sources",
                            secondary: ex.message,
                        });

                        this.visible = false;
                    }
                });
            },
            onDeleteClicked(row: Source): void {
                this.$nextTick(async () => {
                    const remove = await this.$modals.confirm({
                        main:        "Do you want to remove this source?",
                        secondary:   `You are about to remove "${row.title}"`,
                        confirmText: "Remove",
                        rejectText:  "Keep",
                    });

                    if (remove) {
                        try {
                            await sources.remove(row._id);
                            this.refresh();
                        } catch (error) {
                            const ex = error as Error;
                            await this.$modals.alert({
                                main:      "Unable to remove source",
                                secondary: ex.message,
                            });
                        }
                    }
                });
            },
        },
    });
</script>
