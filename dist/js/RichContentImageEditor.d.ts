/// <reference types="jquery" />
declare enum ColumnAlignment {
    Left = 0,
    Center = 1,
    Right = 2
}
declare class RichContentImageEditor extends RichContentBaseEditor {
    private _appendElement;
    private static _localeRegistrations?;
    private _locale?;
    static RegisterLocale?<T extends typeof RichContentImageEditorLocale>(localeType: T, language: string): void;
    Init(richContentEditor: RichContentEditor): void;
    Insert(targetElement?: JQuery<HTMLElement>): void;
    private showSelectionDialog;
    InsertImage(url: string, targetElement?: JQuery<HTMLElement>): void;
    private updateImage;
    GetDetectionSelectors(): string;
    GetActualElement(elem: JQuery<HTMLElement>): JQuery<HTMLElement>;
    Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>, touchedElements: HTMLElement[]): JQuery<HTMLElement>;
    private hasCss;
    GetMenuLabel(): string;
    GetMenuIconClasses(): string;
    AllowInTableCell(): boolean;
    AllowInLink(): boolean;
    Clean(elem: JQuery<HTMLElement>): void;
    GetContextButtonText(_elem: JQuery<HTMLElement>): string;
    GetContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[];
}
