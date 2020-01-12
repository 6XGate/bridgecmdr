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
