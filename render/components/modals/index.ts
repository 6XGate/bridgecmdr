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

import Vue                     from "vue";
import { CombinedVueInstance } from "vue/types/vue";

type ModalComponent<Methods> = CombinedVueInstance<Vue, {}, Methods, {}, {}>;

export interface ModalOptions {
    maxWidth?: number;
}

export interface AlertModalOptions extends ModalOptions {
    main:         string;
    secondary?:   string;
    dismissText?: string;
}

export interface ConfirmModalOptions extends ModalOptions {
    main:         string;
    secondary?:   string;
    confirmText?: string;
    rejectText?:  string;
}

export type AlertModal = ModalComponent<{
    open(options: AlertModalOptions): Promise<void>;
}>;

export type ConfirmModal = ModalComponent<{
    open(options: ConfirmModalOptions): Promise<boolean>;
}>;

declare module "vue/types/vue" {
    interface Vue {
        $modals: {
            alert(options: AlertModalOptions): Promise<void>;
            confirm(options: ConfirmModalOptions): Promise<boolean>;
        };
    }
}
