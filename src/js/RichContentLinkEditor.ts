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

        this.showEditorDialog(null);
    }

    private showEditorDialog(linkWrapper?: JQuery<HTMLElement>)
    {
        const _this = this;

        let update = linkWrapper !== null;
        const gridSelector = this.RichContentEditorInstance.GridSelector;

        const dialog = this.getLinkEditorDialog(linkWrapper);

        this.RichContentEditorInstance.DialogManager.ShowDialog(dialog,
            (dialog) =>
            {
                const valid = this.RichContentEditorInstance.DialogManager.ValidateFields(gridSelector, $('input', dialog));
                if (!valid) return;

                const url = $('#' + this.RichContentEditorInstance.EditorId + '_LinkEditor_Url', dialog).val() as string;
                const lightBox = $('#' + this.RichContentEditorInstance.EditorId + '_LinkEditor_LightBox', dialog).is(':checked');
                let alignment = LinkAlignment.None;
                if ($('#' + this.RichContentEditorInstance.EditorId + '_LinkEditor_AlignLeft', dialog).is(':checked')) alignment = LinkAlignment.Left;
                else if ($('#' + this.RichContentEditorInstance.EditorId + '_LinkEditor_AlignFill', dialog).is(':checked')) alignment = LinkAlignment.Fill;
                else if ($('#' + this.RichContentEditorInstance.EditorId + '_LinkEditor_AlignRight', dialog).is(':checked')) alignment = LinkAlignment.Right;

                _this.OnChange();
                if (update)
                {
                    this.updateLink(linkWrapper, url, lightBox, alignment);
                }
                else 
                {
                    this.InsertLink(url, lightBox, alignment, this._appendElement);
                }
                return true;
            }
        );
    }

    private getLinkEditorDialog(linkWrapper?: JQuery<HTMLElement>)
    {
        let dialog = $('#' + this.RichContentEditorInstance.EditorId + ' .link-editor-dialog');
        if (!dialog.length)
        {
            dialog = $(this.getLinkEditorDialogHtml(this.RichContentEditorInstance.EditorId));
            if (RichContentUtils.HasFeatherLight())
            {
                $('.featherlight-input-group', dialog).removeClass('hide');
            }
            dialog.appendTo($('#' + this.RichContentEditorInstance.EditorId));
        }

        let href: string = '';
        let alignment = LinkAlignment.Left;
        let lightbox = false;

        if (linkWrapper !== null)
        {
            const link = $('a.rce-link', linkWrapper);
            href = link.attr('href');
            alignment = this.getImageAlignment(linkWrapper);
            lightbox = !RichContentUtils.IsNullOrEmpty(link.attr('data-featherlight')); 
            if (lightbox)
            {
                href = link.attr('data-featherlight');
            }
        }

        $('#' + this.RichContentEditorInstance.EditorId + '_LinkEditor_Url', dialog).val(href);
        switch (alignment)
        {
            case LinkAlignment.None:
                $('#' + this.RichContentEditorInstance.EditorId + '_LinkEditor_AlignNone', dialog).prop('checked', true);
                break;
            case LinkAlignment.Left:
                $('#' + this.RichContentEditorInstance.EditorId + '_LinkEditor_AlignLeft', dialog).prop('checked', true);
                break;
            case LinkAlignment.Fill:
                $('#' + this.RichContentEditorInstance.EditorId + '_LinkEditor_AlignFill', dialog).prop('checked', true);
                break;
            case LinkAlignment.Right:
                $('#' + this.RichContentEditorInstance.EditorId + '_LinkEditor_AlignRight', dialog).prop('checked', true);
                break;
            default:
        }
        $('#' + this.RichContentEditorInstance.EditorId + '_LinkEditor_LightBox', dialog).prop('checked', lightbox);

        return dialog;
    }

    private getLinkEditorDialogHtml(id: string): any
    {
        return `
            <div class="rce-dialog link-editor-dialog">
                <div class="rce-dialog-content">
                    <div class="rce-dialog-title">${this._locale.EditorDialogTitle}</div>
                    <div class="rce-form-field rce-form-field-inline">
                        <label for="${id}_LinkEditor_Url" class="rce-label">${this._locale.UrlLabel}</label>
                        <input id="${id}_LinkEditor_Url" class="validate rce-input browser-default" required="required" />
                        <span class="rce-error-text">${this.RichContentEditorInstance.Locale.FieldRequiredLabel}</span>
                    </div>
                    <div class="rce-form-field rce-form-field-inline hide featherlight-input-group">
                        <label class="rce-label">&nbsp;</label>
                        <label class="rce-radio">
                            <input id="${id}_LinkEditor_LightBox" class="lightbox-check" type="checkbox"/>
                            <span>Featherlight</span>
                        </label>
                    </div>
                    <div class="rce-form-field rce-form-field-inline">
                        <label class="rce-label">${this._locale.AlignmentLabel}</label>
                        <div class="rce-input-group">
                            <label class="rce-radio">
                                <input  id="${id}_LinkEditor_AlignNone" name="${id}_Align" type="radio" required="required" />
                                <span>${this._locale.AlignNoneLabel}</span>
                            </label><br/>
                            <label class="rce-radio">
                                <input  id="${id}_LinkEditor_AlignLeft" name="${id}_Align" type="radio" required="required" />
                                <span>${this._locale.AlignLeftLabel}</span>
                            </label><br/>
                            <label class="rce-radio">
                                <input  id="${id}_LinkEditor_AlignFill" name="${id}_Align" type="radio" required="required" />
                                <span>${this._locale.AlignFillLabel}</span>
                            </label><br/>
                            <label class="rce-radio">
                                <input  id="${id}_LinkEditor_AlignRight" name="${id}_Align" type="radio" required="required" />
                                <span>${this._locale.AlignRightLabel}</span>
                            </label>
                        </div>
                        <div class="rce-clear"></div>
                        <span class="rce-error-text">${this.RichContentEditorInstance.Locale.FieldRequiredLabel}</span>
                    </div>
                </div>
                <div class="rce-dialog-footer">
                    <a href="javascript:" class="rce-button rce-button-flat rce-close-dialog">${this.RichContentEditorInstance.DialogManager.Locale.DialogCancelButton}</a>
                    <a href="javascript:" class="rce-button rce-submit-dialog">${this.RichContentEditorInstance.DialogManager.Locale.DialogSaveButton}</a>
                </div>
            </div>`;
    }

    public InsertLink(url: string, lightBox: boolean, alignment: LinkAlignment, targetElement?: JQuery<HTMLElement>)
    {
        const linkWrapper = $('<div class="rce-link-wrapper"></div>');
        const link = $('<a class="rce-link" onclick="return false;"></a>');
        linkWrapper.append(link);

        this.updateLink(linkWrapper, url, lightBox, alignment);

        if (!targetElement)
        {
            targetElement = $(`#${this.RichContentEditorInstance.EditorId} .rce-grid`);
        }

        this.Attach(linkWrapper, targetElement);
    }

    private updateLink(elem: JQuery<HTMLElement>, url: string, lightBox: boolean, alignment: LinkAlignment)
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
        this.removeEditorAlignmentClasses(elem);
        elem.addClass(this.getImageAlignmentClass(alignment));
    }

    private getImageAlignmentClass(alignment: LinkAlignment): string 
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

    private getImageAlignment(elem: JQuery<HTMLElement>): LinkAlignment
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
                linkWrapper.addClass(this.getImageAlignmentClass(alignment));
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
        var gridSelector = this.RichContentEditorInstance.GridSelector;
        var editorId = this.RichContentEditorInstance.EditorId;

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
            _this.showEditorDialog(elem);
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