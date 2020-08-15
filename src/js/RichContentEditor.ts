class RichContentEditorOptions 
{
    /**
     * The language to display the editor in.
     */
    public Language: string = "EN";

    public UploadUrl?: string = null;

    public FileListUrl?: string = null;

    public GridFramework?: string = null;

    public CancelUrl?: string = null;

    public Editors?: string[] = null;

    public RenderOnSave? = true;

    public ShowCloseButton? = true;

    public ShowSaveButton? = true;

    public OnBeforeSave?: Function = null;

    public OnSave?: (html: string) => void = null;

    public OnClose?: Function = null;

    public OnChange?: Function = null;
}

class GridFrameworkBase
{
    private static _registrations: Dictionary<typeof GridFrameworkBase> = {};

    public static Create(gridFramework?: string): GridFrameworkBase
    {
        if (RichContentUtils.IsNullOrEmpty(gridFramework))
        {
            return new GridFrameworkBase();
        }

        if (!GridFrameworkBase._registrations.hasOwnProperty(gridFramework)) throw `GridFrameworkBase ${gridFramework} not registered!`;
        return new GridFrameworkBase._registrations[gridFramework];
    }

    public static Register(name: string, gridFramework: typeof GridFrameworkBase)
    {
        GridFrameworkBase._registrations[name] = gridFramework;
    }

    public GetRightAlignClass?(): string
    {
        return null;
    }

    public GetLeftAlignClass?(): string
    {
        return null;
    }

    public GetBlockAlignClass?(): string
    {
        return null;
    }

    public GetRightAlignCss?(): KeyValue<string>
    {
        var kv: KeyValue<string> =
        {
            Key: 'float',
            Value: 'left'
        }

        return kv;
    }

    public GetLeftAlignCss?(): KeyValue<string>
    {
        var kv: KeyValue<string> =
        {
            Key: 'float',
            Value: 'right'
        }

        return kv;
    }

    public GetBlockAlignCss?(): KeyValue<string>
    {
        var kv: KeyValue<string> =
        {
            Key: 'width',
            Value: '100%'
        }

        return kv;
    }

    public UpdateFields()
    {
    }

    public GetRowClass()
    {
        return "rce-row";
    }

    public GetColumnClass(width: number)
    {
        return `rce-col rce-col-s${width}`;
    }

    public GetSmallPrefix(): string
    {
        return 'rce-col-s';
    }

    public GetMediumPrefix(): string
    {
        return 'rce-col-m';
    }

    public GetLargePrefix(): string
    {
        return 'rce-col-l';
    }

    public GetExtraLargePrefix(): string
    {
        return 'rce-col-xl';
    }

    public GetPreviousSize(size: string): string
    {
        if (size === 'm')
        {
            return 's';
        }
        else if (size === 'l')
        {
            return 'm';
        }
        else if (size === 'xl')
        {
            return 'l';
        }
    }

    public GetColumnCount(): number
    {
        return 12;
    }

    public GetColumnLeftAlignClass(): string
    {
        return null;
    }

    public GetColumnCenterAlignClass(): string
    {
        return null;
    }

    public GetColumnRightAlignClass(): string
    {
        return null;
    }
}

interface FileListItem
{
    name: string;
    uri: string;
}

class FileManager
{
    //private _options: RichContentEditorOptions;
    //private _gridSelector: string;
    private _richContentEditor: RichContentEditor;
    private static _localeRegistrations: Dictionary<typeof FileManagerLocale> = {};

    public Locale: FileManagerLocale;

    public static RegisterLocale<T extends typeof FileManagerLocale>(localeType: T, language: string)
    {
        FileManager._localeRegistrations[language] = localeType;
    }

    public constructor(richContentEditor: RichContentEditor, language: string)
    {
        this._richContentEditor = richContentEditor;

        if (!FileManager._localeRegistrations.hasOwnProperty(language)) throw `FileManager locale for language ${language} not registered!`;
        this.Locale = new FileManager._localeRegistrations[language]();
    }

