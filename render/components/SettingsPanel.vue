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
        <b-navbar type="is-primary">
            <template slot="start">
                <b-navbar-item tag="a" @click.native.stop="onBackClicked">
                    <b-icon icon="arrow-left"/>
                </b-navbar-item>
                <b-navbar-item tag="span">
                    {{ title }}
                </b-navbar-item>
            </template>
            <template slot="end">
                <slot name="end"/>
            </template>
        </b-navbar>
        <div class="content">
            <slot/>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";

    export default Vue.extend({
        name:  "SettingsPanel",
        props: {
            title: { required: true, type: String },
        },
        methods: {
            onBackClicked() {
                this.$router.back();
            },
        },
    });
</script>
