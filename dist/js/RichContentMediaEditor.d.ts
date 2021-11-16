/// <reference types="jquery" />
declare enum MediaType {
    GenericVideo = 0,
    YouTubeVideo = 1,
    GenericAudio = 2
}
declare class RichContentMediaEditor extends RichContentBaseEditor {
    private _appendElement;
    private static _localeRegistrations?;
    private _locale?;
    static RegisterLocale?<T extends typeof RichContentMediaEditorLocale>(localeType: T, language: string): void;
    Init(richContentEditor: RichContentEditor): void;
    Insert(targetElement?: JQuery<HTMLElement>): void;
    private showSelectionDialog;
    private getUrl;
    InsertElement(url: string, targetElement?: JQuery<HTMLElement>): void;
    private getCoreElement;
    private updateElement;
    private getMediaType;
    GetDetectionSelectors(): string;
    GetActualElement(elem: JQuery<HTMLElement>): JQuery<HTMLElement>;
    Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>, touchedElements: HTMLElement[]): JQuery<HTMLElement>;
    GetMenuLabel(): string;
    GetMenuIconClasses(): string;
    AllowInTableCell(): boolean;
    AllowInLink(): boolean;
    Clean(elem: JQuery<HTMLElement>): void;
    GetContextButtonText(_elem: JQuery<HTMLElement>): string;
    GetContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[];
}