    private updateFileList(gridSelector: string, dialog: JQuery<HTMLElement>)
    {
        $('.file-table', dialog).empty().text('Loading...');

        const _this = this;

        $.ajax({
            url: this._richContentEditor.Options.FileListUrl,
            type: 'GET',
            processData: false,  // tell jQuery not to process the data
            contentType: false,  // tell jQuery not to set contentType
            error: function (xhr, _textStatus, _errorThrown)
            {
                _this._richContentEditor.DialogManager.ShowErrorDialog(gridSelector, xhr.responseJSON.title);
            },
            success: function (data)
            {
                $('.file-table', dialog).empty();
                const rows = data as FileListItem[];
                for (let i = 0; i < rows.length; i++)
                {
                    const row = rows[i];
                    const rowDiv = $(`<div class="row"><div class="col s12"><span class="item-title">${row.name}</span><a href="${row.uri}" target="_blank" class="rce-right"><i class="fas fa-external-link-alt"></i></a></div></div>`);
                    $('.file-table', dialog).append(rowDiv);
                }
                $('.file-table .col', dialog).click(function ()
                {
                    const url = $(this).closest('.col').find('a').attr('href');
                    $('.image-url', dialog).val(url);
                });
            },
        });
    }

    public ShowFileSelectionDialog(url: string, lightBox: boolean, targetBlank: boolean, imageMode: boolean, action: (url: string, lightBox: boolean, targetBlank: boolean) => boolean): void
    {
        const gridSelector = this._richContentEditor.GridSelector;

        var dialog = this.getFileSelectionDialog(imageMode);

        if (!this._richContentEditor.Options.UploadUrl)
            dialog.find(`a[href="#${this._richContentEditor.EditorId}_ByUpload"]`).closest('li').addClass('rce-hide');

        if (!this._richContentEditor.Options.FileListUrl)
            dialog.find(`a[href="#${this._richContentEditor.EditorId}_BySelection"]`).closest('li').addClass('rce-hide');

        $('.image-url', dialog).val(url);
        $('.lightbox-check', dialog).prop('checked', lightBox);
        $('.target-blank-check', dialog).prop('checked', targetBlank);

        this._richContentEditor.DialogManager.ShowDialog(dialog, (dialog) =>
        {
            let valid = this._richContentEditor.DialogManager.ValidateFields(gridSelector, $('input:not(:file)', dialog));
            if (!valid) return;

            const url = $('.image-url', dialog).val().toString();
            const lightBox = $('.lightbox-check', dialog).prop('checked');
            const targetBlank = $('.target-blank-check', dialog).prop('checked');

            const ok = action(url, lightBox, targetBlank);
            if (!ok)
                return false;

            $('.image-url', dialog).val('');

            return true;
        });
    }

