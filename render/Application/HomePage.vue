<template>
    <b-button @click="onSettingsClicked">Settings</b-button>
</template>

<script>
    export default {
        name:    "HomePage",
        methods: {
            onSettingsClicked() {
                this.$router.push({ name: "settings" });
            },
        },
    };
</script>
