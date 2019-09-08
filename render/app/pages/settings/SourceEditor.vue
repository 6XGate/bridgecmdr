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
        <slot name="activators" :edit="editSource" :create="newSource"/>
        <v-dialog v-model="open" fullscreen hide-overlay :transition="transition">
            <validation-observer ref="validator" v-slot="{ valid }" slim>
                <v-card tile>
                    <v-toolbar>
                        <v-btn icon @click="open = false"><v-icon>mdi-close</v-icon></v-btn>
                        <v-toolbar-title>{{ title }}</v-toolbar-title>
                        <div class="flex-grow-1"></div>
                        <v-toolbar-items>
                            <v-btn text :disabled="!valid" @click="onSaveClicked">Save</v-btn>
                        </v-toolbar-items>
                    </v-toolbar>
                    <v-card-text>
                        <v-row>
                            <v-col>
                                <v-form>
                                    <validation-provider v-slot="{ errors, invalid }" name="title"
                                                         :rules="{ required: true }" slim>
                                        <v-text-field v-model="subject.title" label="Name" :error="invalid"
                                                      filled :error-count="invalid ? errors.length : 0"
                                                      :error-messages="invalid ? errors[0] : undefined"/>
                                    </validation-provider>
                                    <validation-provider v-slot="{ errors, invalid }" name="image"
                                                         :rules="{ required: true }" slim>
                                        <v-file-input v-model="subject.image" label="Image" :error="invalid"
                                                      filled :error-count="invalid ? errors.length : 0"
                                                      :error-messages="invalid ? errors[0] : undefined"
                                                      prepend-icon="mdi-camera" @change="onChangeImage"/>
                                        <v-row>
                                            <v-col cols="2">
                                                <v-card tile>
                                                    <v-img v-show="image" lazy-src="~@mdi/svg/svg/video-input-hdmi.svg"
                                                           :src="image" max-width="128px" max-height="128px"/>
                                                </v-card>
                                            </v-col>
                                        </v-row>
                                    </validation-provider>
                                </v-form>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </validation-observer>
        </v-dialog>
    </div>
</template>

<script lang="ts">
    import _                       from "lodash";
    import Vue, { VueConstructor } from "vue";
    import { ValidationObserver }  from "vee-validate";
    import sources                 from "../../../controller/sources";
    import Source                  from "../../../models/source";
    import * as helpers            from "../../../support/helpers";

    const EMPTY_SOURCE: Source = {
        _id:   "",
        title: "",
        image: new File([], "none"),
    };

    type Validator = InstanceType<typeof ValidationObserver>;

    interface References {
        $refs: {
            validator: Validator;
        };
    }

    const vue = Vue as VueConstructor<Vue & References>;
    export default vue.extend({
        name:  "SourceEditor",
        props: {
            transition: { type: String,  default: "dialog-transition" },
        },
        data: function () {
            return {
                open:    false,
                subject: _.clone(EMPTY_SOURCE),
                image:   "no/such/image",
            };
        },
        computed: {
            title(): string {
                return this.subject._id.length > 0 ? "Edit source" : "Add source";
            },
        },
        methods: {
            newSource(): void {
                this.$nextTick(async () => {
                    await this.readySubject(_.clone(EMPTY_SOURCE));
                    this.open = true;
                    requestAnimationFrame(() => this.$refs.validator.reset());
                });
            },
            editSource(subject: Source): void {
                this.$nextTick(async () => {
                    await this.readySubject(subject);
                    this.open = true;
                    requestAnimationFrame(() => this.$refs.validator.validate());
                });
            },
            onSaveClicked(): void {
                this.$nextTick(async () => {
                    try {
                        if (this.subject._id === "") {
                            await sources.add(this.subject);
                        } else {
                            await sources.update(this.subject);
                        }
                    } catch (error) {
                        const ex = error as Error;
                        await this.$modals.alert({
                            main:      "Unable to edit switch",
                            secondary: ex.message,
                        });
                    }

                    this.open    = false;
                    this.subject = _.clone(EMPTY_SOURCE);
                    this.$nextTick(() => this.$emit("done"));
                });
            },
            onChangeImage(file: File): void {
                this.updateAttachment(file);
            },
            async updateAttachment(blob: Blob): Promise<void> {
                this.image = await helpers.toDataUrl(blob);
            },
            async readySubject(subject: Source): Promise<void> {
                this.subject = subject;
                await this.updateAttachment(subject.image);
            },
        },
    });
</script>
