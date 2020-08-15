class RichContentIFrameEditor extends RichContentBaseEditor
{
    private _appendElement: JQuery<HTMLElement>;
    private static _localeRegistrations?: Dictionary<typeof RichContentIFrameEditorLocale> = {};
    private _locale?: RichContentIFrameEditorLocale;

    public static RegisterLocale?<T extends typeof RichContentIFrameEditorLocale>(localeType: T, language: string)
    {
        RichContentIFrameEditor._localeRegistrations[language] = localeType;
    }

    public Init(richContentEditor: RichContentEditor)
    {
        super.Init(richContentEditor);

        this._locale = new RichContentIFrameEditor._localeRegistrations[richContentEditor.Options.Language]();
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
        let height: number = null;
        let update = elem !== null;

        if (elem)
        {
            const coreElement = elem.find('.rce-iframe'); 
            url = this.getUrl(coreElement);
            const heightString = coreElement.css('height').replace('px', '');
            if (heightString)
            {
                height = parseInt(heightString);
            }
        } 

        let dialog = _this.getEditDialog();
        $('.iframe-url', dialog).val(url);
        $('.iframe-height', dialog).val(height);

        this.RichContentEditorInstance.DialogManager.ShowDialog(dialog, (dialog) =>
        {
            const gridSelector = _this.RichContentEditorInstance.GridSelector;
            let valid = _this.RichContentEditorInstance.DialogManager.ValidateFields(gridSelector, $('input', dialog));
            if (!valid) return false;

            const url = $('.rce-dialog-content .iframe-url', dialog).val() as string;
            const height = parseInt($('.rce-dialog-content .iframe-height', dialog).val() as string);

            _this.OnChange();
            if (update)
            {
                this.updateElement(elem, url, height);
            }
            else 
            {
                this.InsertElement(url, height, this._appendElement);
            }
            return true;
        });
    }

    private getEditDialog()
    {
        let dialog = $('#' + this.RichContentEditorInstance.EditorId + ' .fa-iframe-edit-dialog');
        if (!dialog.length)
        {
            dialog = $(this.getEditDialogHtml(this.RichContentEditorInstance.EditorId));
            dialog.appendTo($('#' + this.RichContentEditorInstance.EditorId));
        }
        return dialog;
    }

    private getEditDialogHtml(id: string): string
    {
        return `
            <div class="rce-dialog fa-iframe-edit-dialog">
                <div class="rce-dialog-content">
                    <div class="rce-dialog-title">${this._locale.EditMenuLabel}</div>
                    <div class="rce-form-field">
                        <label for="${id}_Height" class="rce-label">${this._locale.HeightLabel}</label>
                        <input id="${id}_Height" class="validate rce-input iframe-height browser-default" type="number" required="required" max="1000" />
                        <span class="rce-error-text">${this._locale.HeightValidation}</span>
                    </div>
                    <div class="rce-form-field">
                        <label for="${id}_IFrameUrl" class="rce-label">${this._locale.UrlLabel}</label>
                        <input id="${id}_IFrameUrl" class="iframe-url validate rce-input" type="text" required="required" />
                        <span class="rce-error-text">${this._locale.EnterUrlValidation}</span>
                    </div>
                    <div class="rce-clear"></div>
                </div>
                <div class="rce-dialog-footer">
                    <a href="javascript:" class="rce-button rce-button-flat rce-close-dialog">${this.RichContentEditorInstance.DialogManager.Locale.DialogCancelButton}</a>
                    <a href="javascript:" class="rce-button rce-submit-dialog">${this.RichContentEditorInstance.DialogManager.Locale.DialogSaveButton}</a>
                </div>
            </div>`;
    }

    private getUrl(coreElement: JQuery<HTMLElement>): string
    {
        return $(coreElement).attr('src');
    }

    public InsertElement(url: string, height: number, targetElement?: JQuery<HTMLElement>)
    {
        const wrapper = $('<div class="rce-iframe-wrapper"><iframe class="rce-iframe"></iframe></div>');

        this.updateElement(wrapper, url, height);

        if (!targetElement)
        {
            targetElement = $(`#${this.RichContentEditorInstance.EditorId} .rce-grid`);
        }

        this.Attach(wrapper, targetElement);
    }

    private updateElement(elem: JQuery<HTMLElement>, url: string, height: number)
    {
        const coreElement = elem.find('.rce-iframe');
        coreElement.attr('src', url);
        coreElement.css('height', height + 'px');
    }

    public GetDetectionSelectors(): string
    {
        return 'iframe';
    }

    public Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>)
    {
        if (source.is('iframe'))
        {
            let clone = source.clone();
            clone.addClass('rce-iframe');
            const wrapper = $('<div class="rce-iframe-wrapper"></div>');
            wrapper.append(clone);
            source.replaceWith(wrapper);

            this.Attach(wrapper, targetElement);
        }
    }

    public GetMenuLabel(): string
    {
        return this._locale.MenuLabel;
    }

    public GetMenuIconClasses(): string
    {
        return 'far fa-square';
    }

    public AllowInTableCell(): boolean
    {
        return false;
    }

    public AllowInLink(): boolean
    {
        return false;
    }

    public Clean(elem: JQuery<HTMLElement>): void
    {
        var wrapper = elem.closest('.rce-iframe-wrapper'); 
        var coreElement = wrapper.find('.rce-iframe');
        coreElement.removeClass('rce-iframe');
        elem.removeAttr('draggable');

        super.Clean(elem);
    }

    public GetContextButtonText(_elem: JQuery<HTMLElement>): string
    {
        return 'ifr';
    }

    public GetContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[]
    {
        const _this = this;

        var editCommand = new ContextCommand(this._locale.EditMenuLabel, 'fas fa-cog', function (elem)
        {
            _this.showSelectionDialog(elem);
        });

        return [editCommand];
    }
}

RichContentBaseEditor.RegisterEditor('RichContentIFrameEditor', RichContentIFrameEditor);