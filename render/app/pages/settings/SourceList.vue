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
        <v-row>
            <v-col>
                <v-list>
                    <v-list-item v-for="row of sources" :key="row._id" :to="toExistingSource(row)">
                        <v-list-item-avatar>
                            <v-img :src="images[row.image]"/>
                        </v-list-item-avatar>
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
            <v-btn color="cyan" fab fixed bottom right :to="toNewSource()">
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </template>
    </settings-panel>
</template>


<script lang="ts">
    import _            from "lodash";
    import Vue          from "vue";
    import { Location } from "vue-router";
    import sources      from "../../../controller/sources";
    import Source       from "../../../models/source";
    import { Document } from "../../../support/controller";

    export default Vue.extend({
        name: "SourceList",
        data: function () {
            return {
                sources: [] as Document<Source>[],
                images:  {} as { [id: string]: string },
            };
        },
        methods: {
            refresh(): void {
                this.$nextTick(async () => {
                    this.sources = await sources.all();
                    try {
                        await Promise.all(_(this.sources).map(source => {
                            if (source._attachments) {
                                const name = source.image;
                                if (source._attachments[name]) {
                                    const attachment = source._attachments[name] as PouchDB.Core.FullAttachment;

                                    return new Promise(resolve => {
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            this.$set(this.images, source.image, reader.result as string);
                                            resolve();
                                        };

                                        reader.readAsDataURL(attachment.data as Blob);
                                    });
                                }
                            }

                            return Promise.resolve();
                        }).value());
                    } catch (error) {
                        const ex = error as Error;
                        await this.$modals.alert({
                            main:      "Unable to list sources",
                            secondary: ex.message,
                        });

                        this.$router.back();
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
            toNewSource(): Location {
                return { name: "source", params: { subjectId: "new" } };
            },
            toExistingSource(row: Source): Location {
                return { name: "source", params: { subjectId: row._id } };
            },
        },
        mounted() {
            this.refresh();
        },
    });
</script>
