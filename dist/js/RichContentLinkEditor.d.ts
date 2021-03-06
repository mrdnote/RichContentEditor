/// <reference types="jquery" />
declare class RichContentLinkEditor extends RichContentBaseEditor {
    private _appendElement;
    private static _localeRegistrations?;
    private _locale?;
    static RegisterLocale?<T extends typeof RichContentLinkEditorLocale>(localeType: T, language: string): void;
    Init(richContentEditor: RichContentEditor): void;
    Insert(targetElement?: JQuery<HTMLElement>): void;
    private showSelectionDialog;
    InsertLink(url: string, lightBox: boolean, targetBlank: boolean, targetElement?: JQuery<HTMLElement>): void;
    private updateLink;
    GetDetectionSelectors(): string;
    Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>, touchedElements: HTMLElement[]): JQuery<HTMLElement>;
    GetMenuLabel(): string;
    GetMenuIconClasses(): string;
    AllowInTableCell(): boolean;
    Clean(elem: JQuery<HTMLElement>): void;
    GetContextButtonText(_elem: JQuery<HTMLElement>): string;
    UseWrapper(): boolean;
    GetContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[];
}
