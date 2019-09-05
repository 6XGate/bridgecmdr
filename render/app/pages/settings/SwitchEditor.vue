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
                    <v-form>
                        <validation-provider v-slot="{ errors, invalid }" name="title"
                                             :rules="{ required: true }" slim>
                            <v-text-field v-model="subject.title" label="Name" :error="invalid" filled
                                          :error-count="invalid ? errors.length : 0"
                                          :error-messages="invalid ? errors[0] : undefined"/>
                        </validation-provider>
                        <validation-provider v-slot="{ errors, invalid }" name="driver"
                                             :rules="{ required: true }" slim>
                            <v-select v-model="subject.driverId" label="Driver" :error="invalid" filled
                                      :items="drivers" item-value="guid" item-text="title"
                                      :error-count="invalid ? errors.length : 0"
                                      :error-messages="invalid ? errors[0] : undefined"/>
                        </validation-provider>
                    </v-form>
                </v-col>
            </v-row>
            <!-- TODO Driver specific configuration components will go here -->
        </settings-panel>
    </validation-observer>
</template>

<script lang="ts">
    import _                       from "lodash";
    import Vue, { VueConstructor } from "vue";
    import switches                from "../../../controller/switches";
    import Switch                  from "../../../models/switch";
    import Driver                  from "../../../support/system/driver";
    import { ValidationObserver }  from "vee-validate";

    const NEW_SWITCH: Switch = {
        _id:      "",
        driverId: "",
        title:    "",
        config:   {},
    };

    const LOADING_SWITCH: Switch = {
        _id:      "loading",
        driverId: "",
        title:    "Loading...",
        config:   {},
    };

    type Validator = InstanceType<typeof ValidationObserver>;

    interface References {
        $refs: {
            validator: Validator;
        };
    }

    const vue = Vue as VueConstructor<Vue & References>;
    export default vue.extend({
        name:  "SwitchEditor",
        props: {
            subjectId: { required: true, type: String },
        },
        data() {
            return {
                drivers: Driver.all(),
                subject: _.clone(LOADING_SWITCH),
            };
        },
        computed: {
            title(): string {
                if (this.subject !== null) {
                    return this.subject._id.length > 0 ? "Edit switch" : "New switch";
                }

                return "Loading...";
            },
        },
        methods: {
            onSaveClicked(): void {
                this.$nextTick(async () => {
                    try {
                        if (this.subject) {
                            if (this.subject._id === "") {
                                await switches.add(this.subject);
                                this.$router.back();
                            } else {
                                await switches.update(this.subject);
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
        },
        mounted(): void {
            this.$nextTick(async () => {
                try {
                    this.subject = this.subjectId !== "new" ? await switches.get(this.subjectId) : _.clone(NEW_SWITCH);
                    if (this.subjectId !== "new") {
                        this.$nextTick(() =>  this.$refs.validator.validate());
                    }
                } catch (error) {
                    const ex = error as Error;
                    const message = ex.name === "not_found" ?
                        `Switch "${this.subjectId}" not found` :
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
