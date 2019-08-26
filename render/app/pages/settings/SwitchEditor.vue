<template>
    <settings-panel :title="title">
        <template slot="end">
            <b-navbar-item tag="a" @click.native.stop="onSaveClicked">
                Save
            </b-navbar-item>
        </template>

        <form action="" v-if="subject" class="section">
            <b-field label="Title" horizontal>
                <b-input type="text" v-model="subject.title"/>
            </b-field>
            <b-field label="Driver" horizontal>
                <b-select v-model="subject.driver_guid">
                    <option v-for="driver of drivers" :key="driver.guid" :value="driver.guid">
                        {{ driver.title }}
                    </option>
                </b-select>
            </b-field>
            <!-- TODO Driver specific configuration components will go here -->
        </form>
    </settings-panel>
</template>

<script lang="ts">
    import _                from "lodash";
    import Vue              from "vue";
    import SettingsPanel    from "../../../components/SettingsPanel.vue";
    import Driver           from "../../../system/Driver";
    import Switch           from "../../../models/Switch";
    import SwitchController from "../../../controller/SwitchController";

    const NEW_SWITCH: Switch = {
        guid:        "",
        driver_guid: "",
        title:       "",
        config:      "{}",
    };

    export default Vue.extend({
        name:       "SwitchEditor",
        components: {
            SettingsPanel,
        },
        props: {
            subjectId: { required: true, type: String },
        },
        data() {
            return {
                drivers: Driver.all(),
                subject: <Switch|null>null,
                test: this.subjectId,
            };
        },
        computed: {
            title(): string {
                return this.subject ? "Edit switch" : "New switch";
            },
        },
        methods: {
            onSaveClicked() {
                // TODO
                console.log("Save clicked, but not implemented");
            }
        },
        async mounted() {
            const subjects = this.subjectId !== "new" ? await SwitchController.get(this.subjectId) :
                [ _.clone(NEW_SWITCH) ];
            if (subjects.length > 0) {
                this.subject = subjects[0];
            } else {
                // TODO: Display error...
                this.$router.back();
            }
        },
    });
</script>
