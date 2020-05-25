class RichContentTextEditor extends RichContentBaseEditor
{
    private static _localeRegistrations?: Dictionary<typeof RichContentTextEditorLocale> = {};
    private _locale?: RichContentTextEditorLocale;
    private _selectionChangedBound = false;

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

        const inline = targetElement.is('a');
        const tag = inline ? 'span' : 'div';

        const textArea = $(`<${tag} class="rce-textarea-editor" contenteditable="true">${html}</${tag}>`);

        if (textArea.find('script,table,img,form').length)
        {
            throw 'It is not allowed to insert content containing the following tags: script, table, img, form';
        }

        const textAreaWrapper = $(`<${tag} class="rce-textarea-wrapper"></${tag}>`);
        textAreaWrapper.append(textArea);

        if (!targetElement)
        {
            targetElement = $(`#${this.RichContentEditorInstance.EditorId} .rce-grid`);
        }

        this.Attach(textAreaWrapper, targetElement);

        textAreaWrapper.find('.rce-textarea-editor').focus();

        this.setupEvents(textArea);
    }

    protected getActualElement(elem: JQuery<HTMLElement>): JQuery<HTMLElement>
    {
        if (elem.hasClass('rce-textarea-wrapper'))
        {
            return elem.find('.rce-textarea-editor');
        }

        return elem;
    }

    private setupEvents(textArea: JQuery<HTMLElement>)
    {
        const _this = this;

        textArea[0].onpaste = function (e)
        {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            const selection = window.getSelection();
            if (!selection.rangeCount) return false;
            selection.deleteFromDocument();
            selection.getRangeAt(0).insertNode(document.createTextNode(text));
        }

        textArea.focusin(function (e)
        {
            if (textArea.data('selection'))
            {
                var sel = (window as any).rangy.getSelection();
                sel.removeAllRanges();
                sel.addRange(textArea.data('selection'));
                textArea.data('selection', null);
            }
        });

        textArea.on('input', function (e)
        {
            _this.OnChange();
        });

        if (!this._selectionChangedBound)
        {
            document.addEventListener('selectionchange', function ()
            {
                if ($(document.activeElement).hasClass('rce-textarea-editor'))
                {
                    $(document.activeElement).data('selection', (window as any).rangy.getSelection().getRangeAt(0));
                }
            });
            this._selectionChangedBound = true;
        }
    }

    public GetDetectionSelectors(): string
    {
        return '.text';
    }

    public Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>)
    {
        if (source.hasClass('text')) 
        {
            let clone = source.clone();
            const inline = targetElement.is('a');
            const tag = inline ? 'span' : 'div';
            let textArea: JQuery<HTMLElement> = null;
            if (clone.is(tag))
            {
                textArea = clone;
                textArea.attr('contenteditable', 'true');
                textArea.addClass('rce-textarea-editor');
            }
            else
            {
                textArea = $(`<${tag} class="rce-textarea-editor" contenteditable="true">${clone.html()}</${tag}>`);
            }

            const textAreaWrapper = $(`<${tag} class="rce-textarea-wrapper"></${tag}>`);
            textAreaWrapper.append(textArea);
            source.replaceWith(textAreaWrapper.append(clone));

            this.Attach(textAreaWrapper, targetElement);

            this.setupEvents(textArea);
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

    public AllowInLink(): boolean
    {
        return true;
    }

    public Clean(elem: JQuery<HTMLElement>)
    {
        if (elem.hasClass('rce-textarea-editor'))
        {
            elem.removeClass('rce-textarea-editor');
            if (elem.attr('class') === '')
                elem.removeAttr('class');
            elem.removeAttr('contenteditable');
            elem.addClass('text');
        }

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

    public GetToolbarCommands(elem: JQuery<HTMLElement>): ContextCommand[]
    {
        return this.GetContextCommands(elem);
    }
}

RichContentBaseEditor.RegisterEditor('RichContentTextEditor', RichContentTextEditor);