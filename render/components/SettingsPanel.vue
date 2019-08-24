<template>
    <div>
        <b-navbar type="is-primary">
            <template slot="start">
                <b-navbar-item tag="a" @click.native.stop="onBackClicked">
                    <b-icon icon="arrow-left"/>
                </b-navbar-item>
                <b-navbar-item tag="span">
                    {{ title }}
                </b-navbar-item>
            </template>
            <template slot="end">
                <slot name="end"/>
            </template>
        </b-navbar>
        <div class="content">
            <slot/>
        </div>
    </div>
</template>

<script>
    export default {
        name:  "SettingsPanel",
        props: {
            title: { required: true, type: String },
        },
        // data: function () {
        //     return {
        //         myTitle: title ?
        //     };
        // },
        methods: {
            onBackClicked() {
                this.$router.back();
            },
        },
    };
</script>
