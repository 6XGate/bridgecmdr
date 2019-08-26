<template>
    <b-button @click="onSettingsClicked">Settings</b-button>
</template>

<script lang="ts">
    import Vue from "vue";

    export default Vue.extend({
        name:    "HomePage",
        methods: {
            onSettingsClicked() {
                this.$router.push({ name: "settings" });
            },
        },
    });
</script>
