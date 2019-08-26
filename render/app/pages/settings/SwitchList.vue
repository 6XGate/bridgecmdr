<template>
    <settings-panel title="Switches">
        <template slot="end">
            <b-navbar-item tag="router-link" :to="toNewSwitch()">
                <b-icon icon="plus"/>
            </b-navbar-item>
        </template>
        <section class="section">
            <div class="panel">
                <router-link v-for="row of switches" :key="row.guid" class="panel-block panel-level"
                             :to="toExistingSwitch(row)">
                    <div class="level" style="{ display: block }">
                        <div class="level-left">
                            <div class="level-item">{{ row.title }}</div>
                        </div>
                        <div class="level-right">
                            <div class="level-item">
                                <b-button icon-left="delete" type="is-danger"/>
                            </div>
                        </div>
                    </div>
                </router-link>
            </div>
        </section>
    </settings-panel>
</template>

<script lang="ts">
    import Vue              from "vue";
    import { Location }     from "vue-router";
    import SettingsPanel    from "../../../components/SettingsPanel.vue";
    import SwitchController from "../../../controller/SwitchController";
    import Switch           from "../../../models/Switch";

    export default Vue.extend({
        name:       "SwitchList",
        components: {
            SettingsPanel,
        },
        data: function () {
            return {
                switches: <Switch[]>[],
            };
        },
        methods: {
            async refresh(): Promise<void> {
                this.switches = await SwitchController.all();
            },
            toNewSwitch(): Location {
                return { name: "switch", params: { "subjectId": "new" } };
            },
            toExistingSwitch(row: Switch): Location {
                return { name: "switch", params: { "subjectId": row.guid } };
            },
        },
        mounted() {
            this.refresh();
        },
    });
</script>

<style lang="scss" scoped>
    .panel-level {
        display: block;
    }
</style>
