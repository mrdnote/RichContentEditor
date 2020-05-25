/// <reference types="jquery" />
declare enum IconAlignment {
    None = 0,
    Left = 1,
    Right = 2
}
declare class RichContentFontAwesomeIconEditor extends RichContentBaseEditor {
    private _appendElement;
    private static _localeRegistrations?;
    private _locale?;
    static RegisterLocale?<T extends typeof RichContentFontAwesomeIconEditorLocale>(localeType: T, language: string): void;
    Init(richContentEditor: RichContentEditor): void;
    Insert(targetElement?: JQuery<HTMLElement>): void;
    private showSelectionDialog;
    InsertIcon(iconClass: any, linkUrl: string, lightBox: boolean, alignment: IconAlignment, targetElement?: JQuery<HTMLElement>): void;
    private updateIcon;
    private getIconAlignmentClass;
    private getIconAlignment;
    GetDetectionSelectors(): string;
    Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>): void;
    GetMenuLabel(): string;
    GetMenuIconClasses(): string;
    AllowInTableCell(): boolean;
    AllowInLink(): boolean;
    Clean(elem: JQuery<HTMLElement>): void;
    GetContextButtonText(_elem: JQuery<HTMLElement>): string;
    GetContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[];
    private removeEditorAlignmentClasses;
    private getEditDialog;
    private getEditDialogHtml;
}
