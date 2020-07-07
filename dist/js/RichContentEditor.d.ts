/// <reference types="jquery" />
declare class RichContentEditorOptions {
    /**
     * The language to display the editor in.
     */
    Language: string;
    UploadUrl?: string;
    FileListUrl?: string;
    GridFramework?: string;
    CancelUrl?: string;
    Editors?: string[];
    RenderOnSave?: boolean;
    ShowCloseButton?: boolean;
    ShowSaveButton?: boolean;
    OnBeforeSave?: Function;
    OnSave?: (html: string) => void;
    OnClose?: Function;
    OnChange?: Function;
}
declare class GridFrameworkBase {
    private static _registrations;
    static Create(gridFramework?: string): GridFrameworkBase;
    static Register(name: string, gridFramework: typeof GridFrameworkBase): void;
    GetRightAlignClass?(): string;
    GetLeftAlignClass?(): string;
    GetBlockAlignClass?(): string;
    GetRightAlignCss?(): KeyValue<string>;
    GetLeftAlignCss?(): KeyValue<string>;
    GetBlockAlignCss?(): KeyValue<string>;
    UpdateFields(): void;
    GetRowClass(): string;
    GetColumnClass(width: number): string;
    GetSmallPrefix(): string;
    GetMediumPrefix(): string;
    GetLargePrefix(): string;
    GetExtraLargePrefix(): string;
    GetPreviousSize(size: string): string;
    GetColumnCount(): number;
    GetColumnLeftAlignClass(): string;
    GetColumnCenterAlignClass(): string;
    GetColumnRightAlignClass(): string;
}
interface FileListItem {
    name: string;
    uri: string;
}
declare class FileManager {
    private _richContentEditor;
    private static _localeRegistrations;
    Locale: FileManagerLocale;
    static RegisterLocale<T extends typeof FileManagerLocale>(localeType: T, language: string): void;
    constructor(richContentEditor: RichContentEditor, language: string);
    private updateFileList;
    ShowFileSelectionDialog(url: string, lightBox: boolean, targetBlank: boolean, imageMode: boolean, action: (url: string, lightBox: boolean, targetBlank: boolean) => boolean): void;
    private getFileSelectionDialog;
    private getFileSelectionDialogHtml;
}
declare class RichContentEditor {
    RegisteredEditors: Dictionary<RichContentBaseEditor>;
    FileManager: FileManager;
    DialogManager: DialogManager;
    GridFramework: GridFrameworkBase;
    EditElement: JQuery<HTMLElement>;
    EditorId: string;
    GridSelector: string;
    Options: RichContentEditorOptions;
    Locale: RichContentEditorLocale;
    private static _localeRegistrations;
    static RegisterLocale<T extends typeof RichContentEditorLocale>(localeType: T, language: string): void;
    GetEditor?(editor: string): RichContentBaseEditor;
    Init(editorId: string, options: RichContentEditorOptions): RichContentEditor;
    GetDetectionSelectors(editor: RichContentBaseEditor): string;
    ImportChildren(target: JQuery<HTMLElement>, source: JQuery<HTMLElement>, inTableCell: any, inLink: boolean): void;
    Delete(): void;
    /**
     * Get the editor content as HTML.
     */
    GetHtml(): string;
    /**
     * Save the editor content as HTML.
     */
    Save(): void;
    private clean;
    private cleanElement;
    EliminateElement(elem: JQuery<HTMLElement>): void;
    private instantiateEditors;
    private handleChanged;
    InsertEditor(editorTypeName: string, element: JQuery<HTMLElement>): void;
    CloseAllMenus(): void;
    CloseAllToolbars(): void;
    private showAddMenu;
}
declare class DialogManager {
    private static _dialogStack;
    private static _eventAttached;
    private static _localeRegistrations;
    Locale: DialogManagerLocale;
    static RegisterLocale<T extends typeof DialogManagerLocale>(localeType: T, language: string): void;
    constructor(richContentEditor: RichContentEditor, language: string);
    ShowDialog(dialog: JQuery<HTMLElement>, onSubmit?: (dialog: JQuery<HTMLElement>) => boolean): void;
    private dialogKeyDown;
    ValidateFields(gridSelector: string, elem: JQuery<HTMLElement>): boolean;
    CloseDialog(dialog: JQuery<HTMLElement>): void;
    ShowErrorDialog(gridSelector: string, message: string): void;
    getErrorDialogHtml(): any;
}
declare class HtmlTemplates {
    static GetMainEditorTemplate(id: string): string;
}
