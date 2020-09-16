/// <reference types="jquery" />
declare type CustomTagInsertedCallBack = (editor: RichContentEditor, tag: JQuery<HTMLElement>) => void;
interface RichContentTextCustomTag {
    Name: string;
    Icon: string;
    Html: string;
    OnInsert: CustomTagInsertedCallBack;
}
declare class RichContentTextEditor extends RichContentBaseEditor {
    private static _localeRegistrations?;
    private _locale?;
    private _customTags;
    private _selectionChangedBound;
    static RegisterLocale?<T extends typeof RichContentTextEditorLocale>(localeType: T, language: string): void;
    Init(richContentEditor: RichContentEditor): void;
    Insert(targetElement?: JQuery<HTMLElement>): void;
    InsertContent(html?: string, targetElement?: JQuery<HTMLElement>): void;
    RegisterCustomTag(name: string, icon: string, html: string, onInsert?: CustomTagInsertedCallBack): void;
    GetActualElement(elem: JQuery<HTMLElement>): JQuery<HTMLElement>;
    private setupEvents;
    GetDetectionSelectors(): string;
    Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>, touchedElements: HTMLElement[]): JQuery<HTMLElement>;
    GetMenuLabel(): string;
    GetMenuIconClasses(): string;
    AllowInTableCell(): boolean;
    AllowInLink(): boolean;
    Clean(elem: JQuery<HTMLElement>): void;
    Clicked(elem: JQuery<HTMLElement>): void;
    GetContextButtonText(_elem: JQuery<HTMLElement>): string;
    GetContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[];
    private insertHTML;
    GetToolbarCommands(elem: JQuery<HTMLElement>): ContextCommand[];
}
