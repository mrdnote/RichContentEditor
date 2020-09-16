class RichContentTableEditor extends RichContentBaseEditor
{
    private static _localeRegistrations?: Dictionary<typeof RichContentTableEditorLocale> = {};
    private _locale?: RichContentTableEditorLocale;

    public static RegisterLocale?<T extends typeof RichContentTableEditorLocale>(localeType: T, language: string)
    {
        RichContentTableEditor._localeRegistrations[language] = localeType;
    }

    public Init(richContentEditor: RichContentEditor)
    {
        super.Init(richContentEditor);

        const _this = this;
        this._locale = new RichContentTableEditor._localeRegistrations[richContentEditor.Options.Language]();
    }

    public OnDelete(elem: JQuery<HTMLElement>)
    {
        // Override OnDelete to remove the entire table if, after removing the row, there are no more rows left

        if (elem.hasClass('row') && elem.parent().find('.row').length < 2)
        {
            elem.closest('.rce-table-wrapper').remove();
        }
        else
        {
            super.OnDelete(elem);
        }
    }

    public Insert(targetElement?: JQuery<HTMLElement>)
    {
        super.Insert(targetElement);

        const tableWrapper = $('<div class="rce-table-wrapper"></div>');
        const table = $('<div class="rce-table"></div>');
        this.addTableRow(table);
        tableWrapper.append(table);

        if (!targetElement)
        {
            targetElement = $('.rce-grid', this.RichContentEditorInstance.GridSelector);
        }

        this.Attach(tableWrapper, targetElement);
    }

    public Clean(elem: JQuery<HTMLElement>)
    {
        const _this = this;

        if (elem.hasClass('col'))
        {
            var alignment = this.getTableColumnAlignment(elem);
            this.setFrameworkColumnAlignment(elem, alignment);
            this.cleanEditorColumnAlignment(elem);
        }

        if (elem.hasClass('inner') && elem.parent().hasClass('col'))
        {
            this.EliminateElementWrapper(elem);
        }

        if (elem.hasClass('rce-table')) 
        {
            elem.removeClass('rce-table').addClass('table');
        }

        elem.children().each(function ()
        {
            _this.Clean($(this)); 
        });


        super.Clean(elem);
    }

    public AllowInTableCell(): boolean
    {
        return true;
    }

    private addTableRow(table: JQuery<HTMLElement>)
    {
        const rowClass = this.RichContentEditorInstance.GridFramework.GetRowClass();
        const row = $(`<div class="${rowClass}"></div>`);
        this.addTableColumn(row);
        table.append(row);
        this.SetupEditor(row, true);

        this.attachRow(row);
    }

    private attachRow(row: JQuery<HTMLElement>)
    {
        if ((window as any).Sortable)
        {
            (window as any).Sortable.create(row[0], {
                group: 'row-content',
                draggable: '> .rce-element-editor'
            });

            (window as any).Sortable.create(row.closest('.rce-table')[0], {
                group: 'table-content',
                draggable: '> .rce-element-editor'
            });
        }
    }

    private addTableColumn(row: JQuery<HTMLElement>)
    {
        const _this = this;
        let newWidth = 12;
        const cols = row.find('.col');
        if (cols.length > 0)
        {
            let totalWidth = 0;
            cols.each(function ()
            {
                totalWidth += _this.getTableColumnWidth($(this), 's', true);
            });
            if (totalWidth % 12 !== 0)
            {
                newWidth = 12 - totalWidth % 12;
            }
        }
        const inner = $('<div class="inner"></div>');
        const colClass = _this.RichContentEditorInstance.GridFramework.GetColumnClass(newWidth);
        const col = $(`<div class="${colClass}"></div>`);
        col.append(inner);

        this.attachColumn(col);

        col.appendTo(row);
        this.SetupEditor(col, true);
    }

    private attachColumn(col: JQuery<HTMLElement>)
    {
        if ((window as any).Sortable)
        {
            (window as any).Sortable.create(col.find('.inner')[0], {
                group: 'column-content',
                draggable: '> .rce-element-editor'
            });
        }
    }

    private getTableColumnWidth(col: JQuery<HTMLElement>, size: string, exact: boolean): number
    {
        let previousSize: string;
        if (!exact)
        {
            previousSize = this.RichContentEditorInstance.GridFramework.GetPreviousSize(size);
        }
        const classes = col.attr('class').split(' ');
        for (const index in classes)
        {
            const cls = classes[index];
            if (cls.substring(0, size.length) === size)
            {
                const w = parseInt(cls.substring(size.length));
                if (!isNaN(w))
                {
                    return w;
                }
            }
        }
        if (previousSize)
        {
            return this.getTableColumnWidth(col, previousSize, false);
        }
        else
        {
            return 0;
        }
    }

    public GetDetectionSelectors(): string
    {
        return '.table,.row,.col';
    }

    public Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>, touchedElements: HTMLElement[]): JQuery<HTMLElement>
    {
        const _this = this;

        if (source.is('.table'))
        {
            var table = $('<div class="rce-table"></div>').addClass(source.attr('class')).removeClass('table');
            var rows = source.find(' > .row').clone();
            rows.addClass(['rce-editor-wrapper', 'rce-editor-wrapper-keep']);
            var cols = rows.find(' > .col');
            cols.addClass(['rce-editor-wrapper', 'rce-editor-wrapper-keep']);
            table.append(rows);
            rows.each(function ()
            {
                _this.attachRow($(this));
            });
            cols.each(function ()
            {
                var inner = $('<div class="inner"></div>');
                _this.RichContentEditorInstance.ImportChildren(inner, $(this), true, false, touchedElements);

                var alignment = _this.getFrameworkTableColumnAlignment($(this));
                _this.setEditorColumnAlignment($(this), alignment);

                $(this).empty();
                $(this).append(inner);

                _this.attachColumn($(this));
            });
            this.SetupEditor(rows, true);
            this.SetupEditor(cols, true);
            const tableWrapper = $('<div class="rce-table-wrapper"></div>');
            tableWrapper.append(table);

            source.replaceWith(tableWrapper);

            this.Attach(tableWrapper, targetElement);

            return tableWrapper;
        }

        return null;
    }

    public GetMenuLabel(): string
    {
        return this._locale.MenuLabel;
    }

    public GetMenuIconClasses(): string
    {
        return 'fas fa-table';
    }

    public GetContextButtonText(elem: JQuery<HTMLElement>): string
    {
        if (elem.hasClass('col')) return 'col';
        if (elem.hasClass('row')) return 'row';
        return 'tab';
    }

    public GetContextCommands(elem: JQuery<HTMLElement>): ContextCommand[]
    {
        if (elem.hasClass('col'))
        {
            return this.getColumnContextCommands(elem);
        }
        else if (elem.hasClass('row'))
        {
            return this.getRowContextCommands(elem);
        }
        else if (elem.hasClass('rce-table-wrapper'))
        {
            return this.getTableContextCommands(elem);
        }

        return [];
    }

    private getColumnContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[]
    {
        const _this = this;

        var result: ContextCommand[] = [];
        var editors = this.RichContentEditorInstance.RegisteredEditors;
        var gridSelector = this.RichContentEditorInstance.GridSelector;
        var editorId = this.RichContentEditorInstance.EditorId;

        for (let key in editors)
        {
            const editor = editors[key];
            if (editor.AllowInTableCell())
            {
                var insertCommand = new ContextCommand(editor.GetMenuLabel(), editor.GetMenuIconClasses(), function (elem)
                {
                    let inner = elem.find('.inner');
                    editor.Insert(inner);
                    _this.OnChange();
                    if ((window as any).Sortable)
                    {
                        (window as any).Sortable.create(inner[0], {
                            group: 'col',
                            draggable: '> .rce-element-editor'
                        });
                    }
                });
                result.push(insertCommand);
            }
        }

        var widthCommand = new ContextCommand(this._locale.SettingsMenuLabel, 'fas fa-cog', function (elem)
        {
            let dialog = _this.getColumnWidthDialog();
            $('input.rce-column-width-s', dialog).val(_this.getTableColumnWidth(elem, _this.RichContentEditorInstance.GridFramework.GetSmallPrefix(), true));
            $('input.rce-column-width-m', dialog).val(_this.getTableColumnWidth(elem, _this.RichContentEditorInstance.GridFramework.GetMediumPrefix(), false));
            $('input.rce-column-width-l', dialog).val(_this.getTableColumnWidth(elem, _this.RichContentEditorInstance.GridFramework.GetLargePrefix(), false));
            $('input.rce-column-width-xl', dialog).val(_this.getTableColumnWidth(elem, _this.RichContentEditorInstance.GridFramework.GetExtraLargePrefix(), false));
            const alignment = _this.getTableColumnAlignment(elem);
            if (alignment === ColumnAlignment.Center)
            {
                $('#' + editorId + '_AlignCenter').prop('checked', true);
            }
            else if (alignment === ColumnAlignment.Right)
            {
                $('#' + editorId + '_AlignRight').prop('checked', true);
            }
            else 
            {
                $('#' + editorId + '_AlignLeft').prop('checked', true);
            }
            _this.RichContentEditorInstance.GridFramework.UpdateFields();
            dialog.data('elem', elem);

            _this.RichContentEditorInstance.DialogManager.ShowDialog(dialog, (dialog) =>
            {
                let valid = _this.RichContentEditorInstance.DialogManager.ValidateFields(gridSelector, $('input', dialog));
                if (!valid) return;

                const gridFramework = _this.RichContentEditorInstance.GridFramework;
                //var elem = dialog.data('elem') as JQuery<HTMLElement>;
                elem.removeClass(gridFramework.GetSmallPrefix() + _this.getTableColumnWidth(elem, gridFramework.GetSmallPrefix(), true));
                elem.removeClass(gridFramework.GetMediumPrefix() + _this.getTableColumnWidth(elem, gridFramework.GetMediumPrefix(), true));
                elem.removeClass(gridFramework.GetLargePrefix() + _this.getTableColumnWidth(elem, gridFramework.GetLargePrefix(), true));
                elem.removeClass(gridFramework.GetExtraLargePrefix() + _this.getTableColumnWidth(elem, gridFramework.GetExtraLargePrefix(), true));
                elem.addClass(gridFramework.GetSmallPrefix() + $('input.rce-column-width-s', dialog).val());
                elem.addClass(gridFramework.GetMediumPrefix() + $('input.rce-column-width-m', dialog).val());
                elem.addClass(gridFramework.GetLargePrefix() + $('input.rce-column-width-l', dialog).val());
                elem.addClass(gridFramework.GetExtraLargePrefix() + $('input.rce-column-width-xl', dialog).val());
                let alignment = ColumnAlignment.Left;
                if ($('#' + editorId + '_AlignCenter').prop('checked'))
                {
                    alignment = ColumnAlignment.Center;
                }
                else if ($('#' + editorId + '_AlignRight').prop('checked'))
                {
                    alignment = ColumnAlignment.Right;
                }
                _this.setEditorColumnAlignment(elem, alignment);
                _this.OnChange();
                _this.RichContentEditorInstance.DialogManager.CloseDialog($(gridSelector + ' .column-width-dialog'));
                return true;
            });
        });
        result.push(widthCommand);

        return result;
    }

    private setEditorColumnAlignment(elem: JQuery<HTMLElement>, alignment: ColumnAlignment)
    {
        const gridFramework = this.RichContentEditorInstance.GridFramework;
        elem.removeClass([gridFramework.GetColumnLeftAlignClass(), gridFramework.GetColumnCenterAlignClass(), gridFramework.GetColumnRightAlignClass()]);
        if (alignment === ColumnAlignment.Center)
        {
            elem.addClass(gridFramework.GetColumnCenterAlignClass());
        }
        else if (alignment === ColumnAlignment.Right)
        {
            elem.addClass(gridFramework.GetColumnRightAlignClass());
        }
        else 
        {
            elem.addClass(gridFramework.GetColumnLeftAlignClass());
        }
    }

    private setFrameworkColumnAlignment(elem: JQuery<HTMLElement>, alignment: ColumnAlignment)
    {
        this.cleanEditorColumnAlignment(elem);
        if (alignment === ColumnAlignment.Center)
        {
            elem.addClass('rce-col-align-center');
        }
        else if (alignment === ColumnAlignment.Right)
        {
            elem.addClass('rce-col-align-right');
        }
        else 
        {
            elem.addClass('rce-col-align-left');
        }
    }

    private cleanEditorColumnAlignment(elem: JQuery<HTMLElement>)
    {
        elem.removeClass(['rce-col-align-left', 'rce-col-align-center', 'rce-col-align-right']);
    }

    private getTableColumnAlignment(elem: JQuery<HTMLElement>): ColumnAlignment
    {
        if (elem.hasClass('rce-col-align-left'))
            return ColumnAlignment.Left;
        if (elem.hasClass('rce-col-align-center'))
            return ColumnAlignment.Center;
        if (elem.hasClass('rce-col-align-right'))
            return ColumnAlignment.Right;
    }

    private getFrameworkTableColumnAlignment(elem: JQuery<HTMLElement>): ColumnAlignment
    {
        const gridFramework = this.RichContentEditorInstance.GridFramework;
        if (elem.hasClass(gridFramework.GetColumnLeftAlignClass()))
            return ColumnAlignment.Left;
        if (elem.hasClass(gridFramework.GetColumnCenterAlignClass()))
            return ColumnAlignment.Center;
        if (elem.hasClass(gridFramework.GetColumnRightAlignClass()))
            return ColumnAlignment.Right;
    }

    private getRowContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[]
    {
        const _this = this;

        var result: ContextCommand[] = [];

        var insertColumnCommand = new ContextCommand(this._locale.InsertColumnMenuLabel, 'fas fa-indent', function (elem)
        {
            _this.addTableColumn(elem);
            _this.OnChange();
            if ((window as any).Sortable)
            {
                (window as any).Sortable.create(elem[0], {
                    group: 'row-content',
                    draggable: '> .rce-element-editor'
                });
            }
        });
        result.push(insertColumnCommand);

        return result;
    }

    private getTableContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[]
    {
        const _this = this;

        var result: ContextCommand[] = [];

        var insertRowCommand = new ContextCommand(this._locale.InsertRowMenuLabel, 'fas fa-indent', function (elem)
        {
            _this.addTableRow(elem.find('.rce-table'));
            _this.OnChange();
        });
        result.push(insertRowCommand);

        return result;
    }

    public GetActualElement(elem: JQuery<HTMLElement>): JQuery<HTMLElement>
    {
        if (elem.hasClass('rce-table-wrapper'))
        {
            return elem.find(' > .rce-table');
        }

        return elem;
    }

    private getColumnWidthDialog()
    {
        let dialog = $('#' + this.RichContentEditorInstance.EditorId + ' .column-width-dialog');
        if (!dialog.length)
        {
            dialog = $(this.getColumnWidthDialogHtml(this.RichContentEditorInstance.EditorId));
            dialog.appendTo($('#' + this.RichContentEditorInstance.EditorId));
        }
        return dialog;
    }

    private getColumnWidthDialogHtml(id: string): string
    {
        let validateWidthMessage = this._locale.ValidateWidthMessage.replace('{0}', this.RichContentEditorInstance.GridFramework.GetColumnCount().toString());

        return `
            <div class="rce-dialog column-width-dialog">
                <div class="rce-dialog-content">
                    <div class="rce-dialog-title">${this._locale.SettingsDialogTitle}</div>
                    <div class="rce-left" style="width: 50%; padding-right: 10px;">
                        <b>${this._locale.ColumnWidthLabel}</b>
                        <div class="rce-form-field rce-form-field-inline">
                            <label for="${id}_WidthS" class="rce-label">${this._locale.ColumnWidthSmall}</label>
                            <input id="${id}_WidthS" class="validate rce-input rce-column-width-s browser-default" type="number" required="required" max="${this.RichContentEditorInstance.GridFramework.GetColumnCount()}" />
                            <span class="rce-error-text">${validateWidthMessage}</span>
                        </div>
                        <div class="rce-form-field rce-form-field-inline">
                            <label for="${id}_WidthM" class="rce-label">${this._locale.ColumnWidthMedium}</label>
                            <input id="${id}_WidthM" class="validate rce-input rce-column-width-m browser-default" type="number" required="required" max="${this.RichContentEditorInstance.GridFramework.GetColumnCount()}" />
                            <span class="rce-error-text">${validateWidthMessage}</span>
                        </div>
                        <div class="rce-form-field rce-form-field-inline">
                            <label for="${id}_WidthL" class="rce-label">${this._locale.ColumnWidthTablet}</label>
                            <input id="${id}_WidthL" class="validate rce-input rce-column-width-l browser-default" type="number" required="required" max="${this.RichContentEditorInstance.GridFramework.GetColumnCount()}" />
                            <span class="rce-error-text">${validateWidthMessage}</span>
                        </div>
                        <div class="rce-form-field rce-form-field-inline">
                            <label for="${id}_WidthXL" class="rce-label">${this._locale.ColumnWidthDesktop}</label>
                            <input id="${id}_WidthXL" class="validate rce-input  rce-column-width-xl browser-default" type="number" required="required" max="${this.RichContentEditorInstance.GridFramework.GetColumnCount()}" />
                            <span class="rce-error-text">${validateWidthMessage}</span>
                        </div>
                        <div class="rce-form-field rce-form-field-inline">
                            <label class="rce-label">${this._locale.AlignmentLabel}</label>
                            <div class="rce-input-group">
                                <label class="rce-radio">
                                    <input  id="${id}_AlignLeft" name="${id}_Align" type="radio" />
                                    <span>Left</span>
                                </label><br/>
                                <label class="rce-radio">
                                    <input  id="${id}_AlignCenter" name="${id}_Align" type="radio" />
                                    <span>Center</span>
                                </label><br/>
                                <label class="rce-radio">
                                    <input  id="${id}_AlignRight" name="${id}_Align" type="radio" />
                                    <span>Right</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="rce-clear"></div>
                </div>
                <div class="rce-dialog-footer">
                    <a href="javascript:" class="rce-button rce-button-flat rce-close-dialog">${this.RichContentEditorInstance.DialogManager.Locale.DialogCancelButton}</a>
                    <a href="javascript:" class="rce-button rce-submit-dialog">${this.RichContentEditorInstance.DialogManager.Locale.DialogSaveButton}</a>
                </div>
            </div>`;
    }
}

RichContentBaseEditor.RegisterEditor('RichContentTableEditor', RichContentTableEditor);