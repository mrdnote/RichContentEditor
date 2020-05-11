var Editor = /** @class */ (function () {
    function Editor() {
    }
    Editor.prototype.Init = function () {
        var _this = this;
        var framework = $('#Framework').val();
        if (framework === 'GridFrameworkMaterialize') {
            window.$('select').formSelect();
        }
        var options = {
            Language: 'EN',
            UploadUrl: 'https://dnote.azurewebsites.net/api/EditorApi/Upload',
            FileListUrl: 'https://dnote.azurewebsites.net/api/EditorApi/FileList',
            GridFramework: framework,
            Editors: this.getEditors()
        };
        var rce = this.instantiateMainEditor(options);
        var options2 = {
            Language: 'EN',
            GridFramework: framework
        };
        /*const _rce2 = */
        new RichContentEditor().Init('RichContentEditorCanvas2', options2);
        $('#ImageCheckBox,#TablesCheckBox').change(function () {
            rce.Delete();
            options.Editors = _this.getEditors();
            rce = _this.instantiateMainEditor(options);
        });
        $('#Language').change(function () {
            rce.Delete();
            options.Language = $(this).val();
            rce = _this.instantiateMainEditor(options);
        });
        $('#Framework').change(function () {
            var newFramework = $(this).val();
            var page = newFramework === 'GridFrameworkBootstrap' ? 'bootstrap' : 'materialize';
            window.location.href = page + '.html';
        });
        $('#ExportButton').click(function () {
            $('#ExportTextArea').val(rce.GetHtml().trim());
            $('#ExportTextArea').removeClass('rce-hide');
            if (framework === 'GridFrameworkMaterialize') {
                window.M.textareaAutoResize($('#ExportTextArea'));
            }
        });
    };
    Editor.prototype.getEditors = function () {
        var editors = ['RichContentTextEditor'];
        if ($('#ImageCheckBox').prop('checked')) {
            editors.push('RichContentImageEditor');
        }
        if ($('#TablesCheckBox').prop('checked')) {
            editors.push('RichContentTableEditor');
        }
        return editors;
    };
    Editor.prototype.instantiateMainEditor = function (options) {
        var editor = new RichContentEditor().Init('RichContentEditorCanvas', options);
        var textEditor = editor.GetEditor('RichContentTextEditor');
        textEditor.InsertContent('<b>Welcome to DNote\'s HTML Editor.</b><div>Start by clicking the "plus"-icon below...</div >');
        return editor;
    };
    return Editor;
}());
//# sourceMappingURL=Example.js.map