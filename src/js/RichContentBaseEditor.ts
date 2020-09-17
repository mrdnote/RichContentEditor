class KeyValue<T>
{
    public Key: string;
    public Value: T;
}

interface Dictionary<T>
{
    [Key: string]: T;
}

interface EditorRegistration<T>
{
    EditorType: T;
}

class ContextCommand
{
    constructor(label: string, iconClasses: string, onClick: { (elem?: JQuery<HTMLElement>): void })
    {
        this.Label = label;
        this.IconClasses = iconClasses;
        this.OnClick = onClick;
    }

    public Label: string;
    public IconClasses: string;
    public OnClick: (elem?: JQuery<HTMLElement>) => void;
}

class RichContentBaseEditor
{
    public Name: string;
    public OnChange?: Function;
    protected RichContentEditorInstance: RichContentEditor;
    private _registeredCssClasses: string[] = [];

    private static _registrations: Dictionary<typeof RichContentBaseEditor> = {};

    public static RegisterEditor<T extends typeof RichContentBaseEditor>(name: string, editorType: T)
    {
        RichContentBaseEditor._registrations[name] = editorType;
    }

    public static Create(editor: string): RichContentBaseEditor
    {
        if (!RichContentBaseEditor._registrations.hasOwnProperty(editor)) throw `RichContentBaseEditor ${editor} not registered!`;
        const result = new RichContentBaseEditor._registrations[editor];
        result.Name = editor;
        return result;
    }

    public static GetRegistrations(): Dictionary<typeof RichContentBaseEditor>
    {
        return this._registrations;
    }

    public Init(richContentEditor: RichContentEditor): void
    {
        this.RichContentEditorInstance = richContentEditor;
    }

    public GetDetectionSelectors()
    {
        return '';
    }

    public Import(_target: JQuery<HTMLElement>, _source: JQuery<HTMLElement>, touchedElements: HTMLElement[]): JQuery<HTMLElement>
    {
        throw new Error("Method not implemented.");
    }

    public CopyCssClasses(source: JQuery<HTMLElement>, target: JQuery<HTMLElement>)
    {
        for (var i = 0; i < this._registeredCssClasses.length; i++)
        {
            const cssClass = this._registeredCssClasses[i];
            if (source.hasClass(cssClass))
            {
                target.addClass(cssClass);
            }
        }
    }

    public GetMenuLabel(): string
    {
        throw new Error(`GetMenuLabel() not implemented in ${this.Name}!`);
    }

    public GetMenuIconClasses(): string
    {
        throw new Error(`GetMenuIconClasses() not implemented in ${this.Name}!`);
    }

    public Clicked(elem: JQuery<HTMLElement>): void
    {

    }

    public GetContextButtonText(_elem: JQuery<HTMLElement>): string
    {
        throw new Error(`GetContextButtonText() not implemented in ${this.constructor['name']}!`);
    }

    public UseWrapper(): boolean
    {
        return true;
    }

    public GetEditorTypeName(): string
    {
        return this.Name;
    }

    public GetContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[]
    {
        return null;
    }

    public GetToolbarCommands(_elem: JQuery<HTMLElement>): ContextCommand[]
    {
        return null;
    }

    public AllowInTableCell(): boolean
    {
        return false;
    }

    public AllowInLink(): boolean
    {
        return false;
    }

    public Clean(_elem: JQuery<HTMLElement>)
    {
    }

    public SetupEditor(elems: JQuery<HTMLElement>, keepWhenCleaning: boolean = false)
    {
        const _this = this;

        elems.each(function ()
        {
            const elem = $(this);

            if (_this.UseWrapper())
            {
                elem.addClass('rce-editor-wrapper');
                if (keepWhenCleaning) elem.addClass('rce-editor-wrapper-keep');
            }
            elem.data('editorTypeName', _this.GetEditorTypeName());
            elem.addClass('rce-element-editor');
            const menuButtonText = _this.GetContextButtonText(elem);
            const menuButton = $(`<button type="button" class="hover-button rce-menu-button">${menuButtonText}◀</button>`);
            elem.prepend(menuButton);

            menuButton.click(function ()
            {
                _this.showContextMenu(elem, menuButton);
            });

            elem.bind('contextmenu', function (e)
            {
                e.preventDefault();
                e.stopPropagation();
                _this.showContextMenu(elem, new XYPosition(e.clientX + window.scrollX, e.clientY + window.scrollY));
            });

            elem.click(function (e)
            {
                if (!$(e.target).hasClass('rce-menu-button'))
                {
                    _this.Clicked(elem);
                }
            });

            elem.focusin(function (e)
            {
                // show toolbar when focusing, but only when its not an inline element (because that screws up the layout)
                if (elem.closest('a').length === 0)
                {
                    _this.showToolbar(elem);
                    e.preventDefault();
                }
            });
        });
    }

    public EliminateElementWrapper(elem: JQuery<HTMLElement>)
    {
        const _this = this;

        var children = elem.children();
        children.each(function ()
        {
            _this.RichContentEditorInstance.CleanElement($(this));
        });
        const detachedElements = elem.children().detach();

        this.CopyCssClasses(elem, detachedElements);

        elem.replaceWith(detachedElements);

        _this.Clean(detachedElements)
    }

