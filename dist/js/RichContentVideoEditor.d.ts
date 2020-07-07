/// <reference types="jquery" />
declare class RichContentVideoEditor extends RichContentBaseEditor {
    private _appendElement;
    private static _localeRegistrations?;
    private _locale?;
    static RegisterLocale?<T extends typeof RichContentVideoEditorLocale>(localeType: T, language: string): void;
    Init(richContentEditor: RichContentEditor): void;
    Insert(targetElement?: JQuery<HTMLElement>): void;
    private showSelectionDialog;
    private getUrl;
    InsertElement(url: string, targetElement?: JQuery<HTMLElement>): void;
    private isYouTube;
    private getCoreElement;
    private updateElement;
    GetDetectionSelectors(): string;
    Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>): void;
    GetMenuLabel(): string;
    GetMenuIconClasses(): string;
    AllowInTableCell(): boolean;
    AllowInLink(): boolean;
    Clean(elem: JQuery<HTMLElement>): void;
    GetContextButtonText(_elem: JQuery<HTMLElement>): string;
    GetContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[];
}
