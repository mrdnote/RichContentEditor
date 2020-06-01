enum LinkAlignment
{
    None, Fill, Left, Right
}

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
            url = $('.rce-link', elem).attr(lightBox ? 'data-featherlight' : 'href');
            lightBox = $('a[data-featherlight]', elem).length > 0;
            targetBlank = $('a[target="_blank"]', elem).length > 0;
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
                    this.InsertLink(url, lightBox, targetBlank, LinkAlignment.None, this._appendElement);
                }
                return true;
            }
        );
    }

    public InsertLink(url: string, lightBox: boolean, targetBlank: boolean, alignment: LinkAlignment, targetElement?: JQuery<HTMLElement>)
    {
        const linkWrapper = $('<div class="rce-link-wrapper"></div>');
        const link = $('<a class="rce-link" onclick="return false;"></a>');
        linkWrapper.append(link);

        this.updateLink(linkWrapper, url, lightBox, targetBlank)
        linkWrapper.addClass(this.getAlignmentClass(alignment));

        if (!targetElement)
        {
            targetElement = $(`#${this.RichContentEditorInstance.EditorId} .rce-grid`);
        }

        this.Attach(linkWrapper, targetElement);
    }

    private updateLink(elem: JQuery<HTMLElement>, url: string, lightBox: boolean, targetBlank: boolean)
    {
        const link = elem.find('.rce-link');
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
        this.removeEditorAlignmentClasses(elem);
    }

    private getAlignmentClass(alignment: LinkAlignment): string 
    {
        switch (alignment)
        {
            case LinkAlignment.Left: return 'rce-left';
            case LinkAlignment.Right: return 'rce-right';
            case LinkAlignment.Fill: return 'rce-fill';
            case LinkAlignment.None: return '';
            default: throw `Unexpected alignment value: ${alignment}`;
        }
    }

    private getAlignment(elem: JQuery<HTMLElement>): LinkAlignment
    {
        if (elem.hasClass('rce-left')) return LinkAlignment.Left;
        if (elem.hasClass('rce-fill')) return LinkAlignment.Fill;
        if (elem.hasClass('rce-right')) return LinkAlignment.Right;
        return LinkAlignment.None;
    }

    public GetDetectionSelectors(): string
    {
        return 'a';
    }

    protected getActualElement(elem: JQuery<HTMLElement>): JQuery<HTMLElement>
    {
        if (elem.is('.rce-link-wrapper'))
        {
            return elem.find('a.rce-link');
        }

        return elem;
    }

    public Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>)
    {
        if (source.is('a'))
        {
            let clone = source.clone();
            clone.empty();
            const linkWrapper = $('<div class="rce-link-wrapper"></div>');
            linkWrapper.append(clone);
            const link = linkWrapper.find('a');
            link.addClass('rce-link');
            link.attr('onclick', 'return false;');

            this.RichContentEditorInstance.ImportChildren(link, source, false, true);

            let alignment = LinkAlignment.None;
            if (link.hasClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass()))
            {
                alignment = LinkAlignment.Left;
                link.removeClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass());
            }
            else if (link.hasClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass()))
            {
                alignment = LinkAlignment.Right;
                link.removeClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass());
            }
            else if (link.hasClass(this.RichContentEditorInstance.GridFramework.GetBlockAlignClass()))
            {
                alignment = LinkAlignment.Fill;
                link.removeClass(this.RichContentEditorInstance.GridFramework.GetBlockAlignClass());
            }
            else if (this.hasCss(link, this.RichContentEditorInstance.GridFramework.GetBlockAlignCss()))
            {
                alignment = LinkAlignment.Fill;
                link.css(this.RichContentEditorInstance.GridFramework.GetBlockAlignCss().Key, '');
            }
            if (alignment !== LinkAlignment.None)
            {
                linkWrapper.addClass(this.getAlignmentClass(alignment));
            }
            source.replaceWith(linkWrapper);

            this.Attach(linkWrapper, targetElement);
        }
    }

    private hasCss(elem: JQuery<HTMLElement>, css: KeyValue<string>): boolean
    {
        if (css === null)
        {
            return false;
        }

        if (elem.css(css.Key) === css.Value)
            return true;

        return false;
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
        elem.removeAttr('onclick');
        var wrapper = elem.closest('.rce-link-wrapper');
        if (wrapper.hasClass('rce-left'))
        {
            elem.addClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass());
            const css = this.RichContentEditorInstance.GridFramework.GetLeftAlignCss();
            if (css != null) elem.css(css.Key, css.Value);
        }
        if (wrapper.hasClass('rce-right'))
        {
            elem.addClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass());
            const css = this.RichContentEditorInstance.GridFramework.GetRightAlignCss();
            if (css != null) elem.css(css.Key, css.Value);
        }
        if (wrapper.hasClass('rce-fill'))
        {
            elem.addClass(this.RichContentEditorInstance.GridFramework.GetBlockAlignClass());
            const css = this.RichContentEditorInstance.GridFramework.GetBlockAlignCss();
            if (css != null) elem.css(css.Key, css.Value);
        }

        elem.removeClass('rce-link');
        if (elem.attr('class') === '')
            elem.removeAttr('class');
        elem.removeAttr('draggable');

        super.Clean(elem);
    }

    public GetContextButtonText(_elem: JQuery<HTMLElement>): string
    {
        return 'lnk';
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
                    let inner = elem.find('a.rce-link');
                    editor.Insert(inner);
                    _this.OnChange();
                    if ((window as any).Sortable)
                    {
                        (window as any).Sortable.create(inner[0], {
                            group: 'col',
                            draggable: '.rce-editor-wrapper'
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

    private removeEditorAlignmentClasses(elem: JQuery<HTMLElement>)
    {
        elem.removeClass('rce-left rce-fill rce-right');
    }
}

RichContentBaseEditor.RegisterEditor('RichContentLinkEditor', RichContentLinkEditor);