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
    <settings-panel title="General">
        <section class="section">
            <nav class="panel">
                <router-link class="panel-block" :to="{ name: 'sources' }">
                    <span class="panel-icon"><i class="mdi mdi-gamepad-variant"></i></span>
                    <span>Sources</span>
                </router-link>
                <router-link class="panel-block" :to="{ name: 'switches' }">
                    <span class="panel-icon"><i class="mdi mdi-video-switch"></i></span>
                    <span>Switches</span>
                </router-link>
            </nav>
        </section>
    </settings-panel>
</template>

<script lang="ts">
    import Vue from "vue";

    export default Vue.extend({
        name:       "SettingsPage",
    });
</script>
