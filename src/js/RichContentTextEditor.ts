class RichContentTextEditor extends RichContentBaseEditor
{
    private static _localeRegistrations?: Dictionary<typeof RichContentTextEditorLocale> = {};
    private _locale?: RichContentTextEditorLocale;

    public static RegisterLocale?<T extends typeof RichContentTextEditorLocale>(localeType: T, language: string)
    {
        RichContentTextEditor._localeRegistrations[language] = localeType;
    }

    public Init(richContentEditor: RichContentEditor): void
    {
        super.Init(richContentEditor);

        this._locale = new RichContentTextEditor._localeRegistrations[richContentEditor.Options.Language]();
    }

    public Insert(targetElement?: JQuery<HTMLElement>)
    {
        this.InsertContent(null, targetElement);
    }

    public InsertContent(html?: string, targetElement?: JQuery<HTMLElement>)
    {
        super.Insert(targetElement);

        if (!html) html = '';

        const textArea = $(`<div class="rce-textarea-editor" contenteditable="true">${html}</div>`);
        const textAreaWrapper = $('<div class="rce-textarea-wrapper"></div>');
        textAreaWrapper.append(textArea);

        if (!targetElement)
        {
            targetElement = $('.rce-grid', this.RichContentEditorInstance.GridSelector);
        }

        this.Attach(textAreaWrapper, targetElement);

        textAreaWrapper.find('.rce-textarea-editor').focus();

        textArea[0].onpaste = function(e)
        {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            const selection = window.getSelection();
            if (!selection.rangeCount) return false;
            selection.deleteFromDocument();
            selection.getRangeAt(0).insertNode(document.createTextNode(text));
        }
    }

    public GetMenuLabel(): string
    {
        return this._locale.MenuLabel;
    }

    public GetMenuIconClasses(): string
    {
        return 'fas fa-font';
    }

    public AllowInTableCell(): boolean
    {
        return true;
    }

    public Clean(elem: JQuery<HTMLElement>)
    {
        elem.removeClass('rce-textarea-editor');
        if (elem.attr('class') === '')
            elem.removeAttr('class');
        elem.removeAttr('contenteditable');

        super.Clean(elem);
    }

    public GetContextButtonText(_elem: JQuery<HTMLElement>): string
    {
        return 'A';
    }

    public GetContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[]
    {
        const boldCommand = new ContextCommand(this._locale.Bold, 'fas fa-bold', function (elem)
        {
            elem.find('.rce-textarea-editor').focus();
            document.execCommand('bold', false, null);
        });

        const italicCommand = new ContextCommand(this._locale.Italic, 'fas fa-italic', function (elem)
        {
            elem.find('.rce-textarea-editor').focus();
            document.execCommand('italic', false, null);
        });

        const ulCommand = new ContextCommand(this._locale.UnorderedList, 'fas fa-list-ul', function (elem)
        {
            elem.find('.rce-textarea-editor').focus();
            document.execCommand('insertUnorderedList', false, null);
            // Fix for materialize
            elem.find('ul').addClass('browser-default');
        });

        const olCommand = new ContextCommand(this._locale.OrderedList, 'fas fa-list-ol', function (elem)
        {
            elem.find('.rce-textarea-editor').focus();
            document.execCommand('insertOrderedList', false, null);
        });

        return [boldCommand, italicCommand, ulCommand, olCommand];
    }
}

RichContentBaseEditor.RegisterEditor(RichContentTextEditor);