    private getFileSelectionDialog(imageMode: boolean): JQuery<HTMLElement>
    {
        const _this = this;

        const editorId = this._richContentEditor.EditorId;

        var dialog = $('#' + editorId + ' .file-dialog');

        if (!dialog.length)
        {
            dialog = $(this.getFileSelectionDialogHtml(this._richContentEditor.EditorId, imageMode));
            dialog.appendTo($('#' + editorId));

            $('.rce-tabs .rce-tab a', dialog).click(function (e)
            {
                e.preventDefault();

                const tabs = $(this).closest('.rce-tabs').find('.rce-tab');
                tabs.removeClass('active');
                $(this).closest('.rce-tab').addClass('active');
                const href = $(this).attr('href');
                const tabBodies = $(this).closest('.rce-tab-panel').find('.rce-tab-body');
                tabBodies.removeClass('active');
                $(href).addClass('active');
            });

            $('input:file', dialog).change(function ()
            {
                if ($(this).val())
                {
                    $('.upload-button', dialog).removeAttr('disabled');
                }
            });

            $('.upload-button', dialog).click(function ()
            {
                const file = ($('input:file', dialog)[0] as HTMLInputElement).files[0];

                if (!file)
                {
                    // If the file selection is cancelled, the file input is cleared but no event is raised for us to react on. Below is a fail-safe for when that situation occurs.
                    $('.upload-button', dialog).attr('disabled', 'disabled');
                    return;
                }

                const formData = new FormData();
                formData.append('file', file);

                $.ajax({
                    url: _this._richContentEditor.Options.UploadUrl,
                    type: 'POST',
                    data: formData,
                    processData: false,  // tell jQuery not to process the data
                    contentType: false,  // tell jQuery not to set contentType
                    error: function (xhr, _textStatus, _errorThrown)
                    {
                        $('.file-path-wrapper-progress', dialog).css({ width: 0 });
                        _this._richContentEditor.DialogManager.ShowErrorDialog('#' + _this._richContentEditor.EditorId, xhr.responseJSON.title);
                    },
                    success: function (data)
                    {
                        $('.file-path-wrapper-progress', dialog).css({ width: 0 });
                        $('input:file', dialog).val('');
                        $('.file-path', dialog).val('');
                        $('.image-url', dialog).val(data.toString());
                    },
                    xhr: function ()
                    {
                        const xhr = new window.XMLHttpRequest();
                        xhr.upload.addEventListener("loadstart", function (_evt)
                        {
                            $('.upload-button', dialog).attr('disabled', 'disabled');
                        }, false);
                        xhr.upload.addEventListener("progress", function (evt)
                        {
                            if (evt.lengthComputable)
                            {
                                const percentComplete = evt.loaded / evt.total;
                                $('.file-path-wrapper-progress', dialog).css({ width: (percentComplete * 100) + '%' });
                            }
                        }, false);
                        xhr.upload.addEventListener("load", function (_evt)
                        {
                        }, false);
                        return xhr;
                    }
                });
            });

            $(`a[href="#${editorId}_BySelection"]`).click(function ()
            {
                var dialog = $(this).closest('.rce-dialog');
                _this.updateFileList('#' + _this._richContentEditor.EditorId, dialog);
            });
        }

        $('.rce-dialog-title', dialog).text(imageMode ? this.Locale.ImageSelectionDialogTitle : this.Locale.LinkSelectionDialogTitle);
        $(`#${editorId}_ByUrl`).text(imageMode ? this.Locale.ImageByUrlMessage : this.Locale.LinkByUrlMessage);
        $('.image-url-label').text(imageMode? this.Locale.ImageUrlField : this.Locale.LinkUrlField);
        $('.featherlight-input-group', dialog).toggleClass('rce-hide', !RichContentUtils.HasFeatherLight() || imageMode);
        $('.target-blank-input-group', dialog).toggleClass('rce-hide', imageMode);

        return dialog;
    }

    private getFileSelectionDialogHtml(editorId: string, imageMode: boolean)
    {
        return `
            <div class="rce-dialog file-dialog">
                <div class="rce-dialog-content">
                    <div class="rce-dialog-title"></div>
                    <div class="rce-tab-panel" style="padding: 0;">
                        <ul class="rce-tabs">
                            <li class="rce-tab active"><a href="#${editorId}_ByUrl">${this.Locale.ByUrlTab}</a></li>
                            <li class="rce-tab"><a href="#${editorId}_ByUpload">${this.Locale.ByUploadTab}</a></li>
                            <li class="rce-tab"><a href="#${editorId}_BySelection">${this.Locale.BySelectionTab}</a></li>
                        </ul>
                        <div id="${editorId}_ByUrl" class="rce-tab-body active"></div>
                        <div id="${editorId}_ByUpload" class="rce-tab-body">
                            <div class="file-path-wrapper-with-progress">
                                <input type="file" class="rce-left">
                                <div class="rce-right">
                                    <button type="button" class="rce-button upload-button" style="width: 100%;" disabled="disabled">${this.Locale.UploadButton}</button>
                                </div>
                                <div class="file-path-wrapper-progress"></div>
                                <div class="rce-clear"></div>
                            </div>
                        </div>
                        <div id="${editorId}_BySelection" class="rce-tab-body">
                            <div class="file-table">
                                ${this.Locale.LoadingProgressMessage}
                            </div>
                        </div>
                    </div>
                    <div class="rce-form-field">
                        <label for="${editorId}_ImageUrl" class="rce-label image-url-label"></label>
                        <input id="${editorId}_ImageUrl" class="image-url validate rce-input" type="text" required="required" />
                        <span class="rce-error-text">${this.Locale.EnterUrlValidation}</span>
                    </div>
                    <div class="rce-input-group rce-hide featherlight-input-group">
                        <label class="rce-radio">
                            <input class="lightbox-check" type="checkbox"/>
                            <span>Featherlight</span>
                        </label>
                    </div>
                    <div class="rce-input-group target-blank-input-group">
                        <label class="rce-radio">
                            <input class="target-blank-check" type="checkbox"/>
                            <span>${this.Locale.OpenInNewTagCheckBox}</span>
                        </label>
                    </div>
                </div>
                <div class="rce-dialog-footer">
                    <a href="javascript:" class="rce-button rce-button-flat rce-close-dialog">${this._richContentEditor.DialogManager.Locale.DialogCancelButton}</a>
                    <a href="javascript:" class="rce-button rce-submit-dialog">${this._richContentEditor.DialogManager.Locale.DialogSaveButton}</a>
                </div>
            </div>`;
    }
}

