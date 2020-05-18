/// <reference types="jquery" />
declare class XYPosition {
    constructor(x: number, y: number);
    X: number;
    Y: number;
}
declare class RichContentUtils {
    static ShowMenu(menu: any, buttonOrPosition: JQuery<HTMLElement> | XYPosition): void;
}
