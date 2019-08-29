<template>
    <validation-observer v-slot="{ valid }" slim>
        <settings-panel :title="title">
            <template slot="end">
                <b-navbar-item v-if="subject && valid" tag="a" @click.native.stop="onSaveClicked">
                    Save
                </b-navbar-item>
            </template>

            <form action="" v-if="subject" class="section">
                <validation-provider name="title" :rules="{ required: true }" v-slot="{ errors, invalid }" slim>
                    <b-field label="Title" horizontal
                             :type="invalid ? 'is-danger' : undefined"
                             :message="invalid ? errors[0] : undefined">
                        <b-input name="title" type="text" v-model="subject.title"/>
                    </b-field>
                </validation-provider>
                <validation-provider name="driver" :rules="{ required: true }" v-slot="{ errors, invalid  }" slim>
                    <b-field label="Driver" horizontal
                             :type="invalid ? 'is-danger' : undefined"
                             :message="invalid ? errors[0] : undefined">
                        <b-select v-model="subject.driver_guid">
                            <option v-for="driver of drivers" :key="driver.guid" :value="driver.guid">
                                {{ driver.title }}
                            </option>
                        </b-select>
                    </b-field>
                </validation-provider>
                <!-- TODO Driver specific configuration components will go here -->
            </form>
        </settings-panel>
    </validation-observer>
</template>

<script lang="ts">
    import _        from "lodash";
    import Vue      from "vue";
    import switches from "../../../controller/switches";
    import modals   from "../../../components/modals";
    import Switch   from "../../../models/switch";
    import Driver   from "../../../system/driver";

    const NEW_SWITCH: Switch = {
        guid:        "",
        driver_guid: "",
        title:       "",
        config:      {},
    };

    export default Vue.extend({
        name:  "SwitchEditor",
        props: {
            subjectId: { required: true, type: String },
        },
        data() {
            return {
                drivers: Driver.all(),
                subject: <Switch|null>null,
            };
        },
        computed: {
            title(): string {
                return this.subject ? "Edit switch" : "New switch";
            },
        },
        methods: {
            async onSaveClicked() {
                try {
                    if (this.subject) {
                        if (this.subject.guid === "") {
                            await switches.add(this.subject);
                            this.$router.back();
                        } else {
                            await switches.update(this.subject);
                            this.$router.back();
                        }
                    }
                } catch (error) {
                    await modals.alert(this, {
                        type:   "is-danger",
                        icon:   "alert-circle",
                        title:  "Unable to edit switch",
                        message: error,
                    });
                }
            },
        },
        async mounted() {
            try {
                const subjects = this.subjectId !== "new" ? await switches.get(this.subjectId) : [_.clone(NEW_SWITCH)];

                if (subjects.length > 0) {
                    this.subject = subjects[0];
                } else {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new ReferenceError(`Switch "${this.subjectId}" not found`);
                }
            } catch (error) {
                await modals.alert(this, {
                    type:   "is-danger",
                    icon:   "alert-circle",
                    title:  "Unable to edit switch",
                    message: error,
                });

                this.$router.back();
            }
        },
    });
</script>