class RichContentEditor
{
    public RegisteredEditors: Dictionary<RichContentBaseEditor> = { };
    public FileManager: FileManager = null;
    public DialogManager: DialogManager = null;
    public GridFramework: GridFrameworkBase = null;
    public EditElement: JQuery<HTMLElement>;
    public EditorId: string;
    public GridSelector: string;
    public Options: RichContentEditorOptions;
    public Locale: RichContentEditorLocale;

    private static _localeRegistrations: Dictionary<typeof RichContentEditorLocale> = {};

    public static RegisterLocale<T extends typeof RichContentEditorLocale>(localeType: T, language: string)
    {
        RichContentEditor._localeRegistrations[language] = localeType;
    }

    public GetEditor?(editor: string): RichContentBaseEditor
    {
        return this.RegisteredEditors[editor];
    }

    public Init(editorId: string, options: RichContentEditorOptions): RichContentEditor
    {
        const _this = this;

        if (!options)
        {
            options = new RichContentEditorOptions();
        }

        if (options.RenderOnSave === undefined) options.RenderOnSave = true;
        if (options.ShowSaveButton === undefined) options.ShowSaveButton = true;
        if (options.ShowCloseButton === undefined) options.ShowCloseButton = true;

        this.EditorId = editorId;
        const gridSelector = '#' + editorId;
        this.GridSelector = gridSelector;
        this.Options = options;
        this.Locale = new RichContentEditor._localeRegistrations[options.Language]();
        this.GridFramework = GridFrameworkBase.Create(options.GridFramework);
        this.FileManager = new FileManager(this, options.Language);
        this.DialogManager = new DialogManager(this, options.Language);

        this.instantiateEditors(options.Editors);

        const editorElement = $(HtmlTemplates.GetMainEditorTemplate(editorId));
        editorElement.data('orig', $(gridSelector).prop('outerHTML'));
        if (options.CancelUrl)
        {
            editorElement.find('.rce-editor-close').attr('href', options.CancelUrl);
        }
        editorElement.find('.rce-editor-save').toggleClass('rce-hide', !options.ShowSaveButton)
        editorElement.find('.rce-editor-close').toggleClass('rce-hide', !options.ShowCloseButton)
        this.ImportChildren(editorElement, $(gridSelector), false, false);
        $(gridSelector).replaceWith(editorElement);

        var grid = $(gridSelector + ' .rce-grid');

        grid.bind('contextmenu', function (e)
        {
            e.preventDefault();
            e.stopPropagation();
            _this.CloseAllMenus();
            _this.showAddMenu(new XYPosition(e.clientX + window.scrollX, e.clientY + window.scrollY));
        });

        if ((window as any).Sortable)
        {
            (window as any).Sortable.create(grid[0],
                {
                    draggable: '.rce-editor-wrapper'
                });
        }

        $(gridSelector + ' .rce-editor-save').click(function ()
        {
            if (_this.Options.OnBeforeSave)
            {
                if (!_this.Options.OnBeforeSave())
                    return;
            }

            const html = _this.GetHtml();

            if (_this.Options.RenderOnSave)
            {
                const orig = $($(gridSelector).data('orig') as string);
                orig.empty();
                orig.append($(html));
                $(gridSelector).replaceWith(orig);
            }

            if (_this.Options.OnSave)
            {
                _this.Options.OnSave(html);
            }
        });

        if (!options.CancelUrl)
        {
            $(gridSelector + ' .rce-editor-close').click(function ()
            {
                const orig = $($(gridSelector).data('orig') as string);
                $(gridSelector).replaceWith(orig);

                if (_this.Options.OnClose)
                {
                    _this.Options.OnClose();
                }
            });
        }

        $(gridSelector + ' .rce-editor-preview-lock').click(function ()
        {
            $(gridSelector + ' .rce-editor-preview-lock').addClass('rce-hide');
            $(gridSelector + ' .rce-editor-preview-unlock').removeClass('rce-hide');
            $(gridSelector).removeClass('edit-mode');
            _this.CloseAllToolbars();
        });

        $(gridSelector + ' .rce-editor-preview-unlock').click(function ()
        {
            $(gridSelector + ' .rce-editor-preview-lock').removeClass('rce-hide');
            $(gridSelector + ' .rce-editor-preview-unlock').addClass('rce-hide');
            $(gridSelector).addClass('edit-mode');
        });

        $(gridSelector + ' .add-button').click(function ()
        {
            _this.CloseAllMenus();
            _this.showAddMenu($(this));
        });

        $(document).click(function (e)
        {
            const target = $(e.target);

            // Close all open menus if clicking outside of a menu button
            if (!target.hasClass('rce-menu-button') && target.closest('.rce-menu,.rce-menu-button').length === 0)
            {
                _this.CloseAllMenus();

                // When clicking outside of editor, close toolbars too
                if (target.closest('.rce-grid-wrapper').length === 0)
                {
                    _this.CloseAllToolbars();
                }
            }
        });

        $(document).keydown(function (e)
        {
            if (e.keyCode === 27)
                _this.CloseAllMenus();
        });

        $(gridSelector + ' input.readonly').on('keydown paste cut', function (e)
        {
            e.preventDefault();
        });

        return this;
    }

