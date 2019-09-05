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
        <v-app-bar app color="indigo" dark>
            <v-btn icon @click="onBackClicked"><v-icon>{{ backIcon }}</v-icon></v-btn>
            <v-toolbar-title>{{ title }}</v-toolbar-title>
            <div class="flex-grow-1"></div>
            <slot name="app-bar"/>
        </v-app-bar>
        <slot name="pre-content"/>
        <v-content>
            <v-container fluid class="fill-height">
                <slot/>
            </v-container>
        </v-content>
        <slot name="post-content"/>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";

    export default Vue.extend({
        name:  "SettingsPanel",
        props: {
            title:    { type: String, required: true },
            backIcon: { type: String, default: "mdi-arrow-left" },
        },
        methods: {
            onBackClicked() {
                this.$router.back();
            },
        },
    });
</script>
