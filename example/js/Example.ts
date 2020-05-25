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
        rce.GetEditor("RichContentTableEditor").RegisterCssClasses(['red', 'green', 'yellow']);

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
        const editors: string[] = ['RichContentTextEditor', 'RichContentHeadingEditor', 'RichContentFontAwesomeIconEditor', 'RichContentLinkEditor'];

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
        const editor = new RichContentEditor().Init('RichContentEditorCanvas', options);
        return editor;
    }
}
