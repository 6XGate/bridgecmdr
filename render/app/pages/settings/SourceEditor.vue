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
        <settings-panel :title="title">
            <template slot="end">
                <b-navbar-item v-if="valid" tag="a" @click.native.stop="onSaveClicked">
                    Save
                </b-navbar-item>
            </template>

            <form action="" class="section">
                <validation-provider name="title" :rules="{ required: true }" v-slot="{ errors, invalid }" slim>
                    <b-field label="Name" horizontal
                             :type="invalid ? 'is-danger' : undefined"
                             :message="invalid ? errors[0] : undefined">
                        <b-input type="text" v-model="subject.title"/>
                    </b-field>
                </validation-provider>
                <validation-provider name="image" :rules="{ required: true }" v-slot="{ errors, invalid }" slim>
                    <b-field label="Image" horizontal
                             :type="invalid ? 'is-danger' : undefined"
                             :message="invalid ? errors[0] : undefined">
                        <b-upload type="file" v-model="attachment" @input="onChangeImage" drag-drop>
                            <section class="section">
                                <div class="content has-text-centered">
                                    <p><b-icon icon="upload" size="is-large"/></p>
                                    <p>Drop your image here or click to upload</p>
                                </div>
                            </section>
                        </b-upload>
                        <b-field>
                            <img :src="image" alt="icon" :class="{ 'is-invisible': image === null }"/>
                        </b-field>
                    </b-field>
                </validation-provider>
            </form>
        </settings-panel>
    </validation-observer>
</template>

<script lang="ts">
    import _                       from "lodash";
    import Vue, { VueConstructor } from "vue";
    import { ValidationObserver }  from "vee-validate";
    import modals                  from "../../../components/modals";
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
        }
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
                image:      null as string|null,
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
            onSaveClicked() {
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
                        await modals.alert(this, {
                            type:   "is-danger",
                            icon:   "alert-circle",
                            title:  "Unable to edit switch",
                            message: error,
                        });
                    }
                });
            },
            onChangeImage(file: File) {
                const reader = new FileReader();
                reader.onload = () => {
                    if (this.subject !== null) {
                        this.subject.image = file.name;
                        this.image = reader.result as string;
                    }
                };

                reader.readAsDataURL(file)
            },
        },
        mounted() {
            this.$nextTick(async () => {
                try {
                    const subject: Document<Source>|Source = this.subjectId !== "new" ?
                        await sources.get(this.subjectId) :
                        _.clone(NEW_SOURCE);
                    const attachments = (<Document<Source>>subject)._attachments;
                    if (attachments) {
                        const attachment = attachments[subject.image] as PouchDB.Core.FullAttachment;
                        if (attachment) {
                            this.attachment = new File([attachment.data as Blob], subject.image, {
                                type: attachment.content_type,
                            });

                            this.onChangeImage(this.attachment);
                        }
                    }

                    this.subject = subject;
                    if (this.subjectId !== "new") {
                        this.$nextTick(() => this.$refs.validator.validate());
                    }
                } catch (error) {
                    const message = error.name === "not_found" ?
                        `Source "${this.subjectId}" not found` :
                        error.message;
                    await modals.alert(this, {
                        type:  "is-danger",
                        icon:  "alert-circle",
                        title: "Unable to edit switch",
                        message,
                    });

                    this.$router.back();
                }
            });
        },
    });
</script>
