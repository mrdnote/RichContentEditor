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
            UploadUrl: null,
            FileListUrl: null,
            GridFramework: framework,
            Editors: this.getEditors()
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
    }

    private getEditors(): string[]
    {
        const editors: string[] = ['RichContentTextEditor'];

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
        const textEditor = editor.GetEditor('RichContentTextEditor') as RichContentTextEditor;
        textEditor.InsertContent('<b>Welcome to DNote\'s HTML Editor.</b><div>Start by clicking the "plus"-icon below...</div >');
        return editor;
    }
}
