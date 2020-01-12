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
        <v-dialog v-model="visible" persistent fullscreen hide-overlay scrollable :transition="transition">
            <validation-observer ref="validator" v-slot="{ handleSubmit }" slim>
                <v-card tile>
                    <div>
                        <v-toolbar>
                            <v-btn icon @click="visible = false"><v-icon>mdi-close</v-icon></v-btn>
                            <v-toolbar-title>{{ title }}</v-toolbar-title>
                            <div class="flex-grow-1"></div>
                            <v-toolbar-items>
                                <v-btn text @click="handleSubmit(onSaveClicked)">Save</v-btn>
                            </v-toolbar-items>
                        </v-toolbar>
                    </div>
                    <v-card-text>
                        <v-row>
                            <v-col>
                                <v-form>
                                    <validation-provider v-slot="{ errors }" name="title" rules="required"
                                                         slim>
                                        <v-text-field v-model="subject.title" label="Name"
                                                      v-bind="validatesWith(errors)" filled/>
                                    </validation-provider>
                                    <validation-provider v-slot="{ errors }" name="image" rules="required|mimes:image/*"
                                                         slim>
                                        <v-file-input v-model="subject.image" label="Image"
                                                      v-bind="validatesWith(errors)" prepend-icon="mdi-camera" filled
                                                      @change="onChangeImage"/>
                                        <v-row>
                                            <v-col cols="2">
                                                <v-card tile>
                                                    <v-img v-show="image" max-width="128px" max-height="128px"
                                                           :class="imageClasses" :src="image"/>
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
    import { ValidationObserver }  from "vee-validate";
    import mixins                  from "vue-typed-mixins";
    import hdmiIcon                from "@mdi/svg/svg/video-input-hdmi.svg";
    import sources                 from "../../../controllers/sources";
    import DoesValidation          from "../../../foundation/concerns/does-valiadtion";
    import withRefs                from "../../../foundation/concerns/with-refs";
    import * as helpers            from "../../../foundation/helpers";
    import Source                  from "../../../models/source";

    type Validator  = InstanceType<typeof ValidationObserver>;
    type References = {
        validator: Validator;
    };

    const EMPTY_SOURCE: Source = {
        _id:   "",
        title: "",
        image: new File([], "none"),
    };

    export default mixins(DoesValidation, withRefs<References>()).extend({
        name:  "SourceEditor",
        props: {
            transition: { type: String,  default: "dialog-transition" },
        },
        data: function () {
            return {
                visible: false,
                subject: _.cloneDeep(EMPTY_SOURCE),
                image:   hdmiIcon,
            };
        },
        computed: {
            title(): string {
                return this.subject._id.length > 0 ? "Edit source" : "Add source";
            },
            imageClasses(): string[] {
                return this.image !== hdmiIcon ? [] : ["faded"];
            },
        },
        methods: {
            newSource(): void {
                this.$nextTick(async () => {
                    await this.readySubject(_.cloneDeep(EMPTY_SOURCE));
                    this.visible = true;
                });
            },
            editSource(subject: Source): void {
                this.$nextTick(async () => {
                    await this.readySubject(_.cloneDeep(subject));
                    this.visible = true;
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

                    this.visible = false;
                    this.subject = _.cloneDeep(EMPTY_SOURCE);
                    this.$nextTick(() => this.$emit("done"));
                });
            },
            onChangeImage(file: File): void {
                this.updateImageUrl(file);
            },
            async updateImageUrl(blob: Blob): Promise<void> {
                this.image = blob.size > 0 ? await helpers.toDataUrl(blob) : hdmiIcon;
            },
            async readySubject(subject: Source): Promise<void> {
                this.subject = subject;
                await this.updateImageUrl(subject.image);
                this.$refs.validator && this.$refs.validator.reset();
            },
        },
    });
</script>

<style lang="scss" scoped>
    .faded {
        opacity: 0.5;
        filter: blur(2px);
    }
</style>
