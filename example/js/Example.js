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
        var options2 = {
            Language: 'EN',
            GridFramework: framework
        };
        /*const _rce2 = */
        new RichContentEditor(options2).Init('RichContentEditorCanvas2');
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
        $('#ExportXmlButton').click(function () {
            $('#ExportTextArea').val(rce.GetXml().trim());
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
        var editors = ['RichContentTextEditor', 'RichContentHeadingEditor', 'RichContentFontAwesomeIconEditor', 'RichContentLinkEditor', 'RichContentVideoEditor', 'RichContentIFrameEditor', 'RichContentBreakEditor'];
        if ($('#ImageCheckBox').prop('checked')) {
            editors.push('RichContentImageEditor');
        }
        if ($('#TablesCheckBox').prop('checked')) {
            editors.push('RichContentTableEditor');
        }
        return editors;
    };
    Editor.prototype.instantiateMainEditor = function (options) {
        var rce = new RichContentEditor(options);
        var framework = $('#Framework').val();
        var tableCssClasses = ['red', 'green', 'yellow'];
        if (framework === "GridFrameworkMaterialize") {
            tableCssClasses.push('card-panel');
            rce.GetEditor("RichContentLinkEditor").RegisterCssClasses(['left', 'right']);
            rce.GetEditor("RichContentImageEditor").RegisterCssClasses(['left', 'right']);
            rce.GetEditor("RichContentTextEditor").RegisterCustomTag('Input field', 'edit', '<input type="text" class="browser-default" />', function (editor, tag) { tag.val("Inserted on " + new Date().toLocaleTimeString()); });
        }
        if (framework === "GridFrameworkBootstrap") {
            rce.GetEditor("RichContentLinkEditor").RegisterCssClasses(['float-left', 'float-right']);
            rce.GetEditor("RichContentImageEditor").RegisterCssClasses(['float-left', 'float-right', 'bordered']);
            rce.GetEditor("RichContentTextEditor").RegisterCustomTag('Input field', 'edit', '<input/>', function (editor, tag) { tag.val("Inserted on " + new Date().toLocaleTimeString()); });
        }
        rce.GetEditor("RichContentTableEditor").RegisterCssClasses(tableCssClasses);
        rce.Init('RichContentEditorCanvas');
        return rce;
    };
    return Editor;
}());
//# sourceMappingURL=Example.js.map