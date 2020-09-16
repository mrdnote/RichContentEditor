/// <reference types="jquery" />
declare class KeyValue<T> {
    Key: string;
    Value: T;
}
interface Dictionary<T> {
    [Key: string]: T;
}
interface EditorRegistration<T> {
    EditorType: T;
}
declare class ContextCommand {
    constructor(label: string, iconClasses: string, onClick: {
        (elem?: JQuery<HTMLElement>): void;
    });
    Label: string;
    IconClasses: string;
    OnClick: (elem?: JQuery<HTMLElement>) => void;
}
declare class RichContentBaseEditor {
    Name: string;
    OnChange?: Function;
    protected RichContentEditorInstance: RichContentEditor;
    private _registeredCssClasses;
    private static _registrations;
    static RegisterEditor<T extends typeof RichContentBaseEditor>(name: string, editorType: T): void;
    static Create(editor: string): RichContentBaseEditor;
    static GetRegistrations(): Dictionary<typeof RichContentBaseEditor>;
    Init(richContentEditor: RichContentEditor): void;
    GetDetectionSelectors(): string;
    Import(_target: JQuery<HTMLElement>, _source: JQuery<HTMLElement>, touchedElements: HTMLElement[]): JQuery<HTMLElement>;
    CopyCssClasses(source: JQuery<HTMLElement>, target: JQuery<HTMLElement>): void;
    GetMenuLabel(): string;
    GetMenuIconClasses(): string;
    Clicked(elem: JQuery<HTMLElement>): void;
    GetContextButtonText(_elem: JQuery<HTMLElement>): string;
    UseWrapper(): boolean;
    GetEditorTypeName(): string;
    GetContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[];
    GetToolbarCommands(_elem: JQuery<HTMLElement>): ContextCommand[];
    AllowInTableCell(): boolean;
    AllowInLink(): boolean;
    Clean(_elem: JQuery<HTMLElement>): void;
    SetupEditor(elems: JQuery<HTMLElement>, keepWhenCleaning?: boolean): void;
    EliminateElementWrapper(elem: JQuery<HTMLElement>): void;
    private showContextMenu;
    GetActualElement(elem: JQuery<HTMLElement>): JQuery<HTMLElement>;
    RegisterCssClasses(classes: string[]): void;
    private showToolbar;
    OnDelete(elem: JQuery<HTMLElement>): void;
    Insert(_targetElement?: JQuery<HTMLElement>): void;
    Attach(element: any, target: JQuery<HTMLElement>): void;
    private getCssClassesDialog;
    private getCssClassesDialogHtml;
}
