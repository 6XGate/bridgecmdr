<template>
    <settings-panel title="Switches">
        <template slot="end">
            <b-navbar-item tag="a">
                <b-icon icon="plus"/>
            </b-navbar-item>
        </template>
        <section class="section">
            <div class="panel">
                <div v-for="row of switches" :key="row.guid" class="panel-block panel-level">
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
                </div>
            </div>
        </section>
    </settings-panel>
</template>

<script>
    import SettingsPanel    from "../../components/SettingsPanel";
    import SwitchController from "../../controller/SwitchController";

    export default {
        name:       "SwitchList",
        components: {
            SettingsPanel,
        },
        data: function () {
            return {
                switches: [],
            };
        },
        methods: {
            async refresh() {
                this.switches = await SwitchController.all();
            },
        },
        mounted() {
            this.refresh();
        },
    };
</script>

<style lang="scss" scoped>
    .panel-level {
        display: block;
    }
</style>
