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
        <slot name="activators" :edit="editSwitch" :create="newSwitch"/>
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
                                        <v-text-field v-model="subject.title" v-bind="validatesWith(errors)"
                                                      label="Name" filled/>
                                    </validation-provider>
                                    <validation-provider v-slot="{ errors }" name="driver" rules="required" slim>
                                        <v-select v-model="subject.driverId" v-bind="validatesWith(errors)"
                                                  label="Driver" :items="drivers" item-value="guid" item-text="title"
                                                  filled/>
                                    </validation-provider>
                                    <v-row>
                                        <v-col cols="3">
                                            <v-select v-model="location" label="Type" :items="locations"
                                                      item-value="value" item-text="label" filled/>
                                        </v-col>
                                        <v-col cols="9">
                                            <validation-provider #default="{ errors }" :name="pathName"
                                                                 :rules="pathRules" slim>
                                                <v-text-field v-show="location !== DeviceLocation.PORT" v-model="path"
                                                              v-bind="validatesWith(errors)" :label="pathLabel" filled/>
                                                <v-select v-show="location === DeviceLocation.PORT" v-model="path"
                                                          v-bind="validatesWith(errors)" :label="pathLabel"
                                                          :items="ports" item-value="path" item-text="label" filled/>
                                            </validation-provider>
                                        </v-col>
                                    </v-row>
                                </v-form>
                            </v-col>
                        </v-row>
                        <v-row>
                            <!-- TODO Driver specific configuration components will go here -->
                        </v-row>
                    </v-card-text>
                </v-card>
            </validation-observer>
        </v-dialog>
    </div>
</template>

<script lang="ts">
    import _                      from "lodash";
    import { ValidationObserver } from "vee-validate";
    import mixins                 from "vue-typed-mixins";
    import switches               from "../../../controllers/switches";
    import DoesValidation         from "../../../foundation/concerns/does-valiadtion";
    import withRefs               from "../../../foundation/concerns/with-refs";
    import Driver                 from "../../../foundation/system/driver";
    import Switch                 from "../../../models/switch";
    import {
        DeviceLocation,
        getLocationFromPath, getSubPathFromPath,
        makeSerialDeviceList,
        rebuildPath,
        SerialDevice,
    } from "../../../support/switch-editing";

    type Validator  = InstanceType<typeof ValidationObserver>;
    type References = {
        validator: Validator;
    };

    const EMPTY_SWITCH: Switch = {
        _id:      "",
        driverId: "",
        title:    "",
        path:     "port:",
    };

    export default mixins(DoesValidation, withRefs<References>()).extend({
        name:  "SwitchEditor",
        props: {
            transition: { type: String, default: "dialog-transition" },
        },
        data() {
            return {
                DeviceLocation,
                visible:   false,
                drivers:   Driver.all(),
                subject:   _.cloneDeep(EMPTY_SWITCH),
                ports:     [] as SerialDevice[],
                location:  DeviceLocation.PATH,
                path:      "",
                locations: [
                    { value: DeviceLocation.PATH, label: "Path" },
                    { value: DeviceLocation.PORT, label: "Port" },
                    { value: DeviceLocation.IP,   label: "IP/Host" },
                ],
            };
        },
        computed: {
            title(): string {
                return this.subject._id.length > 0 ? "Edit switch" : "New switch";
            },
            pathLabel(): string {
                return _.upperFirst(this.pathName);
            },
            pathName(): string {
                switch (this.location) {
                case DeviceLocation.PATH:
                    return "path";
                case DeviceLocation.PORT:
                    return "serial port";
                case DeviceLocation.IP:
                    return "IP address or host name";
                default:
                    throw Error("Impossible device location");
                }
            },
            pathRules(): Record<string, unknown> {
                return this.location === DeviceLocation.PORT ? {
                    required: true,
                    oneOf:    this.validPorts,
                } : {
                    required: true,
                };
            },
            validPorts(): string[] {
                return this.ports.map(port => port.path);
            },
        },
        methods: {
            newSwitch(): void {
                this.$nextTick(async () => {
                    await this.readySubject(_.cloneDeep(EMPTY_SWITCH));
                    this.visible = true;
                });
            },
            editSwitch(subject: Switch): void {
                this.$nextTick(async () => {
                    await this.readySubject(_.cloneDeep(subject));
                    this.visible = true;
                });
            },
            onSaveClicked(): void {
                this.$nextTick(async () => {
                    try {
                        this.subject.path = rebuildPath(this.location, this.path);
                        if (this.subject._id === "") {
                            await switches.add(this.subject);
                        } else {
                            await switches.update(this.subject);
                        }
                    } catch (error) {
                        const ex = error as Error;
                        await this.$modals.alert({
                            main:      "Unable to edit switch",
                            secondary: ex.message,
                        });
                    }

                    this.visible = false;
                    this.subject = _.cloneDeep(EMPTY_SWITCH);
                    this.$nextTick(() => this.$emit("done"));
                });
            },
            async readySubject(subject: Switch): Promise<void> {
                this.ports    = await makeSerialDeviceList();
                this.subject  = subject;
                this.location = getLocationFromPath(subject.path);
                this.path     = getSubPathFromPath(subject.path);
                this.$refs.validator && this.$refs.validator.reset();
            },
        },
    });
</script>
