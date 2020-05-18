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
    protected RichContentEditorInstance: RichContentEditor;
    private static _registrations: Dictionary<typeof RichContentBaseEditor> = {};

    public static RegisterEditor<T extends typeof RichContentBaseEditor>(editorType: T)
    {
        RichContentBaseEditor._registrations[editorType['name']] = editorType;
    }

    public static Create(editor: string): RichContentBaseEditor
    {
        if (!RichContentBaseEditor._registrations.hasOwnProperty(editor)) throw `RichContentBaseEditor ${editor} not registered!`;
        return new RichContentBaseEditor._registrations[editor];
    }

    public static GetRegistrations(): Dictionary<typeof RichContentBaseEditor>
    {
        return this._registrations;
    }

    public Init(richContentEditor: RichContentEditor): void
    {
        this.Name = this.constructor['name'];
        this.RichContentEditorInstance = richContentEditor;
    }

    public GetDetectionSelectors()
    {
        return '';
    }

    public Import(_target: JQuery<HTMLElement>, _source: JQuery<HTMLElement>)
    {
        throw new Error("Method not implemented.");
    }

    public GetMenuLabel(): string
    {
        throw new Error(`GetMenuLabel() not implemented in ${this.constructor['name']}!`);
    }

    public GetMenuIconClasses(): string
    {
        throw new Error(`GetMenuIconClasses() not implemented in ${this.constructor['name']}!`);
    }

    public GetContextButtonText(_elem: JQuery<HTMLElement>): string
    {
        throw new Error(`GetContextButtonText() not implemented in ${this.constructor['name']}!`);
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

    public Clean(_elem: JQuery<HTMLElement>)
    {
    }

    public SetupEditor(elem: JQuery<HTMLElement>, keepWhenCleaning: boolean = false)
    {
        const _this = this;

        elem.addClass('rce-editor-wrapper');
        if (keepWhenCleaning) elem.addClass('rce-editor-wrapper-keep');
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
            _this.showContextMenu(elem, new XYPosition(e.clientX, e.clientY));
        });

        elem.focusin(function (e)
        {
            _this.showToolbar(elem);
            e.preventDefault();
        });
    }

    private showContextMenu(elem, buttonOrPosition: JQuery<HTMLElement> | XYPosition)
    {
        const _this = this;

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

        const deleteItem = $(`<button type="button" href="javascript:" class="rce-menu-item"><i class="rce-menu-icon fas fa-trash"></i> <span>${_this.RichContentEditorInstance.Locale.Delete}</span></button>`);
        deleteItem.click(function () { _this.OnDelete(elem), menu.remove(); });
        menu.append(deleteItem)

        RichContentUtils.ShowMenu(menu, buttonOrPosition);
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
}
