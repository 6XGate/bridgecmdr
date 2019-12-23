
export function toDataUrl(blob: Blob): Promise<string> {
    return new Promise<string>(function (resolve, reject): void {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error ? reader.error as Error : new Error("unknown error"));
        reader.readAsDataURL(blob);
    });
}
