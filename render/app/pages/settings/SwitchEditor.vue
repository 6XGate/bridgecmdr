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
        <v-dialog v-model="visible" persistent fullscreen hide-overlay :transition="transition">
            <validation-observer ref="validator" v-slot="{ valid }" slim>
                <v-card tile>
                    <v-app-bar>
                        <v-btn icon @click="visible = false"><v-icon>mdi-close</v-icon></v-btn>
                        <v-toolbar-title>{{ title }}</v-toolbar-title>
                        <div class="flex-grow-1"></div>
                        <v-toolbar-items>
                            <v-btn text :disabled="!valid" @click="onSaveClicked">Save</v-btn>
                        </v-toolbar-items>
                    </v-app-bar>
                    <v-card-text>
                        <v-row>
                            <v-col>
                                <v-form>
                                    <validation-provider v-slot="{ errors, invalid }" name="title"
                                                         rules="required" slim>
                                        <v-text-field v-model="subject.title" label="Name" :error="invalid"
                                                      filled :error-count="invalid ? errors.length : 0"
                                                      :error-messages="invalid ? errors[0] : undefined"/>
                                    </validation-provider>
                                    <validation-provider v-slot="{ errors, invalid }" name="driver"
                                                         rules="required" slim>
                                        <v-select v-model="subject.driverId" label="Driver" :error="invalid"
                                                  :items="drivers" item-value="guid" item-text="title"
                                                  filled :error-count="invalid ? errors.length : 0"
                                                  :error-messages="invalid ? errors[0] : undefined"/>
                                    </validation-provider>
                                    <div>{{ path }}</div>
                                    <v-row>
                                        <v-col cols="3">
                                            <v-select v-model="location" label="Type"
                                                      :items="locations" item-value="value" item-text="label"
                                                      filled/>
                                        </v-col>
                                        <v-col cols="9">
                                            <validation-provider #default="{ errors, invalid }" :name="pathName"
                                                                 rules="required" slim>
                                                <v-text-field v-show="location !== DeviceLocation.PORT" v-model="path"
                                                              :label="pathLabel" :error="invalid" filled
                                                              :error-count="invalid ? errors.length : 0"
                                                              :error-messages="invalid ? errors[0] : undefined"/>
                                            </validation-provider>
                                            <validation-provider #default="{ errors, invalid }" :name="pathName"
                                                                 :rules="portRules" slim>
                                                <v-select v-show="location === DeviceLocation.PORT" v-model="path"
                                                          :label="pathLabel" :error="invalid" :items="ports"
                                                          item-value="comName" item-text="comName" filled
                                                          :error-count="invalid ? errors.length : 0"
                                                          :error-messages="invalid ? errors[0] : undefined"/>
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
    import _                       from "lodash";
    import SerialPort              from "serialport";
    import Vue, { VueConstructor } from "vue";
    import { ValidationObserver }  from "vee-validate";
    import switches                from "../../../controller/switches";
    import Switch                  from "../../../models/switch";
    import Driver                  from "../../../support/system/driver";

    const EMPTY_SWITCH: Switch = {
        _id:      "",
        driverId: "",
        title:    "",
        path:     "port:",
    };

    type Validator = InstanceType<typeof ValidationObserver>;

    interface References {
        $refs: {
            validator: Validator;
        };
    }

    enum DeviceLocation {
        PATH = 0,
        PORT = 1,
        IP   = 2,
    }

    const vue = Vue as VueConstructor<Vue & References>;
    export default vue.extend({
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
                ports:     [] as SerialPort.PortInfo[],
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
            portRules(): Record<string, unknown> {
                return {
                    required: true,
                    oneOf:    this.validPorts,
                };
            },
            validPorts(): string[] {
                return this.ports.map(port => port.comName);
            },
        },
        methods: {
            newSwitch(): void {
                this.$nextTick(async () => {
                    await this.readySubject(_.cloneDeep(EMPTY_SWITCH));
                    this.visible = true;
                    requestAnimationFrame(() => this.$refs.validator.reset());
                });
            },
            editSwitch(subject: Switch): void {
                this.$nextTick(async () => {
                    await this.readySubject(_.cloneDeep(subject));
                    this.visible = true;
                    requestAnimationFrame(() => this.$refs.validator.validate());
                });
            },
            onSaveClicked(): void {
                this.$nextTick(async () => {
                    try {
                        this.subject.path = (() => {
                            if (this.location === DeviceLocation.IP) {
                                return `ip:${this.path}`;
                            }

                            if (this.location === DeviceLocation.PORT) {
                                return `port:${this.path}`;
                            }

                            return this.path;
                        })();

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
                this.ports    = await SerialPort.list();
                this.subject  = subject;
                this.location = (() => {
                    if (subject.path.startsWith("ip:")) {
                        return DeviceLocation.IP;
                    }

                    if (subject.path.startsWith("port:")) {
                        return DeviceLocation.PORT;
                    }

                    return DeviceLocation.PATH;
                })();
                this.path = (() => {
                    if (subject.path.startsWith("ip:")) {
                        return subject.path.substr(3);
                    }

                    if (subject.path.startsWith("port:")) {
                        return subject.path.substr(5);
                    }

                    return subject.path;
                })();
            },
        },
    });
</script>
