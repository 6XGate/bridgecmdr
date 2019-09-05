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
    <validation-observer ref="validator" v-slot="{ valid }" slim>
        <settings-panel :title="title" back-icon="mdi-close">
            <template slot="app-bar">
                <v-toolbar-items>
                    <v-btn text :disabled="!valid" @click="onSaveClicked">Save</v-btn>
                </v-toolbar-items>
            </template>
            <v-row>
                <v-col>
                    <form action="" class="section">
                        <validation-provider v-slot="{ errors, invalid }" name="title"
                                             :rules="{ required: true }" slim>
                            <v-text-field v-model="subject.title" label="Name" :error="invalid" filled
                                          :error-count="invalid ? errors.length : 0"
                                          :error-messages="invalid ? errors[0] : undefined"/>
                        </validation-provider>
                        <validation-provider v-slot="{ errors, invalid }" name="image"
                                             :rules="{ required: true }" slim>
                            <v-file-input v-model="attachment" label="Image" :error="invalid" filled
                                          :error-count="invalid ? errors.length : 0"
                                          :error-messages="invalid ? errors[0] : undefined"
                                          prepend-icon="mdi-camera" @change="onChangeImage"/>
                            <v-col>
                                <v-row>
                                    <v-card tile>
                                        <v-img v-show="image" lazy-src="~@mdi/svg/svg/video-input-hdmi.svg"
                                               :src="image" max-width="128px" max-height="128px"/>
                                    </v-card>
                                </v-row>
                            </v-col>
                        </validation-provider>
                    </form>
                </v-col>
            </v-row>
        </settings-panel>
    </validation-observer>
</template>

<script lang="ts">
    import _                       from "lodash";
    import Vue, { VueConstructor } from "vue";
    import { ValidationObserver }  from "vee-validate";
    import sources                 from "../../../controller/sources";
    import Source                  from "../../../models/source";
    import { Document }            from "../../../support/controller";

    const NEW_SOURCE: Source = {
        _id:   "",
        title: "",
        image: "",
    };

    const LOADING_SOURCE: Source = {
        _id:   "loading",
        title: "Loading...",
        image: "",
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
            subjectId: { required: true, type: String },
        },
        data: function () {
            return {
                subject:    _.clone(LOADING_SOURCE),
                attachment: null as File|null,
                image:      "no/such/image",
            };
        },
        computed: {
            title(): string {
                if (this.subject !== null) {
                    return this.subject._id.length > 0 ? "Edit source" : "Add source";
                }

                return "Loading...";
            },
        },
        methods: {
            onSaveClicked(): void {
                this.$nextTick(async () => {
                    try {
                        if (this.subject !== null && this.attachment !== null) {
                            if (this.subject._id === "") {
                                await sources.add(this.subject, this.attachment);
                                this.$router.back();
                            } else {
                                await sources.update(this.subject, this.attachment);
                                this.$router.back();
                            }
                        }
                    } catch (error) {
                        const ex = error as Error;
                        await this.$modals.alert({
                            main:      "Unable to edit switch",
                            secondary: ex.message,
                        });
                    }
                });
            },
            onChangeImage(file: File): void {
                const reader = new FileReader();
                reader.onload = () => {
                    if (this.subject !== null) {
                        this.subject.image = file.name;
                        this.image = reader.result as string;
                    }
                };

                reader.readAsDataURL(file);
            },
        },
        mounted(): void {
            this.$nextTick(async () => {
                try {
                    const subject: Document<Source>|Source = this.subjectId !== "new" ?
                        await sources.get(this.subjectId) :
                        _.clone(NEW_SOURCE);
                    const attachments = (subject as Document<Source>)._attachments;
                    if (!_.isNil(attachments)) {
                        const attachment = attachments[subject.image] as PouchDB.Core.FullAttachment;
                        if (attachment) {
                            this.attachment = new File([attachment.data as Blob], subject.image,
                                                       { type: attachment.content_type });

                            this.onChangeImage(this.attachment);
                        }
                    }

                    this.subject = subject;
                    if (this.subjectId !== "new") {
                        this.$nextTick(() => this.$refs.validator.validate());
                    }
                } catch (error) {
                    const ex = error as Error;
                    const message = ex.name === "not_found" ?
                        `Source "${this.subjectId}" not found` :
                        ex.message;
                    await this.$modals.alert({
                        main:      "Unable to edit switch",
                        secondary: message,
                    });

                    this.$router.back();
                }
            });
        },
    });
</script>
