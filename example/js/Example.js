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
            UploadUrl: 'https://dnote.azurewebsites.net/api/EditorApi/Secret98734234Upload',
            FileListUrl: 'https://dnote.azurewebsites.net/api/EditorApi/Secret98734234FileList',
            GridFramework: framework,
            Editors: this.getEditors(),
            OnClose: this.handleClose,
            OnSave: this.handleSave
        };
        var rce = this.instantiateMainEditor(options);
        rce.GetEditor("RichContentTableEditor").RegisterCssClasses(['red', 'green', 'yellow']);
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
        $('#ContentEditButton').click(function () {
            $(this).addClass('rce-hide');
            rce = _this.instantiateMainEditor(options);
        });
    };
    Editor.prototype.handleClose = function () {
        $('#ContentEditButton').removeClass('rce-hide');
    };
    Editor.prototype.handleSave = function () {
        $('#ContentEditButton').removeClass('rce-hide');
    };
    Editor.prototype.getEditors = function () {
        var editors = ['RichContentTextEditor', 'RichContentHeadingEditor', 'RichContentFontAwesomeIconEditor', 'RichContentLinkEditor'];
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
        return editor;
    };
    return Editor;
}());
//# sourceMappingURL=Example.js.map