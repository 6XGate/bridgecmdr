/*
BridgeCmdr - A/V switch and monitor controller
Copyright (C) 2019 Matthew Holder

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

import Vue from "vue";
import { DialogConfig } from "buefy/types/components";

export default {
    alert(parent: Vue, params: DialogConfig): Promise<void> {
        return new Promise<void>(function (resolve) {
            const confirmText = params.confirmText || "Dismiss";

            params = {
                type:      params.type,
                title:     params.title,
                message:   params.message,
                hasIcon:   Boolean(params.icon),
                icon:      params.icon,
                iconPack:  params.iconPack,
                size:      params.size,
                animation: params.animation,
                canCancel: true,
                scroll:    params.scroll,
                onConfirm: () => resolve(),
                onCancel:  () => resolve(),
                confirmText,
            };

            parent.$buefy.dialog.confirm(params);
        });
    },

    confirm(parent: Vue, params: DialogConfig): Promise<boolean> {
        return new Promise<boolean>(function (resolve) {
            const confirmText = params.confirmText || "Yes";
            const cancelText  = params.cancelText  || "No";

            params = {
                type:      params.type,
                title:     params.title,
                message:   params.message,
                hasIcon:   Boolean(params.icon),
                icon:      params.icon,
                iconPack:  params.iconPack,
                size:      params.size,
                animation: params.animation,
                canCancel: ["button"],
                scroll:    params.scroll,
                onConfirm: () => resolve(true),
                onCancel:  () => resolve(false),
                confirmText,
                cancelText,
            };

            parent.$buefy.dialog.confirm(params);
        });
    },
};
