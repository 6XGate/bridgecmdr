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
                        <b-input name="title" type="text" v-model="subject.title"/>
                    </b-field>
                </validation-provider>
                <validation-provider name="driver" :rules="{ required: true }" v-slot="{ errors, invalid  }" slim>
                    <b-field label="Driver" horizontal
                             :type="invalid ? 'is-danger' : undefined"
                             :message="invalid ? errors[0] : undefined">
                        <b-select v-model="subject.driverId">
                            <option v-for="driver of drivers" :key="driver.guid" :value="driver.guid">
                                {{ driver.title }}
                            </option>
                        </b-select>
                    </b-field>
                </validation-provider>
                <!-- TODO Driver specific configuration components will go here -->
            </form>
        </settings-panel>
    </validation-observer>
</template>

<script lang="ts">
    import _                       from "lodash";
    import Vue, { VueConstructor } from "vue";
    import switches                from "../../../controller/switches";
    import modals                  from "../../../components/modals";
    import Switch                  from "../../../models/switch";
    import Driver                  from "../../../support/system/driver";
    import { ValidationObserver }  from "vee-validate";

    const NEW_SWITCH: Switch = {
        _id:         "",
        driverId: "",
        title:       "",
        config:      {},
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
                subject: <Switch|null>null,
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
            onSaveClicked() {
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
                        await modals.alert(this, {
                            type:   "is-danger",
                            icon:   "alert-circle",
                            title:  "Unable to edit switch",
                            message: error,
                        });
                    }
                });
            },
        },
        mounted() {
            this.$nextTick(async () => {
                try {
                    this.subject = this.subjectId !== "new" ? await switches.get(this.subjectId) : _.clone(NEW_SWITCH);
                    if (this.subjectId !== "new") {
                        this.$nextTick(() =>  this.$refs.validator.validate());
                    }
                } catch (error) {
                    const message = error.name === "not_found" ?
                        `Switch "${this.subjectId}" not found` :
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
