type CustomTagInsertedCallBack = (editor: RichContentEditor, tag: JQuery<HTMLElement>) => void;

interface RichContentTextCustomTag
{
    Name: string;
    Icon: string;
    Html: string;
    OnInsert: CustomTagInsertedCallBack;
}

class RichContentTextEditor extends RichContentBaseEditor
{
    private static _localeRegistrations?: Dictionary<typeof RichContentTextEditorLocale> = {};
    private _locale?: RichContentTextEditorLocale;
    private _customTags: RichContentTextCustomTag[] = [];
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

    public RegisterCustomTag(name: string, icon: string, html: string, onInsert?: CustomTagInsertedCallBack)
    {
        const customTag: RichContentTextCustomTag = {
            Name: name,
            Icon: icon,
            Html: html,
            OnInsert: onInsert
        };

        this._customTags.push(customTag);
    }

    public GetActualElement(elem: JQuery<HTMLElement>): JQuery<HTMLElement>
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

    public Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>, touchedElements: HTMLElement[]): JQuery<HTMLElement>
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

            return textAreaWrapper;
        }

        return null;
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
        elem.removeClass('rce-textarea-editor');
        if (elem.attr('class') === '')
            elem.removeAttr('class');
        elem.removeAttr('contenteditable');
        elem.addClass('text');

        super.Clean(elem);
    }

    public Clicked(elem: JQuery<HTMLElement>): void
    {
        this.GetActualElement(elem)[0].focus();
    }

    public GetContextButtonText(_elem: JQuery<HTMLElement>): string
    {
        return 'A';
    }

    public GetContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[]
    {
        const _this = this;
        const editor = this.RichContentEditorInstance;

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

        const linkCommand = new ContextCommand(this._locale.Link, 'fas fa-link', function (elem)
        {
            elem.find('.rce-textarea-editor').focus();
            const selection = (window as any).rangy.getSelection();
            let value = selection.toString();
            if (RichContentUtils.IsNullOrEmpty(value))
            {
                value = _this._locale.NewLinkText;
            }
            let url;
            let lightBox = false;
            let targetBlank = false;
            let a: JQuery<HTMLAnchorElement>;

            if (selection.rangeCount > 0)
            {
                const range = selection.getRangeAt(0);
                if (range.startContainer.nodeType === 1 && range.startContainer.tagName === 'A')
                {
                    a = $(range.startContainer);
                }
                else
                {
                    const parentElement = range.startContainer.parentElement;
                    if (parentElement.tagName === 'A')
                    {
                        a = $(parentElement);
                    }
                    else
                    {
                        a = $(parentElement).closest(a);
                    }
                }

                if (a.length)
                {
                    url = a.attr('href');
                    value = a.text();
                    const lightBoxAttr = a.attr('data-featherlight');
                    lightBox = !RichContentUtils.IsNullOrEmpty(lightBoxAttr);
                    if (lightBox)
                    {
                        url = lightBoxAttr;
                    }
                    targetBlank = a.attr('target') === '_blank';
                }
            }

            editor.FileManager.ShowFileSelectionDialog(url, lightBox, targetBlank, false,
                (url, lightBox, targetBlank) =>
                {
                    _this.OnChange();
                    var link = $(`<a href="${url}" onclick="return false;">${value}</a>`);
                    if (lightBox)
                    {
                        link.attr('data-featherlight', url);
                        link.attr('href', 'javascript:');
                    }
                    if (targetBlank)
                    {
                        link.attr('target', '_blank');
                    }
                    if (a.length)
                    {
                        a.replaceWith(link);
                    }
                    else
                    {
                        selection.deleteFromDocument();
                        selection.getRangeAt(0).insertNode(link[0]);
                    }
                    selection.selectAllChildren(link[0]);
                    return true;
                }
            );
        });

        let commands = [boldCommand, italicCommand, ulCommand, olCommand, linkCommand];

        for (var i = 0; i < this._customTags.length; i++)
        {
            const customTag = this._customTags[i];
            const command = new ContextCommand(customTag.Name, 'fas fa-' + customTag.Icon, function (elem)
            {
                elem.find('.rce-textarea-editor').focus();
                const htmlToInsert = `<span class="temp-inserted-tag">${customTag.Html}</span>`;
                _this.insertHTML(htmlToInsert);
                //document.execCommand('insertHTML', false, htmlToInsert);
                const tempTag = elem.find('.temp-inserted-tag');
                const contents = tempTag.contents() as JQuery<HTMLElement>;
                tempTag.replaceWith(contents);
                if (customTag.OnInsert)
                {
                    customTag.OnInsert(_this.RichContentEditorInstance, contents);
                }
            });
            commands.push(command);
        }

        return commands;
    }

    private insertHTML(html: string): void
    {
        var sel, range;
        if (window.getSelection && (sel = window.getSelection()).rangeCount)
        {
            range = sel.getRangeAt(0);
            range.collapse(true);
            var elem = $(html);
            range.insertNode(elem[0]);

            // Move the caret immediately after the inserted span
            range.setStartAfter(elem[0]);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    public GetToolbarCommands(elem: JQuery<HTMLElement>): ContextCommand[]
    {
        return this.GetContextCommands(elem);
    }
}

RichContentBaseEditor.RegisterEditor('RichContentTextEditor', RichContentTextEditor);