    public GetDetectionSelectors(editor: RichContentBaseEditor): string
    {
        let result = 'table,form,script';

        for (let key in this.RegisteredEditors)
        {
            const otherEditor = this.RegisteredEditors[key];
            if (otherEditor != editor)
            {
                const otherSelectors = otherEditor.GetDetectionSelectors();
                if (otherSelectors)
                {
                    if (result !== '') result += ',';
                    result += otherSelectors;
                }
            }
        }

        return result;
    }

    public ImportChildren(target: JQuery<HTMLElement>, source: JQuery<HTMLElement>, inTableCell, inLink: boolean)
    {
        const _this = this;

        const elements = source.children();
        elements.each(function ()
        {
            for (let key in _this.RegisteredEditors)
            {
                const editor = _this.RegisteredEditors[key];
                if ((!inTableCell || editor.AllowInTableCell()) && (!inLink || editor.AllowInLink()))
                {
                    editor.Import(target, $(this));
                }
            }
        });
    }

    public Delete()
    {
        const editor = $('#' + this.EditorId);
        const orig = editor.data('orig');
        editor.replaceWith(orig);
    }

    /**
     * Get the editor content as HTML.
     */
    public GetHtml()
    {
        let copy = $(this.GridSelector + ' .rce-grid').clone();

        this.clean(copy);

        return copy.html();
    }

    /**
     * Save the editor content as HTML.
     */
    public Save()
    {
        var html = this.GetHtml().trim();
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(html));
        pom.setAttribute('download', 'dnote.html');

