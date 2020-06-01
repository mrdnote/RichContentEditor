/// <reference types="jquery" />
interface FileListItem {
    name: string;
    uri: string;
}
declare enum ImageAlignment {
    None = 0,
    Fill = 1,
    Left = 2,
    Right = 3
}
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
    InsertImage(url: string, alignment: ImageAlignment, targetElement?: JQuery<HTMLElement>): void;
    private updateImage;
    private getImageAlignmentClass;
    private getImageAlignment;
    GetDetectionSelectors(): string;
    Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>): void;
    private hasCss;
    GetMenuLabel(): string;
    GetMenuIconClasses(): string;
    AllowInTableCell(): boolean;
    AllowInLink(): boolean;
    Clean(elem: JQuery<HTMLElement>): void;
    GetContextButtonText(_elem: JQuery<HTMLElement>): string;
    GetContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[];
    private removeEditorAlignmentClasses;
}
