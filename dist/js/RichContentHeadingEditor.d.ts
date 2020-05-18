/// <reference types="jquery" />
declare class RichContentHeadingEditor extends RichContentBaseEditor {
    private static _localeRegistrations?;
    private _locale?;
    static RegisterLocale?<T extends typeof RichContentHeadingEditorLocale>(localeType: T, language: string): void;
    Init(richContentEditor: RichContentEditor): void;
    Insert(targetElement?: JQuery<HTMLElement>): void;
    InsertContent(html?: string, targetElement?: JQuery<HTMLElement>): void;
    GetDetectionSelectors(): string;
    Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>): void;
    GetMenuLabel(): string;
    GetMenuIconClasses(): string;
    AllowInTableCell(): boolean;
    Clean(elem: JQuery<HTMLElement>): void;
    GetContextButtonText(_elem: JQuery<HTMLElement>): string;
    GetContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[];
    private getSizeDialog;
    private getSizeDialogHtml;
}