        if (document.createEvent)
        {
            var event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            pom.dispatchEvent(event);
        }
        else
        {
            pom.click();
        }
    }

    private clean(elem: JQuery<HTMLElement>)
    {
        const _this = this;

        elem.children().each(function ()
        {
            _this.cleanElement($(this));
        });
    }

    private cleanElement(elem: JQuery<HTMLElement>)
    {
        const _this = this;

        if (elem.hasClass('rce-menu-button') || elem.hasClass('rce-toolbar'))
        {
            elem.remove();
        }
        else if (elem.hasClass('rce-editor-wrapper') && !elem.hasClass('rce-editor-wrapper-keep'))
        {
            _this.EliminateElement(elem);
        }
        else
        {
            _this.clean(elem);
        }

        elem.removeClass('rce-editor-wrapper rce-editor-wrapper-keep');

        for (let key in this.RegisteredEditors)
        {
            var editor = this.RegisteredEditors[key];
            editor.Clean(elem);
        }
    }

    public EliminateElement(elem: JQuery<HTMLElement>)
    {
        const _this = this;

        var children = elem.children();
        children.each(function ()
        {
            _this.cleanElement($(this));
        });
        elem.children().detach().appendTo(elem.parent());
        elem.remove();
    }

    private instantiateEditors(editors: string[])
    {
        const _this = this;

        if (!editors)
        {
            const registrations = RichContentBaseEditor.GetRegistrations();
            for (let key in registrations)
            {
                var instance = RichContentBaseEditor.Create(key);
                instance.Init(this);
                instance.OnChange = function ()
                {
                    _this.handleChanged();
                };
                this.RegisteredEditors[key] = instance;
            }
        }
        else
        {
            for (let i = 0; i < editors.length; i++)
            {
                var instance = RichContentBaseEditor.Create(editors[i]);
                instance.Init(this);
                instance.OnChange = function ()
                {
                    _this.handleChanged();
                };
                this.RegisteredEditors[editors[i]] = instance;
            }
        }
    }

    private handleChanged(): void
    {
        if (this.Options.OnChange)
        {
            this.Options.OnChange();
        }
    }

    public InsertEditor(editorTypeName: string, element: JQuery<HTMLElement>)
    {
        let editor: RichContentBaseEditor = null;

        for (let key in this.RegisteredEditors)
        {
            const registeredEditor = this.RegisteredEditors[key];
            if (registeredEditor.Name === editorTypeName)
            {
                editor = registeredEditor;
            }
        }

        if (editor === null)
        {
            console.error(`Editor with name ${editorTypeName} not registered!`);
        }
        else
        {
            editor.Insert(element);
        }
    }

    public CloseAllMenus()
    {
        $('.rce-menu').remove();
    }

    public CloseAllToolbars()
    {
        $('.rce-toolbar').remove();
    }

    private showAddMenu(button: JQuery<HTMLElement> | XYPosition)
    {
        const _this = this;

        const menu = $('<div class="rce-menu"></div>');

        for (let key in this.RegisteredEditors)
        {
            const editor = this.RegisteredEditors[key];
            const item = $(`<button type="button" class="rce-menu-item"><i class="rce-menu-icon ${editor.GetMenuIconClasses()}"></i> <span class="rce-menu-label">${editor.GetMenuLabel()}</span></button>`);
            item.click(function () { _this.handleChanged(); _this.CloseAllMenus(); editor.Insert($(_this.GridSelector + ' .rce-grid')); });
            menu.append(item);
        }

        RichContentUtils.ShowMenu(menu, button);
    }
}

class DialogManager
{
    private static _dialogStack: JQuery<HTMLElement>[] = [];
    private static _eventAttached = false;
    private static _localeRegistrations: Dictionary<typeof DialogManagerLocale> = {};

    public Locale: DialogManagerLocale;

    public static RegisterLocale<T extends typeof DialogManagerLocale>(localeType: T, language: string)
    {
        DialogManager._localeRegistrations[language] = localeType;
    }

    public constructor(richContentEditor: RichContentEditor, language: string)
    {
        if (!DialogManager._localeRegistrations.hasOwnProperty(language)) throw `DialogManager locale for language ${language} not registered!`;
        this.Locale = new DialogManager._localeRegistrations[language]();
    }

