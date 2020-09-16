/// <reference types="jquery" />
declare class RichContentBreakEditor extends RichContentBaseEditor {
    private _appendElement;
    Init(richContentEditor: RichContentEditor): void;
    Insert(targetElement?: JQuery<HTMLElement>): void;
    InsertBreak(targetElement?: JQuery<HTMLElement>): void;
    GetDetectionSelectors(): string;
    Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>, touchedElements: HTMLElement[]): JQuery<HTMLElement>;
    GetMenuLabel(): string;
    GetMenuIconClasses(): string;
    AllowInTableCell(): boolean;
    AllowInLink(): boolean;
    Clean(elem: JQuery<HTMLElement>): void;
    GetContextButtonText(_elem: JQuery<HTMLElement>): string;
    UseWrapper(): boolean;
}
