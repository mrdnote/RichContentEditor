/// <reference types="jquery" />
interface FileListItem {
    name: string;
    uri: string;
}
declare enum ImageAlignment {
    Fill = 0,
    Left = 1,
    Right = 2
}
declare class RichContentImageEditor extends RichContentBaseEditor {
    private _appendElement;
    private static _localeRegistrations?;
    private _locale?;
    static RegisterLocale?<T extends typeof RichContentImageEditorLocale>(localeType: T, language: string): void;
    Init(richContentEditor: RichContentEditor): void;
    Insert(targetElement?: JQuery<HTMLElement>): void;
    InsertImage(url: string, alignment: ImageAlignment, targetElement?: JQuery<HTMLElement>): void;
    private getImageAlignmentClass;
    GetDetectionSelectors(): string;
    Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>): void;
    GetMenuLabel(): string;
    GetMenuIconClasses(): string;
    AllowInTableCell(): boolean;
    Clean(elem: JQuery<HTMLElement>): void;
    GetContextButtonText(_elem: JQuery<HTMLElement>): string;
    GetContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[];
}
