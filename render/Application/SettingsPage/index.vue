<template>
    <div>
        <b-navbar type="is-primary">
            <template slot="start">
                <b-navbar-item tag="div">
                    <b-button icon-left="arrow-left" label="Back" @click="onBackClicked"/>
                </b-navbar-item>
            </template>
        </b-navbar>
        <div class="content">
            <section class="section">
                <nav class="panel">
                    <a class="panel-block">
                        <span class="panel-icon"><i class="mdi mdi-gamepad-variant"></i></span>
                        <span>Sources</span>
                    </a>
                    <a class="panel-block">
                        <span class="panel-icon"><i class="mdi mdi-video-switch"></i></span>
                        <span>Switches</span>
                    </a>
                </nav>
            </section>
        </div>
    </div>
</template>

<script>
    export default {
        name:    "SettingsPage",
        methods: {
            onBackClicked() {
                this.$router.back();
            },
        },
    };
</script>
