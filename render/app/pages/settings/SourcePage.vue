<template>
    <settings-panel title="Source">
        <v-row justify="center">
            <v-avatar>
                <!-- img v-if="image"/>
                <img v-if="!image"/ -->
            </v-avatar>
        </v-row>
        <v-list>
            <v-list-item two-line>
                <v-list-item-content>
                    <v-list-item-title>{{ subject.title }}</v-list-item-title>
                    <v-list-item-subtitle>Name</v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
            <v-list-item two-line>
                <v-list-item-content>
                    <v-list-item-title>Switch name</v-list-item-title>
                    <v-list-item-subtitle>Inputs and/or driver name</v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
        </v-list>
        <template #post-content>
            <v-btn color="cyan" rounded fixed bottom right>
                <v-icon left>mdi-plus</v-icon> Test
            </v-btn>
        </template>
    </settings-panel>
</template>

<script lang="ts">
    import _      from "lodash";
    import Vue    from "vue";
    import Source from "../../../models/source";

    const LOADING_SOURCE: Source = {
        _id:   "loading",
        title: "Loading...",
        image: "",
    };

    export default Vue.extend({
        name:  "SourcePage",
        props: {
            subjectId: { type: String, required: true },
        },
        data: function () {
            return {
                subject:    _.clone(LOADING_SOURCE),
                attachment: null as File|null,
                image:      "no/such/image", //null as string|null,
            };
        },
    });
</script>
