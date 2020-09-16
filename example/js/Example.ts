class Editor
{
    public Init()
    {
        const _this = this;

        const framework = $('#Framework').val() as string;

        if (framework === 'GridFrameworkMaterialize')
        {
            (window as any).$('select').formSelect();
        }

        const options: RichContentEditorOptions =
        {
            Language: 'EN',
            UploadUrl: 'https://dnote.azurewebsites.net/api/EditorApi/Secret98734234Upload',
            FileListUrl: 'https://dnote.azurewebsites.net/api/EditorApi/Secret98734234FileList',
            GridFramework: framework,
            Editors: this.getEditors(),
            OnClose: this.handleClose,
            OnSave: this.handleSave
        };

        let rce = this.instantiateMainEditor(options);

        const options2: RichContentEditorOptions =
        {
            Language: 'EN',
            GridFramework: framework
        };

        /*const _rce2 = */
        new RichContentEditor().Init('RichContentEditorCanvas2', options2);

        $('#ImageCheckBox,#TablesCheckBox').change(function ()
        {
            rce.Delete();
            options.Editors = _this.getEditors();
            rce = _this.instantiateMainEditor(options);
        });

        $('#Language').change(function ()
        {
            rce.Delete();
            options.Language = $(this).val() as string;
            rce = _this.instantiateMainEditor(options);
        });

        $('#Framework').change(function ()
        {
            const newFramework = $(this).val() as string;
            const page = newFramework === 'GridFrameworkBootstrap' ? 'bootstrap' : 'materialize';
            window.location.href = page + '.html';
        });

        $('#ExportButton').click(function ()
        {
            $('#ExportTextArea').val(rce.GetHtml().trim());
            $('#ExportTextArea').removeClass('rce-hide');
            if (framework === 'GridFrameworkMaterialize')
            {
                (window as any).M.textareaAutoResize($('#ExportTextArea'));
            }
        });

        $('#ExportXmlButton').click(function ()
        {
            $('#ExportTextArea').val(rce.GetXml().trim());
            $('#ExportTextArea').removeClass('rce-hide');
            if (framework === 'GridFrameworkMaterialize')
            {
                (window as any).M.textareaAutoResize($('#ExportTextArea'));
            }
        });

        $('#ContentEditButton').click(function ()
        {
            $(this).addClass('rce-hide');
            rce = _this.instantiateMainEditor(options);
        });
    }

    private handleClose()
    {
        $('#ContentEditButton').removeClass('rce-hide');
    }

    private handleSave()
    {
        $('#ContentEditButton').removeClass('rce-hide');
    }

    private getEditors(): string[]
    {
        const editors: string[] = ['RichContentTextEditor', 'RichContentHeadingEditor', 'RichContentFontAwesomeIconEditor', 'RichContentLinkEditor', 'RichContentVideoEditor', 'RichContentIFrameEditor', 'RichContentBreakEditor'];

        if ($('#ImageCheckBox').prop('checked'))
        {
            editors.push('RichContentImageEditor');
        }

        if ($('#TablesCheckBox').prop('checked'))
        {
            editors.push('RichContentTableEditor');
        }

        return editors;
    }

    private instantiateMainEditor(options: RichContentEditorOptions)
    {
        const rce = new RichContentEditor().Init('RichContentEditorCanvas', options);

        const framework = $('#Framework').val() as string;
        let tableCssClasses = ['red', 'green', 'yellow'];
        if (framework === "GridFrameworkMaterialize")
        {
            tableCssClasses.push('card-panel');
            rce.GetEditor("RichContentLinkEditor").RegisterCssClasses(['left', 'right']);
            rce.GetEditor("RichContentImageEditor").RegisterCssClasses(['left', 'right']);
            (rce.GetEditor("RichContentTextEditor") as RichContentTextEditor).RegisterCustomTag('Input field', 'edit', '<input type="text" class="browser-default" />',
                (editor: RichContentEditor, tag: JQuery<HTMLElement>) => { (tag as JQuery<HTMLInputElement>).val(`Inserted on ${new Date().toLocaleTimeString()}`); });
        }
        if (framework === "GridFrameworkBootstrap")
        {
            rce.GetEditor("RichContentLinkEditor").RegisterCssClasses(['float-left', 'float-right']);
            rce.GetEditor("RichContentImageEditor").RegisterCssClasses(['float-left', 'float-right', 'bordered']);
            (rce.GetEditor("RichContentTextEditor") as RichContentTextEditor).RegisterCustomTag('Input field', 'edit', '<input/>',
                (editor: RichContentEditor, tag: JQuery<HTMLElement>) => { (tag as JQuery<HTMLInputElement>).val(`Inserted on ${new Date().toLocaleTimeString()}`); });
        }
        rce.GetEditor("RichContentTableEditor").RegisterCssClasses(tableCssClasses);

        return rce;
    }
}
