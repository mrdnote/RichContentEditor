/// <reference types="jquery" />
declare class RichContentTableEditor extends RichContentBaseEditor {
    private static _localeRegistrations?;
    private _locale?;
    static RegisterLocale?<T extends typeof RichContentTableEditorLocale>(localeType: T, language: string): void;
    Init(richContentEditor: RichContentEditor): void;
    OnDelete(elem: JQuery<HTMLElement>): void;
    Insert(targetElement?: JQuery<HTMLElement>): void;
    Clean(elem: JQuery<HTMLElement>): void;
    AllowInTableCell(): boolean;
    private addTableRow;
    private attachRow;
    private addTableColumn;
    private attachColumn;
    private getTableColumnWidth;
    GetDetectionSelectors(): string;
    Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>): void;
    GetMenuLabel(): string;
    GetMenuIconClasses(): string;
    GetContextButtonText(elem: JQuery<HTMLElement>): string;
    GetContextCommands(elem: JQuery<HTMLElement>): ContextCommand[];
    private getColumnContextCommands;
    private setEditorColumnAlignment;
    private setFrameworkColumnAlignment;
    private cleanEditorColumnAlignment;
    private getTableColumnAlignment;
    private getFrameworkTableColumnAlignment;
    private getRowContextCommands;
    private getTableContextCommands;
    protected getActualElement(elem: JQuery<HTMLElement>): JQuery<HTMLElement>;
    private getColumnWidthDialog;
    private getColumnWidthDialogHtml;
}
