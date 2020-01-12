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

import registry     from "../foundation/system/registry";
import Source       from "../foundation/system/source";
import * as helpers from "../foundation/helpers";

export interface ButtonStyles {
    "white":     boolean;
    "blue-grey": boolean;
    "lighten-4": boolean;
}

export class Button {
    public readonly key: string;
    public readonly image: string;
    public readonly label: string;
    public readonly activate: () => Promise<void>;
    public classes: ButtonStyles = {
        "white":     false,
        "blue-grey": true,
        "lighten-4": true,
    };

    public constructor(source: Source, imageUrl: string, activated: (button: Button) => void) {
        this.key      = source.guid;
        this.image    = imageUrl;
        this.label    = source.title;
        this.activate = async () => {
            await source.select();
            activated(this);
            this.classes.white        = true;
            this.classes["blue-grey"] = false;
            this.classes["lighten-4"] = false;
        };
    }

    public deactivate(): void {
        this.classes.white        = false;
        this.classes["blue-grey"] = true;
        this.classes["lighten-4"] = true;
    }
}

export async function makeDashboard(): Promise<Button[]> {
    await registry.load();
    const sources   = Source.all();
    const images    = await Promise.all(sources.map(source => helpers.toDataUrl(source.image)));
    const dashboard = {
        buttons:      [] as Button[],
        activeButton: null as Button|null,
    };

    for (let i = 0; i !== sources.length; ++i) {
        const source = sources[i];
        const image  = images[i];
        if (source.ties.length > 0 || process.env.NODE_ENV !== "production") {
            dashboard.buttons.push(new Button(source, image, function onActivated(button: Button) {
                if (dashboard.activeButton) {
                    dashboard.activeButton.deactivate();
                }

                dashboard.activeButton = button;
            }));
        }
    }

    return dashboard.buttons;
}
