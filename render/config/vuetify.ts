import Vuetify from "vuetify";
import colors  from "vuetify/lib/util/colors";

const vuetify = new Vuetify({
    icons: {
        iconfont: "mdi",
    },
    theme: {
        themes: {
            light: {
                primary:       colors.indigo.base,
                secondary:     colors.indigo.lighten3,
                accent:        colors.teal.lighten5,
                primaryText:   "#FFFFFF",
                secondaryText: "#000000",
            },
            dark: {
                primary:       colors.indigo.base,
                secondary:     colors.indigo.lighten3,
                accent:        colors.teal.darken4,
                primaryText:   "#FFFFFF",
                secondaryText: "#000000",
            },
        },
    },
});

export default vuetify;