    private showContextMenu(elem, buttonOrPosition: JQuery<HTMLElement> | XYPosition)
    {
        const _this = this;
        const actualElement = _this.GetActualElement(elem);

        this.RichContentEditorInstance.CloseAllMenus();

        const menu = $('<div class="rce-menu"></ul>')
        const commands = this.GetContextCommands(elem);
        if (commands !== null)
        {
            for (let i = 0; i < commands.length; i++)
            {
                const command = commands[i];
                const item = $(`<button type="button" class="rce-menu-item"><i class="rce-menu-icon ${command.IconClasses}"></i> <span class="rce-menu-label">${command.Label}</span></button>`);
                item.click(function (e)
                {
                    e.preventDefault();
                    command.OnClick(elem);
                    menu.remove();
                });
                menu.append(item);
            }
        }

        if (this._registeredCssClasses.length)
        {
            const editClassesItem = $(`<button type="button" href="javascript:" class="rce-menu-item"><i class="rce-menu-icon fas fa-code"></i> <span>${_this.RichContentEditorInstance.Locale.EditClasses}</span></button>`);
            editClassesItem.click(function ()
            {
                menu.remove();
                let dialog = _this.getCssClassesDialog();
                const list = $('.rce-checkbox-list', dialog);
                const gridSelector = _this.RichContentEditorInstance.GridSelector;

                for (let index in _this._registeredCssClasses)
                {
                    const cls = _this._registeredCssClasses[index];
                    $(`input[data-value="${cls}"]`, list).prop('checked', actualElement.hasClass(cls) || elem.hasClass(cls));
                }

                dialog.data('elem', elem);

                _this.RichContentEditorInstance.DialogManager.ShowDialog(dialog, (dialog) =>
                {
                    let valid = _this.RichContentEditorInstance.DialogManager.ValidateFields(gridSelector, $('input', dialog));
                    if (!valid) return;

                    var checkBoxes = $('.rce-dialog-content input:checkbox', dialog);
                    checkBoxes.each(function ()
                    {
                        const checkBox = $(this);
                        const cls = checkBox.attr('data-value');
                        elem.toggleClass(cls, checkBox.prop('checked'));
                        actualElement.toggleClass(cls, checkBox.prop('checked'));
                    });

                    _this.OnChange();
                    _this.RichContentEditorInstance.DialogManager.CloseDialog(dialog);
                    return true;
                });
            });

            menu.append(editClassesItem)
        }

        const deleteItem = $(`<button type="button" href="javascript:" class="rce-menu-item"><i class="rce-menu-icon fas fa-trash"></i> <span>${_this.RichContentEditorInstance.Locale.Delete}</span></button>`);
        deleteItem.click(function () { _this.OnDelete(elem), menu.remove(); });
        menu.append(deleteItem)

        RichContentUtils.ShowMenu(menu, buttonOrPosition);
    }

    public GetActualElement(elem: JQuery<HTMLElement>): JQuery<HTMLElement>
    {
        return elem;
    }

    public RegisterCssClasses(classes: string[])
    {
        this._registeredCssClasses = this._registeredCssClasses.concat(classes);
    }

    private showToolbar(elem: JQuery<HTMLElement>)
    {
        const commands = this.GetToolbarCommands(elem);
        if (commands !== null)
        {
            let toolbar = elem.find('.rce-toolbar');

            // close all other toolbars
            $('.rce-toolbar').not(toolbar).remove();

            if (!toolbar.length)
            {
                toolbar = $('<div class="rce-toolbar"></ul>');
                for (let i = 0; i < commands.length; i++)
                {
                    const command = commands[i];
                    const item = $(`<button type="button" class="rce-button rce-toolbar-item" title="${command.Label}"><i class="rce-toolbar-icon ${command.IconClasses}"></i></button>`);
                    item.click(function (e)
                    {
                        e.preventDefault();
                        command.OnClick(elem);
                    });
                    toolbar.append(item);
                }
                elem.prepend(toolbar);
            }
        }
    }

    public OnDelete(elem: JQuery<HTMLElement>)
    {
        elem.remove(); 
    }

    public Insert(_targetElement?: JQuery<HTMLElement>)
    {
        // nothing in base class
    }

    public Attach(element, target: JQuery<HTMLElement>)
    {
        const addButton = target.find('.add-button');
        if (addButton.length)
        {
            element.insertBefore(addButton);
        }
        else
        {
            target.append(element);
        }
        this.SetupEditor(element);
    }

    private getCssClassesDialog()
    {
        let dialog = $('#' + this.RichContentEditorInstance.EditorId + ' .css-classes-dialog');
        if (!dialog.length)
        {
            dialog = $(this.getCssClassesDialogHtml(this.RichContentEditorInstance.EditorId));
            const list = $('.rce-checkbox-list', dialog);
            for (var index in this._registeredCssClasses)
            {
                const cls = this._registeredCssClasses[index];
                var checkBox = $(`<label class="rce-checkbox"><input data-value="${cls}" type="checkbox"><span>${cls}</span></label>`);
                list.append(checkBox);
            }
            dialog.appendTo($('#' + this.RichContentEditorInstance.EditorId));
        }
        return dialog;
    }

    private getCssClassesDialogHtml(id: string): string
    {
        return `
            <div class="rce-dialog css-classes-dialog">
                <div class="rce-dialog-content">
                    <div class="rce-dialog-title">${this.RichContentEditorInstance.Locale.EditClasses}</div>
                    <div class="rce-checkbox-list"></div>
                </div>
                <div class="rce-dialog-footer">
                    <a href="javascript:" class="rce-button rce-button-flat rce-close-dialog">${this.RichContentEditorInstance.DialogManager.Locale.DialogCancelButton}</a>
                    <a href="javascript:" class="rce-button rce-submit-dialog">${this.RichContentEditorInstance.DialogManager.Locale.DialogSaveButton}</a>
                </div>
            </div>`;
    }
}
