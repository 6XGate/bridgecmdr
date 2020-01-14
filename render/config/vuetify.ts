/*
BridgeCmdr - A/V switch and monitor controller
Copyright (C) 2019-2020 Matthew Holder

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import Vuetify from "vuetify/lib";
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
