class RichContentLinkEditor extends RichContentBaseEditor
{
    private _appendElement: JQuery<HTMLElement>;
    private static _localeRegistrations?: Dictionary<typeof RichContentLinkEditorLocale> = {};
    private _locale?: RichContentLinkEditorLocale;

    public static RegisterLocale?<T extends typeof RichContentLinkEditorLocale>(localeType: T, language: string)
    {
        this._localeRegistrations[language] = localeType;
    }

    public Init(richContentEditor: RichContentEditor)
    {
        super.Init(richContentEditor);

        this._locale = new RichContentLinkEditor._localeRegistrations[richContentEditor.Options.Language]();
    }

    public Insert(targetElement?: JQuery<HTMLElement>)
    {
        super.Insert(targetElement);

        if (!targetElement)
        {
            targetElement = $('.rce-grid', this.RichContentEditorInstance.GridSelector);
        }

        this._appendElement = targetElement;

        this.showSelectionDialog(null);
    }

    private showSelectionDialog(elem?: JQuery<HTMLElement>)
    {
        const _this = this;

        let url: string = null;
        let lightBox = false;
        let targetBlank = false;
        let update = elem !== null;

        if (elem)
        {
            url = elem.attr(lightBox ? 'data-featherlight' : 'href');
            lightBox = elem.is('[data-featherlight]');
            targetBlank = elem.is('[target="_blank"]');
        }

        this.RichContentEditorInstance.FileManager.ShowFileSelectionDialog(url, lightBox, targetBlank, false,
            (url, lightBox, targetBlank) =>
            {
                _this.OnChange();
                if (update)
                {
                    this.updateLink(elem, url, lightBox, targetBlank);
                }
                else 
                {
                    this.InsertLink(url, lightBox, targetBlank, this._appendElement);
                }
                return true;
            }
        );
    }

    public InsertLink(url: string, lightBox: boolean, targetBlank: boolean, targetElement?: JQuery<HTMLElement>)
    {
        const link = $('<a class="rce-link rce-element-editor" onclick="return false;"></a>');

        this.updateLink(link, url, lightBox, targetBlank)

        if (!targetElement)
        {
            targetElement = $(`#${this.RichContentEditorInstance.EditorId} .rce-grid`);
        }

        this.Attach(link, targetElement);
    }

    private updateLink(link: JQuery<HTMLElement>, url: string, lightBox: boolean, targetBlank: boolean)
    {
        if (lightBox && RichContentUtils.HasFeatherLight())
        {
            if (RichContentUtils.IsVideoUrl(url))
            {
                const mimeType = RichContentUtils.GetMimeType(url)
                link.attr('data-featherlight', `<video class="video-js js-video" preload="auto" controls="" autoplay="autoplay"><source src="${url}" type="${mimeType}"></video>`);
            }
            else
            {
                link.attr('data-featherlight', url);
            }
            link.attr('href', 'javascript:');
        }
        else
        {
            link.attr('href', url);
            link.removeAttr('data-featherlight');
        }
        if (targetBlank)
        {
            link.attr('target', '_blank');
        }
        else
        {
            link.removeAttr('target');
        }
    }

    public GetDetectionSelectors(): string
    {
        return 'a';
    }

    public Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>, touchedElements: HTMLElement[]): JQuery<HTMLElement>
    {
        if (source.is('a'))
        {
            let clone = source.clone();
            clone.empty();
            clone.addClass('rce-link');
            clone.attr('onclick', 'return false;');

            this.RichContentEditorInstance.ImportChildren(clone, source, false, true, touchedElements);

            source.replaceWith(clone);

            this.Attach(clone, targetElement);

            if ((window as any).Sortable)
            {
                (window as any).Sortable.create(clone[0], {
                    group: 'link-content',
                    draggable: '> .rce-element-editor'
                });
            }

            return clone;
        }

        return null;
    }

    public GetMenuLabel(): string
    {
        return this._locale.MenuLabel;
    }

    public GetMenuIconClasses(): string
    {
        return 'fas fa-external-link-square-alt';
    }

    public AllowInTableCell(): boolean
    {
        return true;
    }

    public Clean(elem: JQuery<HTMLElement>): void
    {
        const _this = this;

        elem.removeAttr('onclick');
        elem.removeClass('rce-link');
        if (elem.attr('class') === '')
            elem.removeAttr('class');
        elem.removeAttr('draggable');

        elem.children().each(function ()
        {
            _this.Clean($(this));
        });

        super.Clean(elem);
    }

    public GetContextButtonText(_elem: JQuery<HTMLElement>): string
    {
        return 'lnk';
    }

    public UseWrapper(): boolean
    {
        return false;
    }

    public GetContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[]
    {
        const _this = this;

        var result: ContextCommand[] = [];
        var editors = this.RichContentEditorInstance.RegisteredEditors;

        for (let key in editors)
        {
            const editor = editors[key];
            if (editor.AllowInLink())
            {
                var insertCommand = new ContextCommand(editor.GetMenuLabel(), editor.GetMenuIconClasses(), function (elem)
                {
                    editor.Insert(elem);
                    _this.OnChange();
                    if ((window as any).Sortable)
                    {
                        (window as any).Sortable.create(elem[0], {
                            group: 'link-content',
                            draggable: '> .rce-element-editor'
                        });
                    }
                });
                result.push(insertCommand);
            }
        }

        var editCommand = new ContextCommand(this._locale.EditMenuLabel, 'fas fa-cog', function (elem)
        {
            _this.showSelectionDialog(elem);
        });
        result.push(editCommand);

        return result;
    }
}

RichContentBaseEditor.RegisterEditor('RichContentLinkEditor', RichContentLinkEditor);