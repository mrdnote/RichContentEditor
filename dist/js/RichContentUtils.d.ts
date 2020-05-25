/// <reference types="jquery" />
declare class XYPosition {
    constructor(x: number, y: number);
    X: number;
    Y: number;
}
declare class RichContentUtils {
    static GetMimeType(url: string): string;
    static IsVideoUrl(url: string): boolean;
    static HasFeatherLight(): boolean;
    static GetExtensionOfUrl(url: string): string;
    static ShowMenu(menu: any, buttonOrPosition: JQuery<HTMLElement> | XYPosition): void;
    static IsNullOrEmpty(value: string): boolean;
}
