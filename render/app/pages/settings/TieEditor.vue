<!--
BridgeCmdr - A/V switch and monitor controller
Copyright (C) 2019-2020 Matthew Holder

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
        <slot name="activators" :edit="editTie" :create="newTie"/>
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
                                    <validation-provider v-slot="{ errors }" name="switch" rules="required" slim>
                                        <v-select v-model="subject.switchId" v-bind="validatesWith(errors)"
                                                  :items="switches" item-value="_id" item-text="title" label="Switch"
                                                  filled/>
                                    </validation-provider>
                                    <validation-provider v-slot="{ errors }" name="input channel"
                                                         rules="required|min_value:1" slim>
                                        <number-input v-model="subject.inputChannel" v-bind="validatesWith(errors)"
                                                      label="Input" :min="1" filled/>
                                    </validation-provider>
                                    <validation-provider v-slot="{ errors }" :name="videoOutputName"
                                                         :rules="videoOutputRules" slim>
                                        <number-input v-show="showVideoOutput" v-model="subject.outputChannels.video"
                                                      v-bind="validatesWith(errors)" :label="videoOutputLabel" :min="0"
                                                      filled/>
                                    </validation-provider>
                                    <validation-provider v-slot="{ errors }" name="audio output channel"
                                                         :rules="audioOutputRules" slim>
                                        <number-input v-show="showAudioOutput" v-model="subject.outputChannels.audio"
                                                      v-bind="validatesWith(errors)" label="Audio output" :min="0"
                                                      filled/>
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
    import _                                                from "lodash";
    import { ValidationObserver }                           from "vee-validate";
    import mixins                                           from "vue-typed-mixins";
    import ties                                             from "../../../controllers/ties";
    import switches                                         from "../../../controllers/switches";
    import DoesValidation                                   from "../../../foundation/concerns/does-valiadtion";
    import withRefs                                         from "../../../foundation/concerns/with-refs";
    import Driver, { DriverCapabilities, DriverDescriptor } from "../../../foundation/system/driver";
    import Source                                           from "../../../models/source";
    import Switch                                           from "../../../models/switch";
    import Tie                                              from "../../../models/tie";

    type Validator  = InstanceType<typeof ValidationObserver>;
    type References = {
        validator: Validator;
    };

    const EMPTY_TIE: Tie = {
        _id:            "",
        sourceId:       "",
        switchId:       "",
        inputChannel:   0,
        outputChannels: {
            video: 0,
            audio: 0,
        },
    };

    export default mixins(DoesValidation, withRefs<References>()).extend({
        name:  "TieEditor",
        props: {
            transition: { type: String, default: "dialog-transition" },
        },
        data: function () {
            return {
                visible:  false,
                subject:  _.cloneDeep(EMPTY_TIE),
                switches: [] as Switch[],
                drivers:  [] as DriverDescriptor[],
            };
        },
        computed: {
            title(): string {
                return this.subject._id.length > 0 ? "Edit tie" : "New tie";
            },
            switcher(): Switch|undefined {
                return _(this.switches).find(row => row._id === this.subject.switchId);
            },
            driver(): DriverDescriptor|undefined {
                return _(this.drivers).find(row => row.guid === _(this.switcher).get("driverId"));
            },
            showVideoOutput(): boolean {
                return this.driver ?
                    Boolean(this.driver.capabilities & DriverCapabilities.HAS_MULTIPLE_OUTPUTS) :
                    false;
            },
            showAudioOutput(): boolean {
                return (this.showVideoOutput && this.driver) ?
                    Boolean(this.driver.capabilities & DriverCapabilities.CAN_DECOUPLE_AUDIO_OUTPUT) :
                    false;
            },
            videoOutputName(): string {
                return this.showAudioOutput ? "video output channel" : "output channel";
            },
            videoOutputLabel(): string {
                return this.showAudioOutput ? "Video output" : "Output";
            },
            videoOutputRules(): Record<string, unknown> {
                // eslint-disable-next-line @typescript-eslint/camelcase
                return this.showVideoOutput ? { required: true, min_value: 1 } : {};
            },
            audioOutputRules(): Record<string, unknown> {
                // eslint-disable-next-line @typescript-eslint/camelcase
                return this.showAudioOutput ? { required: true, min_value: 1 } : {};
            },
        },
        methods: {
            async refresh(): Promise<void> {
                this.switches = await switches.all();
                this.drivers  = Driver.all();
            },
            newTie(source: Source) {
                this.$nextTick(async () => {
                    const subject = _.cloneDeep(EMPTY_TIE);
                    subject.sourceId = source._id;

                    await this.readySubject(subject);
                    this.visible = true;
                });
            },
            editTie(subject: Tie) {
                this.$nextTick(async () => {
                    await this.readySubject(_.cloneDeep(subject));
                    this.visible = true;
                });
            },
            onSaveClicked() {
                this.$nextTick(async () => {
                    try {
                        if (this.subject._id === "") {
                            await ties.add(this.subject);
                        } else {
                            await ties.update(this.subject);
                        }
                    } catch (error) {
                        const ex = error as Error;
                        await this.$modals.alert({
                            main:      "Unable to edit switch",
                            secondary: ex.message,
                        });
                    }

                    this.visible = false;
                    this.subject = _.cloneDeep(EMPTY_TIE);
                    this.$nextTick(() => this.$emit("done"));
                });
            },
            async readySubject(subject: Tie): Promise<void> {
                await this.refresh();
                this.subject = subject;
                this.$refs.validator && this.$refs.validator.reset();
            },
        },
    });
</script>
