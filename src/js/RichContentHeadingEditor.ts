class RichContentHeadingEditor extends RichContentBaseEditor
{
    private static _localeRegistrations?: Dictionary<typeof RichContentHeadingEditorLocale> = {};
    private _locale?: RichContentHeadingEditorLocale;
    private _selectionChangedBound = false;

    public static RegisterLocale?<T extends typeof RichContentHeadingEditorLocale>(localeType: T, language: string)
    {
        this._localeRegistrations[language] = localeType;
    }

    public Init(richContentEditor: RichContentEditor): void
    {
        super.Init(richContentEditor);

        this._locale = new RichContentHeadingEditor._localeRegistrations[richContentEditor.Options.Language]();
    }

    public Insert(targetElement?: JQuery<HTMLElement>)
    {
        this.InsertContent(null, targetElement);
    }

    public InsertContent(html?: string, targetElement?: JQuery<HTMLElement>)
    {
        super.Insert(targetElement);

        if (!html) html = '';

        const textArea = $(`<h1 class="rce-heading-editor" contenteditable="true">${html}</h1>`);

        if (textArea.find('script,table,img,form').length)
        {
            throw 'It is not allowed to insert content containing the following tags: script, table, img, form';
        }

        const textAreaWrapper = $('<div class="rce-heading-wrapper"></div>');
        textAreaWrapper.append(textArea);

        if (!targetElement)
        {
            targetElement = $(`#${this.RichContentEditorInstance.EditorId} .rce-grid`);
        }

        this.Attach(textAreaWrapper, targetElement);

        textAreaWrapper.find('.rce-heading-editor').focus();

        this.setupEvents(textArea);
    }

    private setupEvents(textArea: JQuery<HTMLElement>)
    {
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

        if (!this._selectionChangedBound)
        {
            document.addEventListener('selectionchange', function ()
            {
                if ($(document.activeElement).hasClass('rce-heading-editor'))
                {
                    $(document.activeElement).data('selection', (window as any).rangy.getSelection().getRangeAt(0));
                }
            });
            this._selectionChangedBound = true;
        }
    }

    public GetDetectionSelectors(): string
    {
        return 'h1,h2,h3,h4,h5,h6';
    }

    public Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>)
    {
        if (source.is('h1,h2,h3,h4,h5,h6'))
        {
            let clone = source.clone();
            clone.attr('contenteditable', 'true');
            clone.addClass('rce-heading-editor');

            const headingWrapper = $('<div class="rce-heading-wrapper"></div>');
            headingWrapper.append(clone);
            source.replaceWith(headingWrapper.append(clone));

            this.Attach(headingWrapper, targetElement);

            this.setupEvents(clone);
        }
    }

    public GetMenuLabel(): string
    {
        return this._locale.MenuLabel;
    }

    public GetMenuIconClasses(): string
    {
        return 'fas fa-heading';
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
        elem.removeClass('rce-heading-editor');
        if (elem.attr('class') === '')
            elem.removeAttr('class');
        elem.removeAttr('contenteditable');

        super.Clean(elem);
    }

    public GetContextButtonText(_elem: JQuery<HTMLElement>): string
    {
        return 'H';
    }

    public GetContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[]
    {
        const _this = this;
        var gridSelector = this.RichContentEditorInstance.GridSelector;

        const sizeCommand = new ContextCommand(this._locale.Size, 'fas fa-text-height', function (elem)
        {
            let dialog = _this.getSizeDialog();
            const currentSize = parseInt(elem.find('h1,h2,h3,h4,h5,h6')[0].tagName.substring(1, 2));
            $('input.rce-size-input', dialog).val(currentSize);
            _this.RichContentEditorInstance.GridFramework.UpdateFields();
            dialog.data('elem', elem);

            _this.RichContentEditorInstance.DialogManager.ShowDialog(dialog, (dialog) =>
            {
                let valid = _this.RichContentEditorInstance.DialogManager.ValidateFields(gridSelector, $('input', dialog));
                if (!valid) return;

                const newSize = $('input.rce-size-input', dialog).val();
                const oldHeading = elem.find('h1,h2,h3,h4,h5,h6').first();
                const newHeading = $(`<h${newSize} contenteditable="true" class="rce-heading-editor">${oldHeading[0].innerHTML}</h${newSize}>`);
                oldHeading.first().replaceWith(newHeading);

                _this.RichContentEditorInstance.DialogManager.CloseDialog($(gridSelector + ' .column-width-dialog'));
                return true;
            });
        });

        return [sizeCommand];
    }

    private getSizeDialog()
    {
        let dialog = $('#' + this.RichContentEditorInstance.EditorId + ' .heading-size-dialog');
        if (!dialog.length)
        {
            dialog = $(this.getSizeDialogHtml(this.RichContentEditorInstance.EditorId));
            dialog.appendTo($('#' + this.RichContentEditorInstance.EditorId));
        }
        return dialog;
    }

    private getSizeDialogHtml(id: string): string
    {
        return `
            <div class="rce-dialog column-width-dialog">
                <div class="rce-dialog-content">
                    <div class="rce-dialog-title">${this._locale.ColumnSizeDialogTitle}</div>
                    <div class="rce-form-field rce-form-field-inline">
                        <label for="${id}_Size" class="rce-label">${this._locale.SizeLabel}</label>
                        <input id="${id}_Size" class="validate rce-input rce-size-input browser-default" type="number" required="required" min="1" max="6" />
                        <span class="rce-error-text">${this._locale.ValidateSizeMessage}</span>
                    </div>
                </div>
                <div class="rce-dialog-footer">
                    <a href="javascript:" class="rce-button rce-button-flat rce-close-dialog">${this.RichContentEditorInstance.DialogManager.Locale.DialogCancelButton}</a>
                    <a href="javascript:" class="rce-button rce-submit-dialog">${this.RichContentEditorInstance.DialogManager.Locale.DialogSaveButton}</a>
                </div>
            </div>`;
    }
}

RichContentBaseEditor.RegisterEditor('RichContentHeadingEditor', RichContentHeadingEditor);