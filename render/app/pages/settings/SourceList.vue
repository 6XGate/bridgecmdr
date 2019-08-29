<template>
    <settings-panel title="Sources">
        <template slot="end">
            <b-navbar-item tag="router-link" :to="{}">
                <b-icon icon="plus"/>
            </b-navbar-item>
        </template>
        <section class="section">
            <div class="panel">
                <router-link v-for="row of sources" :key="row.guid" class="panel-block panel-level" :to="{}">
                    <div class="level">
                        <div class="level-left">
                            <div class="level-item">{{ row.title }}</div>
                        </div>
                        <div class="level-right">
                            <div class="level-item">
                                <b-button label="Edit Ties" type="is-primary"/>
                            </div>
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
    import Vue     from "vue";
    import modals  from "../../../components/modals";
    import sources from "../../../controller/sources";
    import Source  from "../../../models/source";

    export default Vue.extend({
        name: "SourceList",
        data: function () {
            return {
                sources: <Source[]>[],
            };
        },
        methods: {
            async refresh(): Promise<void> {
                this.sources = await sources.all();
            },
            async onDeleteClicked(row: Source): Promise<void> {
                const remove = await modals.confirm(this, {
                    type:        "is-danger",
                    icon:        "close-octagon",
                    title:       "Do you want to remove this source?",
                    message:     `You are about to remove "${row.title}"`,
                    confirmText: "Remove",
                    cancelText:  "Keep",
                    focusOn:     "cancel",
                });

                if (remove) {
                    await sources.remove(row.guid);
                    this.refresh();
                }
            }
        },
        mounted() {
            this.refresh();
        },
    });
</script>
