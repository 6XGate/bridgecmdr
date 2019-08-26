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
    <router-view/>
</template>

<script lang="ts">
    import Vue, { VueConstructor }    from "vue";
    import VueRouter, { RouteConfig } from "vue-router";
    import HomePage                   from "./pages/HomePage.vue";
    import SettingsPage               from "./pages/settings/MainPage.vue";
    import SwitchList                 from "./pages/settings/SwitchList.vue";
    import SwitchEditor               from "./pages/settings/SwitchEditor.vue";

    function hasProps(path: string): boolean {
        return path.includes(":");
    }

    type Component = VueConstructor<Vue>;
    function makeRoute(name: string, path: string, component: Component, children?: RouteConfig[]): RouteConfig {
        return { name, path, component, props: hasProps(path), children };
    }

    const router = new VueRouter({
        routes: [
            makeRoute("home",     "/",                             HomePage),
            makeRoute("settings", "/settings",                     SettingsPage),
            makeRoute("switches", "/settings/switches",            SwitchList),
            makeRoute("switch",   "/settings/switches/:subjectId", SwitchEditor),
        ],
    });

    export default {
        name: "Application",
        router,
    };
</script>
