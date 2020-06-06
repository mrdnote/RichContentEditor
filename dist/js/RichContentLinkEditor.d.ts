/// <reference types="jquery" />
declare enum LinkAlignment {
    None = 0,
    Fill = 1,
    Left = 2,
    Right = 3
}
declare class RichContentLinkEditor extends RichContentBaseEditor {
    private _appendElement;
    private static _localeRegistrations?;
    private _locale?;
    static RegisterLocale?<T extends typeof RichContentLinkEditorLocale>(localeType: T, language: string): void;
    Init(richContentEditor: RichContentEditor): void;
    Insert(targetElement?: JQuery<HTMLElement>): void;
    private showSelectionDialog;
    InsertLink(url: string, lightBox: boolean, targetBlank: boolean, alignment: LinkAlignment, targetElement?: JQuery<HTMLElement>): void;
    private updateLink;
    private getAlignmentClass;
    private getAlignment;
    GetDetectionSelectors(): string;
    protected getActualElement(elem: JQuery<HTMLElement>): JQuery<HTMLElement>;
    Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>): void;
    private hasCss;
    GetMenuLabel(): string;
    GetMenuIconClasses(): string;
    AllowInTableCell(): boolean;
    Clean(elem: JQuery<HTMLElement>): void;
    GetContextButtonText(_elem: JQuery<HTMLElement>): string;
    GetContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[];
    private removeEditorAlignmentClasses;
}
