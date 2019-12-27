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
    <v-app id="bridgecmdr">
        <v-content class="black">
            <v-container>
                <v-row no-gutters>
                    <v-col cols="auto">
                        <v-row justify="start" no-gutters>
                            <v-card v-for="button of buttons" :key="button.key" class="ma-1" :class="button.classes"
                                    tile @click="() => button.activate()">
                                <v-img :src="button.image" width="128px" height="128px"/>
                            </v-card>
                        </v-row>
                    </v-col>
                </v-row>
            </v-container>
        </v-content>
        <v-layout row class="ma-3 text-right fab-container">
            <v-btn color="red" class="mx-2 secondaryText--text" fab @click="powerOff">
                <v-icon>mdi-power</v-icon>
            </v-btn>
            <settings-page #activator="{ open }" transition="dialog-bottom-transition" @done="refresh">
                <v-btn color="secondary" class="mx-2 secondaryText--text" fab @click="open">
                    <v-icon>mdi-wrench</v-icon>
                </v-btn>
            </settings-page>
        </v-layout>
        <alert-modal ref="alert"/>
        <confirm-modal ref="confirm"/>
    </v-app>
</template>

<script lang="ts">
    import { promises as fs }      from "fs";
    import path                    from "path";
    import Vue, { VueConstructor } from "vue";
    import Vuetify                 from "vuetify";
    import colors                  from "vuetify/lib/util/colors";
    import xdgBasedir              from "xdg-basedir";
    import SettingsPage            from "./pages/SettingsPage.vue";
    import * as helpers            from "../support/helpers";
    import Source                  from "../support/system/source";
    import Switch                  from "../support/system/switch";
    import config                  from "../support/system/config";
    import {
        AlertModal,
        AlertModalOptions,
        ConfirmModal,
        ConfirmModalOptions,
    } from "../components/modals";

    const vuetify = new Vuetify({
        icons: {
            iconfont: "mdi",
        },
        theme: {
            themes: {
                light: {
                    primary:       colors.indigo.base,
                    secondary:     colors.indigo.lighten3,
                    accent:        colors.teal.lighten5,
                    primaryText:   "#FFFFFF",
                    secondaryText: "#000000",
                },
                dark: {
                    primary:       colors.indigo.base,
                    secondary:     colors.indigo.lighten3,
                    accent:        colors.teal.darken4,
                    primaryText:   "#FFFFFF",
                    secondaryText: "#000000",
                },
            },
        },
    });

    interface References {
        $refs: {
            alert:   AlertModal;
            confirm: ConfirmModal;
        };
    }

    interface ButtonStyles {
        "white":     boolean;
        "blue-grey": boolean;
        "lighten-4": boolean;
    }

    class Button {
        public readonly key: string;
        public readonly image: string;
        public readonly label: string;
        public readonly activate: () => Promise<void>;
        public classes: ButtonStyles = {
            "white":     false,
            "blue-grey": true,
            "lighten-4": true,
        };

        public constructor(source: Source, imageUrl: string, activated: (button: Button) => void) {
            this.key      = source.guid;
            this.image    = imageUrl;
            this.label    = source.title;
            this.activate = async () => {
                await source.select();
                activated(this);
                this.classes.white        = true;
                this.classes["blue-grey"] = false;
                this.classes["lighten-4"] = false;
            };
        }

        public deactivate(): void {
            this.classes.white        = false;
            this.classes["blue-grey"] = true;
            this.classes["lighten-4"] = true;
        }
    }

    async function makeButtons(activated: (button: Button) => void): Promise<Button[]> {
        await config.load();
        const sources = Source.all();
        const images  = await Promise.all(sources.map(source => helpers.toDataUrl(source.image)));
        const buttons = [] as Button[];
        for (let i = 0; i !== sources.length; ++i) {
            const source = sources[i];
            const image  = images[i];
            if (source.ties.length > 0 || process.env.NODE_ENV !== "production") {
                buttons.push(new Button(source, image, activated));
            }
        }

        return buttons;
    }

    const vue = Vue as VueConstructor<Vue & References>;
    export default vue.extend({
        name:       "Application",
        components: {
            SettingsPage,
        },
        data: function () {
            return {
                buttons:      [] as Button[],
                activeButton: null as Button|null,
            };
        },
        methods: {
            async refresh() {
                this.buttons = [];
                await config.reload();
                this.buttons = await makeButtons(button => this.onButtonActivated(button));
            },
            async powerOff() {
                try {
                    await Promise.all(Switch.all().map(_switch => _switch.powerOff()));
                } catch (error) {
                    console.error(error);
                }

                if (process.env.NODE_ENV === "production") {
                    await helpers.signalShutdown();
                }

                window.close();
            },
            onButtonActivated(button: Button) {
                if (this.activeButton) {
                    this.activeButton.deactivate();
                }

                this.activeButton = button;
            },
        },
        mounted() {
            Vue.prototype.$modals = {
                alert:   (options: AlertModalOptions) => this.$refs.alert.open(options),
                confirm: (options: ConfirmModalOptions) => this.$refs.confirm.open(options),
            };

            // On the first run, check for an auto-start file. Ask the user if they wish to make one.
            this.$nextTick(async () => {
                const configDir    = xdgBasedir.config;
                const doneFirstRun = Number(window.localStorage.getItem("doneFirstRun") || 0);
                if (doneFirstRun < 1) {
                    // 1. Auto-start file creation.
                    if (configDir) {
                        const autoStartDir = path.resolve(configDir, "autostart");
                        await fs.mkdir(autoStartDir, { recursive: true });

                        const autoStartFile = "org.sleepingcats.BridgeCmdr.desktop";
                        const autoStartPath = path.resolve(autoStartDir, autoStartFile);

                        const autoStartExists = await fs.stat(autoStartPath).
                            then(stat => stat.isFile()).catch(() => false);
                        if (!autoStartExists) {
                            const createAutoStart = await this.$modals.confirm({
                                main:      "Do you want BridgeCmdr to start on boot?",
                                secondary: "You can start BridgeCmdr when your system starts",
                            });

                            if (createAutoStart) {
                                const needsExecProxy = (/electron$/u).test(process.execPath);
                                const exec = needsExecProxy ?
                                    path.resolve(window.__dirname, "../../bridgecmdr") :
                                    "bridgecmdr";
                                try {
                                    const entry = await fs.open(autoStartPath, "w", 0o644);
                                    await entry.write("[Desktop Entry]\n");
                                    await entry.write("Name=BridgeCmdr\n");
                                    await entry.write(`Exec=${exec}\n`);
                                    await entry.write("NoDisplay=true\n");
                                    await entry.write("Terminal=false\n");
                                } catch (error) {
                                    const ex = error as Error;
                                    await this.$modals.alert({
                                        main:      "Unable create auto-start entry",
                                        secondary: ex.message,
                                    });
                                }
                            }
                        }
                    }

                    window.localStorage.setItem("doneFirstRun", String(1));
                }
            });

            // Load and create the buttons.
            this.$nextTick(async () => {
                this.buttons = await makeButtons(button => this.onButtonActivated(button));
            });
        },
        vuetify,
    });
</script>

<style lang="scss">
    @import "~@mdi/font";
    @import '~vuetify/src/styles/styles';

    .fab-container {
        position: fixed;
        bottom: 0;
        right: 0;
    }
</style>
