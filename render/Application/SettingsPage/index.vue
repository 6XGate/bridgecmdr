<template>
    <settings-panel title="General">
        <section class="section">
            <nav class="panel">
                <a class="panel-block">
                    <span class="panel-icon"><i class="mdi mdi-gamepad-variant"></i></span>
                    <span>Sources</span>
                </a>
                <router-link class="panel-block" :to="{ name: 'switches' }">
                    <span class="panel-icon"><i class="mdi mdi-video-switch"></i></span>
                    <span>Switches</span>
                </router-link>
            </nav>
        </section>
    </settings-panel>
</template>

<script>
    import SettingsPanel from "../../components/SettingsPanel";

    export default {
        name:       "SettingsPage",
        components: {
            SettingsPanel,
        },
    };
</script>
