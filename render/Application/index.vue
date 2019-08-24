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
        <router-view/>
    </div>
</template>

<script>
    import VueRouter    from "vue-router";
    import HomePage     from "./HomePage";
    import SettingsPage from "./SettingsPage";

    /**
     * @param {string} path
     *
     * @returns {boolean}
     */
    function hasProps(path) {
        return path.includes(":");
    }

    /**
     * @param {string}           path
     * @param {string}           name
     * @param {ComponentOptions} component
     * @param {RouteConfig[]}    [children=undefined]
     *
     * @returns {RouteConfig}
     */
    function makeRoute(name, path, component, children = undefined) {
        return { name, path, component, props: hasProps(path), children };
    }

    const router = new VueRouter({
        routes: [
            makeRoute("home",     "/",         HomePage),
            makeRoute("settings", "/settings", SettingsPage),
        ],
    });

    export default {
        name: "Application",
        router,
    };
</script>
