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
        <v-content>
            <v-container>
                <v-row>
                    <v-col>
                    </v-col>
                </v-row>
            </v-container>
        </v-content>
        <v-btn color="cyan" fab fixed bottom right :to="toSettings()">
            <v-icon>mdi-wrench</v-icon>
        </v-btn>
    </div>
</template>

<script lang="ts">
    import Vue          from "vue";
    import { Location } from "vue-router";

    export default Vue.extend({
        name:    "HomePage",
        methods: {
            toSettings(): Location {
                return { name: "settings" };
            },
        },
    });
</script>
