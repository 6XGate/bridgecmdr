import Vue from "vue";
import { DialogConfig } from "buefy/types/components";

export default {
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