    public ShowDialog(dialog: JQuery<HTMLElement>, onSubmit?: (dialog: JQuery<HTMLElement>) => boolean)
    {
        const _this = this;

        var backdrop = $('<div class="rce-modal-backdrop"></div>')
        //var gridWrapper = dialog.closest('.rce-grid-wrapper');
        backdrop.appendTo($('body'))
        dialog.data('origin', dialog.parent());
        dialog.detach().appendTo(backdrop);
        backdrop.mousedown(function (e)
        {
            if ($(e.target).hasClass('rce-modal-backdrop'))
                _this.CloseDialog(dialog);
        });

        if (!DialogManager._eventAttached)
        {
            $(document).on('keydown', (e) => { _this.dialogKeyDown(e); });
            DialogManager._eventAttached = true;
        }

        DialogManager._dialogStack.push(dialog);

        // Set backdrop to active does not trigger its transition because it has just been added to the DOM. Setting the active state using a timeout fixes this.
        window.setTimeout(function ()
        {
            dialog.closest('.rce-modal-backdrop').addClass('active');
        }, 1);

        $('.rce-submit-dialog', dialog).off('click');
        $('.rce-close-dialog', dialog).click(function ()
        {
            _this.CloseDialog($(this).closest('.rce-dialog'));
        });

        $('.rce-submit-dialog', dialog).off('click');
        $('.rce-submit-dialog', dialog).click(function ()
        {
            if (onSubmit)
            {
                const ok = onSubmit(dialog);
                if (!ok)
                {
                    return;
                }
            }
            _this.CloseDialog($(this).closest('.rce-dialog'));
        });
    }

    private dialogKeyDown(e: JQuery.KeyDownEvent<Document, undefined, Document, Document>)
    {
        if (e.keyCode === 27)
        {
            if (DialogManager._dialogStack.length)
                this.CloseDialog(DialogManager._dialogStack.pop())
        }
    }

    public ValidateFields(gridSelector: string, elem: JQuery<HTMLElement>): boolean
    {
        let valid = true;

        elem.each(function ()
        {
            const input = $(this) as JQuery<HTMLInputElement>;
            var fieldValid = input[0].checkValidity();
            if (!fieldValid)
            {
                valid = false;
            }
            input.closest('.rce-form-field').toggleClass('invalid', !fieldValid);
        });

        if (!valid)
        {
            this.ShowErrorDialog(gridSelector, this.Locale.FieldValidationErrorMessage)
            return false;
        }

        return valid;
    }

    public CloseDialog(dialog: JQuery<HTMLElement>)
    {
        var idx = DialogManager._dialogStack.indexOf(dialog);
        DialogManager._dialogStack = DialogManager._dialogStack.splice(idx, 1);
        var backdrop = dialog.closest('.rce-modal-backdrop').removeClass('active');
        dialog.detach().appendTo(dialog.data('origin'));
        backdrop.remove();
    }

    public ShowErrorDialog(gridSelector: string, message: string)
    {
        let dialog = $(gridSelector + ' .error-dialog');
        if (!dialog.length)
        {
            dialog = $(this.getErrorDialogHtml());
            dialog.appendTo($(gridSelector));
        }
        $('.error-message', dialog).text(message);
        this.ShowDialog(dialog);
    }

    public getErrorDialogHtml(): any
    {
        return `
            <div class="rce-dialog error-dialog">
                <div class="rce-dialog-content">
                    <div class="rce-dialog-title">${this.Locale.ErrorDialogTitle}</div>
                    <p class="error-message"></p>
                </div>
                <div class="rce-dialog-footer">
                    <a href="javascript:" class="rce-button rce-button-flat rce-close-dialog">OK</a>
                </div>
            </div>`;
    }
}

class HtmlTemplates
{
    public static GetMainEditorTemplate(id: string)
    {
        return `
            <div id="${id}" class="rce-grid-wrapper edit-mode">
                <div class="rce-grid">
                    <a class="rce-button rce-button-flat rce-menu-button add-button"><i class="fas fa-plus-circle"></i></a>
                </div>

                <div class="rce-editor-top-icons">
                    <button type="button" class="rce-button rce-button-toolbar rce-editor-preview-lock"><i class="fas fa-eye"></i></button>
                    <button type="button" class="rce-button rce-button-toolbar rce-editor-preview-unlock rce-hide"><i class="fas fa-eye-slash"></i></button>
                    <button type="button" class="rce-button rce-button-toolbar rce-editor-save rce-hide"><i class="fas fa-save"></i></button>
                    <a href="javascript:" class="rce-button rce-button-toolbar rce-editor-close rce-hide"><i class="fas fa-times"></i></a>
                </div>
            </div>`
    }
}