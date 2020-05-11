var KeyValue = /** @class */ (function () {
    function KeyValue() {
    }
    return KeyValue;
}());
var ContextCommand = /** @class */ (function () {
    function ContextCommand(label, iconClasses, onClick) {
        this.Label = label;
        this.IconClasses = iconClasses;
        this.OnClick = onClick;
    }
    return ContextCommand;
}());
var RichContentBaseEditor = /** @class */ (function () {
    function RichContentBaseEditor() {
    }
    RichContentBaseEditor.RegisterEditor = function (editorType) {
        RichContentBaseEditor._registrations[editorType['name']] = editorType;
    };
    RichContentBaseEditor.Create = function (editor) {
        if (!RichContentBaseEditor._registrations.hasOwnProperty(editor))
            throw "RichContentBaseEditor " + editor + " not registered!";
        return new RichContentBaseEditor._registrations[editor];
    };
    RichContentBaseEditor.GetRegistrations = function () {
        return this._registrations;
    };
    RichContentBaseEditor.prototype.Init = function (richContentEditor) {
        this.Name = this.constructor['name'];
        this.RichContentEditorInstance = richContentEditor;
    };
    RichContentBaseEditor.prototype.GetMenuLabel = function () {
        throw new Error("GetMenuLabel() not implemented in " + this.constructor['name'] + "!");
    };
    RichContentBaseEditor.prototype.GetMenuIconClasses = function () {
        throw new Error("GetMenuIconClasses() not implemented in " + this.constructor['name'] + "!");
    };
    RichContentBaseEditor.prototype.GetContextButtonText = function (_elem) {
        throw new Error("GetContextButtonText() not implemented in " + this.constructor['name'] + "!");
    };
    RichContentBaseEditor.prototype.GetContextCommands = function (_elem) {
        return null;
    };
    RichContentBaseEditor.prototype.AllowInTableCell = function () {
        return false;
    };
    RichContentBaseEditor.prototype.Clean = function (_elem) {
    };
    RichContentBaseEditor.prototype.SetupEditor = function (elem, keepWhenCleaning) {
        if (keepWhenCleaning === void 0) { keepWhenCleaning = false; }
        var _this = this;
        elem.addClass('rce-editor-wrapper');
        if (keepWhenCleaning)
            elem.addClass('rce-editor-wrapper-keep');
        var menuButtonText = _this.GetContextButtonText(elem);
        var menuButton = $("<button type=\"button\" class=\"hover-button rce-menu-button\">" + menuButtonText + "\u25C0</button>");
        elem.prepend(menuButton);
        menuButton.click(function () {
            _this.showContextMenu(elem, menuButton.offset().left, menuButton.offset().top);
        });
        elem.bind('contextmenu', function (e) {
            e.preventDefault();
            e.stopPropagation();
            _this.showContextMenu(elem, e.clientX, e.clientY);
        });
    };
    RichContentBaseEditor.prototype.showContextMenu = function (elem, left, top) {
        var _this = this;
        this.RichContentEditorInstance.CloseAllMenus();
        var menu = $('<div class="rce-menu"></ul>');
        var commands = this.GetContextCommands(elem);
        if (commands !== null) {
            var _loop_1 = function (i) {
                var command = commands[i];
                var item = $("<button type=\"button\" class=\"rce-menu-item\"><i class=\"rce-menu-icon " + command.IconClasses + "\"></i> <span class=\"rce-menu-label\">" + command.Label + "</span></button>");
                item.click(function (e) {
                    e.preventDefault();
                    command.OnClick(elem);
                    menu.remove();
                });
                menu.append(item);
            };
            for (var i = 0; i < commands.length; i++) {
                _loop_1(i);
            }
        }
        var deleteItem = $("<button type=\"button\" href=\"javascript:\" class=\"rce-menu-item\"><i class=\"rce-menu-icon fas fa-trash\"></i> <span>" + _this.RichContentEditorInstance.Locale.Delete + "</span></button>");
        deleteItem.click(function () { _this.OnDelete(elem), menu.remove(); });
        menu.append(deleteItem);
        menu.css({ left: left, top: top });
        $('body').append(menu);
    };
    RichContentBaseEditor.prototype.OnDelete = function (elem) {
        elem.remove();
    };
    RichContentBaseEditor.prototype.Insert = function (_targetElement) {
        // nothing in base class
    };
    RichContentBaseEditor.prototype.Attach = function (element, target) {
        var addButton = target.find('.add-button');
        if (addButton.length) {
            element.insertBefore(addButton);
        }
        else {
            target.append(element);
        }
        this.SetupEditor(element);
    };
    RichContentBaseEditor._registrations = {};
    return RichContentBaseEditor;
}());
//# sourceMappingURL=RichContentBaseEditor.js.map
var RichContentEditorOptions = /** @class */ (function () {
    function RichContentEditorOptions() {
        /**
         * The language to display the editor in.
         */
        this.Language = "EN";
        this.UploadUrl = null;
        this.FileListUrl = null;
        this.GridFramework = null;
        this.Editors = null;
    }
    return RichContentEditorOptions;
}());
var GridFrameworkBase = /** @class */ (function () {
    function GridFrameworkBase() {
    }
    GridFrameworkBase.Create = function (gridFramework) {
        if (gridFramework === null) {
            return new GridFrameworkBase();
        }
        if (!GridFrameworkBase._registrations.hasOwnProperty(gridFramework))
            throw "GridFrameworkBase " + gridFramework + " not registered!";
        return new GridFrameworkBase._registrations[gridFramework];
    };
    GridFrameworkBase.Register = function (gridFramework) {
        GridFrameworkBase._registrations[gridFramework['name']] = gridFramework;
    };
    GridFrameworkBase.prototype.GetRightAlignClass = function () {
        return null;
    };
    GridFrameworkBase.prototype.GetLeftAlignClass = function () {
        return null;
    };
    GridFrameworkBase.prototype.GetRightAlignCss = function () {
        var kv = {
            Key: 'float',
            Value: 'left'
        };
        return kv;
    };
    GridFrameworkBase.prototype.GetLeftAlignCss = function () {
        var kv = {
            Key: 'float',
            Value: 'right'
        };
        return kv;
    };
    GridFrameworkBase.prototype.UpdateFields = function () {
    };
    GridFrameworkBase.prototype.GetRowClass = function () {
        return "rce-row";
    };
    GridFrameworkBase.prototype.GetColumnClass = function (width) {
        return "rce-col rce-col-s" + width;
    };
    GridFrameworkBase.prototype.GetSmallPrefix = function () {
        return 'rce-col-s';
    };
    GridFrameworkBase.prototype.GetMediumPrefix = function () {
        return 'rce-col-m';
    };
    GridFrameworkBase.prototype.GetLargePrefix = function () {
        return 'rce-col-l';
    };
    GridFrameworkBase.prototype.GetExtraLargePrefix = function () {
        return 'rce-col-xl';
    };
    GridFrameworkBase.prototype.GetPreviousSize = function (size) {
        if (size === 'm') {
            return 's';
        }
        else if (size === 'l') {
            return 'm';
        }
        else if (size === 'xl') {
            return 'l';
        }
    };
    GridFrameworkBase.prototype.GetColumnCount = function () {
        return 12;
    };
    GridFrameworkBase._registrations = {};
    return GridFrameworkBase;
}());
var FileManager = /** @class */ (function () {
    function FileManager(richContentEditor, language) {
        this._richContentEditor = richContentEditor;
        if (!FileManager._localeRegistrations.hasOwnProperty(language))
            throw "FileManager locale for language " + language + " not registered!";
        this.Locale = new FileManager._localeRegistrations[language]();
    }
    FileManager.RegisterLocale = function (localeType, language) {
        FileManager._localeRegistrations[language] = localeType;
    };
    FileManager.prototype.updateFileList = function (gridSelector, dialog) {
        $('.file-table', dialog).empty().text('Loading...');
        var _this = this;
        $.ajax({
            url: this._richContentEditor.Options.FileListUrl,
            type: 'GET',
            processData: false,
            contentType: false,
            error: function (xhr, _textStatus, _errorThrown) {
                _this._richContentEditor.DialogManager.ShowErrorDialog(gridSelector, xhr.responseJSON.title);
            },
            success: function (data) {
                $('.file-table', dialog).empty();
                var rows = data;
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    var rowDiv = $("<div class=\"row\"><div class=\"col s12\"><span class=\"item-title\">" + row.name + "</span><a href=\"" + row.uri + "\" target=\"_blank\" class=\"rce-right\"><i class=\"fas fa-external-link-alt\"></i></a></div></div>");
                    $('.file-table', dialog).append(rowDiv);
                }
                $('.file-table .col', dialog).click(function () {
                    var url = $(this).closest('.col').find('a').attr('href');
                    $(gridSelector + '_SelectedUrl').val(url);
                });
            },
        });
    };
    FileManager.prototype.ShowFileSelectionDialog = function (action) {
        var _this_1 = this;
        var gridSelector = this._richContentEditor.GridSelector;
        var dialog = this.getFileSelectionDialog();
        if (!this._richContentEditor.Options.UploadUrl)
            dialog.find("a[href=\"#" + this._richContentEditor.EditorId + "_ByUpload\"]").closest('li').addClass('rce-hide');
        if (!this._richContentEditor.Options.FileListUrl)
            dialog.find("a[href=\"#" + this._richContentEditor.EditorId + "_BySelection\"]").closest('li').addClass('rce-hide');
        this._richContentEditor.DialogManager.ShowDialog(dialog, function (dialog) {
            var tab = $('.rce-tab-body.active', dialog);
            var valid = _this_1._richContentEditor.DialogManager.ValidateFields(gridSelector, $('input', tab));
            if (!valid)
                return;
            var url = $('.image-url', tab).val().toString();
            var ok = action(url);
            if (!ok)
                return false;
            $('.image-url', dialog).val('');
            $('.uploaded-url input', dialog).val('');
            return true;
        });
    };
    FileManager.prototype.getFileSelectionDialog = function () {
        var _this = this;
        var editorId = this._richContentEditor.EditorId;
        var dialog = $('#' + editorId + ' .file-dialog');
        if (!dialog.length) {
            dialog = $(this.getFileSelectionDialogHtml(this._richContentEditor.EditorId));
            dialog.appendTo($('#' + editorId));
            $('.rce-tabs .rce-tab a', dialog).click(function (e) {
                e.preventDefault();
                var tabs = $(this).closest('.rce-tabs').find('.rce-tab');
                tabs.removeClass('active');
                $(this).closest('.rce-tab').addClass('active');
                var href = $(this).attr('href');
                var tabBodies = $(this).closest('.rce-tab-panel').find('.rce-tab-body');
                tabBodies.removeClass('active');
                $(href).addClass('active');
            });
            $('input:file', dialog).change(function () {
                if ($(this).val()) {
                    $('.upload-button', dialog).removeAttr('disabled');
                }
            });
            $('.upload-button', dialog).click(function () {
                var file = $('input:file', dialog)[0].files[0];
                if (!file) {
                    // If the file selection is cancelled, the file input is cleared but no event is raised for us to react on. Below is a fail-safe for when that situation occurs.
                    $('.upload-button', dialog).attr('disabled', 'disabled');
                    return;
                }
                var formData = new FormData();
                formData.append('file', file);
                $.ajax({
                    url: _this._richContentEditor.Options.UploadUrl,
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    error: function (xhr, _textStatus, _errorThrown) {
                        $('.file-path-wrapper-progress', dialog).css({ width: 0 });
                        _this._richContentEditor.DialogManager.ShowErrorDialog('#' + _this._richContentEditor.EditorId, xhr.responseJSON.title);
                    },
                    success: function (data) {
                        $('.file-path-wrapper-progress', dialog).css({ width: 0 });
                        $('input:file', dialog).val('');
                        $('.file-path', dialog).val('');
                        $('.uploaded-url input', dialog).val(data.toString());
                    },
                    xhr: function () {
                        var xhr = new window.XMLHttpRequest();
                        xhr.upload.addEventListener("loadstart", function (_evt) {
                            $('.upload-button', dialog).attr('disabled', 'disabled');
                        }, false);
                        xhr.upload.addEventListener("progress", function (evt) {
                            if (evt.lengthComputable) {
                                var percentComplete = evt.loaded / evt.total;
                                $('.file-path-wrapper-progress', dialog).css({ width: (percentComplete * 100) + '%' });
                            }
                        }, false);
                        xhr.upload.addEventListener("load", function (_evt) {
                        }, false);
                        return xhr;
                    }
                });
            });
            $("a[href=\"#" + editorId + "_BySelection\"]").click(function () {
                var dialog = $(this).closest('.rce-dialog');
                _this.updateFileList('#' + _this._richContentEditor.EditorId, dialog);
            });
        }
        return dialog;
    };
    FileManager.prototype.getFileSelectionDialogHtml = function (editorId) {
        return "\n            <div class=\"rce-dialog file-dialog\">\n                <div class=\"rce-dialog-content\">\n                    <div class=\"rce-dialog-title\">" + this.Locale.FileSelectionDialogTitle + "</div>\n                    <div class=\"rce-tab-panel\" style=\"padding: 0;\">\n                        <ul class=\"rce-tabs\">\n                            <li class=\"rce-tab active\"><a href=\"#" + editorId + "_ByUrl\">" + this.Locale.ByUrlTab + "</a></li>\n                            <li class=\"rce-tab\"><a href=\"#" + editorId + "_ByUpload\">" + this.Locale.ByUploadTab + "</a></li>\n                            <li class=\"rce-tab\"><a href=\"#" + editorId + "_BySelection\">" + this.Locale.BySelectionTab + "</a></li>\n                        </ul>\n                        <div id=\"" + editorId + "_ByUrl\" class=\"rce-tab-body active\">\n                            <div class=\"rce-form-field\">\n                                <label for=\"" + editorId + "_ImageUrl\" class=\"rce-label\">" + this.Locale.UrlField + "</label>\n                                <input id=\"" + editorId + "_ImageUrl\" class=\"image-url validate rce-input\" type=\"url\" required=\"required\" />\n                                <span class=\"rce-error-text\">" + this.Locale.EnterUrlValidation + "</span>\n                            </div>\n                        </div>\n                        <div id=\"" + editorId + "_ByUpload\" class=\"rce-tab-body\">\n                            <div class=\"file-path-wrapper-with-progress\">\n                                <input type=\"file\" class=\"rce-left\">\n                                <div class=\"rce-right\">\n                                    <button type=\"button\" class=\"rce-button upload-button\" style=\"width: 100%;\" disabled=\"disabled\">" + this.Locale.UploadButton + "</button>\n                                </div>\n                                <div class=\"file-path-wrapper-progress\"></div>\n                                <div class=\"rce-clear\"></div>\n                            </div>\n                            <div class=\"rce-form-field uploaded-url\">\n                                <label for=\"" + editorId + "_UploadedUrl\" class=\"rce-label\">" + this.Locale.UrlField + "</label>\n                                <input id=\"" + editorId + "_UploadedUrl\" type=\"url\" class=\"validate readonly image-url rce-input\" required=\"required\" placeholder=\"" + this.Locale.NoUploadPlaceholder + "\" />\n                                <span class=\"rce-error-text\">" + this.Locale.UploadValidation + "</span>\n                            </div>\n                        </div>\n                        <div id=\"" + editorId + "_BySelection\" class=\"rce-tab-body\">\n                            <div class=\"file-table\">\n                                " + this.Locale.LoadingProgressMessage + "\n                            </div>\n                            <div class=\"rce-form-field uploaded-url\">\n                                <label for=\"" + editorId + "_SelectedUrl\" class=\"rce-label\">" + this.Locale.UrlField + "</label>\n                                <input id=\"" + editorId + "_SelectedUrl\" type=\"url\" class=\"validate readonly image-url rce-input\" required=\"required\" placeholder=\"" + this.Locale.NoSelectionPlaceholder + "\" />\n                                <span class=\"rce-error-text\">" + this.Locale.SelectValidation + "</span>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n                <div class=\"rce-dialog-footer\">\n                    <a href=\"javascript:\" class=\"rce-button rce-button-flat rce-close-dialog\">" + this._richContentEditor.DialogManager.Locale.DialogCancelButton + "</a>\n                    <a href=\"javascript:\" class=\"rce-button rce-submit-dialog\">" + this._richContentEditor.DialogManager.Locale.DialogSaveButton + "</a>\n                </div>\n            </div>";
    };
    FileManager._localeRegistrations = {};
    return FileManager;
}());
var RichContentEditor = /** @class */ (function () {
    function RichContentEditor() {
        this.RegisteredEditors = [];
        this.FileManager = null;
        this.DialogManager = null;
        this.GridFramework = null;
    }
    RichContentEditor.RegisterLocale = function (localeType, language) {
        RichContentEditor._localeRegistrations[language] = localeType;
    };
    RichContentEditor.prototype.GetEditor = function (editor) {
        for (var i = 0; i < this.RegisteredEditors.length; i++) {
            var editorInstance = this.RegisteredEditors[i];
            if (editorInstance['Name'] === editor)
                return editorInstance;
        }
        return null;
    };
    RichContentEditor.prototype.Init = function (editorId, options) {
        var _this = this;
        if (!options) {
            options = new RichContentEditorOptions();
        }
        this.EditorId = editorId;
        var gridSelector = '#' + editorId;
        this.GridSelector = gridSelector;
        this.Options = options;
        this.Locale = new RichContentEditor._localeRegistrations[options.Language]();
        this.GridFramework = GridFrameworkBase.Create(options.GridFramework);
        this.FileManager = new FileManager(this, options.Language);
        this.DialogManager = new DialogManager(this, options.Language);
        var editorElement = $(HtmlTemplates.GetMainEditorTemplate(editorId));
        editorElement.data('orig', $(gridSelector));
        $(gridSelector).replaceWith(editorElement);
        $(gridSelector + ' .rce-editor-preview').mousedown(function () {
            $(gridSelector).removeClass('edit-mode');
        });
        $(gridSelector + ' .rce-editor-preview').mouseup(function () {
            $(gridSelector).addClass('edit-mode');
        });
        $(gridSelector + ' .rce-editor-preview').mouseout(function () {
            $(gridSelector).addClass('edit-mode');
        });
        $(gridSelector + ' .rce-editor-save').click(function () {
            _this.Save();
        });
        $(gridSelector + ' .rce-editor-preview-lock').click(function () {
            $(gridSelector + ' .rce-editor-preview').attr('disabled', 'disabled');
            $(gridSelector + ' .rce-editor-preview-lock').addClass('rce-hide');
            $(gridSelector + ' .rce-editor-preview-unlock').removeClass('rce-hide');
            $(gridSelector).removeClass('edit-mode');
        });
        $(gridSelector + ' .rce-editor-preview-unlock').click(function () {
            $(gridSelector + ' .rce-editor-preview').removeAttr('disabled');
            $(gridSelector + ' .rce-editor-preview-lock').removeClass('rce-hide');
            $(gridSelector + ' .rce-editor-preview-unlock').addClass('rce-hide');
            $(gridSelector).addClass('edit-mode');
        });
        $(gridSelector + ' .add-button').click(function () {
            _this.CloseAllMenus();
            _this.showAddMenu($(this).offset().left, $(this).offset().top);
        });
        var grid = $(gridSelector + ' .rce-grid');
        window.Sortable.create(grid[0], {
            draggable: '.rce-editor-wrapper'
        });
        $(document).click(function (e) {
            var target = $(e.target);
            if (!target.hasClass('rce-menu-button') && target.closest('.rce-menu,.rce-menu-button').length === 0)
                _this.CloseAllMenus();
        });
        $(document).keydown(function (e) {
            if (e.keyCode === 27)
                _this.CloseAllMenus();
        });
        $(gridSelector + ' input.readonly').on('keydown paste cut', function (e) {
            e.preventDefault();
        });
        grid.bind('contextmenu', function (e) {
            e.preventDefault();
            e.stopPropagation();
            _this.CloseAllMenus();
            _this.showAddMenu(e.clientX, e.clientY);
        });
        this.instantiateEditors(options.Editors);
        return this;
    };
    RichContentEditor.prototype.Delete = function () {
        var editor = $('#' + this.EditorId);
        var orig = editor.data('orig');
        editor.replaceWith(orig);
    };
    /**
     * Get the editor content as HTML.
     */
    RichContentEditor.prototype.GetHtml = function () {
        var copy = $(this.GridSelector + ' .rce-grid').clone();
        this.clean(copy);
        return copy.html();
    };
    /**
     * Save the editor content as HTML.
     */
    RichContentEditor.prototype.Save = function () {
        var html = this.GetHtml().trim();
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(html));
        pom.setAttribute('download', 'dnote.html');
        if (document.createEvent) {
            var event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            pom.dispatchEvent(event);
        }
        else {
            pom.click();
        }
    };
    RichContentEditor.prototype.clean = function (elem) {
        var _this = this;
        elem.children().each(function () {
            _this.cleanElement($(this));
        });
    };
    RichContentEditor.prototype.cleanElement = function (elem) {
        var _this = this;
        if (elem.hasClass('rce-menu-button')) {
            elem.remove();
        }
        else if (elem.hasClass('rce-editor-wrapper') && !elem.hasClass('rce-editor-wrapper-keep')) {
            _this.EliminateElement(elem);
        }
        else {
            _this.clean(elem);
        }
        elem.removeClass('rce-editor-wrapper rce-editor-wrapper-keep');
        for (var i = 0; i < this.RegisteredEditors.length; i++) {
            var editor = this.RegisteredEditors[i];
            editor.Clean(elem);
        }
    };
    RichContentEditor.prototype.EliminateElement = function (elem) {
        var _this = this;
        var children = elem.children();
        children.each(function () {
            _this.cleanElement($(this));
        });
        elem.children().detach().appendTo(elem.parent());
        elem.remove();
    };
    RichContentEditor.prototype.instantiateEditors = function (editors) {
        if (!editors) {
            var registrations = RichContentBaseEditor.GetRegistrations();
            for (var key in registrations) {
                var instance = RichContentBaseEditor.Create(key);
                instance.Init(this);
                this.RegisteredEditors.push(instance);
            }
        }
        else {
            for (var i = 0; i < editors.length; i++) {
                var instance = RichContentBaseEditor.Create(editors[i]);
                instance.Init(this);
                this.RegisteredEditors.push(instance);
            }
        }
    };
    RichContentEditor.prototype.InsertEditor = function (editorTypeName, element) {
        var editor = null;
        for (var i = 0; i < this.RegisteredEditors.length; i++) {
            var registeredEditor = this.RegisteredEditors[i];
            if (registeredEditor.Name === editorTypeName) {
                editor = registeredEditor;
            }
        }
        if (editor === null) {
            console.error("Editor with name " + editorTypeName + " not registered!");
        }
        else {
            editor.Insert(element);
        }
    };
    RichContentEditor.prototype.CloseAllMenus = function () {
        $('.rce-menu').remove();
    };
    RichContentEditor.prototype.showAddMenu = function (left, top) {
        var _this = this;
        var menu = $('<div class="rce-menu"></ul>');
        var _loop_1 = function (i) {
            var editor = this_1.RegisteredEditors[i];
            var item = $("<button type=\"button\" class=\"rce-menu-item\"><i class=\"rce-menu-icon " + editor.GetMenuIconClasses() + "\"></i> <span class=\"rce-menu-label\">" + editor.GetMenuLabel() + "</span></button>");
            item.click(function () { _this.CloseAllMenus(); editor.Insert($(_this.GridSelector + ' .rce-grid')); });
            menu.append(item);
        };
        var this_1 = this;
        for (var i = 0; i < this.RegisteredEditors.length; i++) {
            _loop_1(i);
        }
        menu.css({ left: left, top: top });
        $('body').append(menu);
    };
    RichContentEditor._localeRegistrations = {};
    return RichContentEditor;
}());
var DialogManager = /** @class */ (function () {
    function DialogManager(richContentEditor, language) {
        if (!DialogManager._localeRegistrations.hasOwnProperty(language))
            throw "DialogManager locale for language " + language + " not registered!";
        this.Locale = new DialogManager._localeRegistrations[language]();
    }
    DialogManager.RegisterLocale = function (localeType, language) {
        DialogManager._localeRegistrations[language] = localeType;
    };
    DialogManager.prototype.ShowDialog = function (dialog, onSubmit) {
        var _this = this;
        var backdrop = $('<div class="rce-modal-backdrop"></div>');
        //var gridWrapper = dialog.closest('.rce-grid-wrapper');
        backdrop.appendTo($('body'));
        dialog.data('origin', dialog.parent());
        dialog.detach().appendTo(backdrop);
        backdrop.mousedown(function (e) {
            if ($(e.target).hasClass('rce-modal-backdrop'))
                _this.CloseDialog(dialog);
        });
        if (!DialogManager._eventAttached) {
            $(document).on('keydown', _this.dialogKeyDown);
            DialogManager._eventAttached = true;
        }
        DialogManager._dialogStack.push(dialog);
        // Set backdrop to active does not trigger its transition because it has just been added to the DOM. Setting the active state using a timeout fixes this.
        window.setTimeout(function () {
            dialog.closest('.rce-modal-backdrop').addClass('active');
        }, 1);
        $('.rce-submit-dialog', dialog).off('click');
        $('.rce-close-dialog', dialog).click(function () {
            _this.CloseDialog($(this).closest('.rce-dialog'));
        });
        $('.rce-submit-dialog', dialog).off('click');
        $('.rce-submit-dialog', dialog).click(function () {
            if (onSubmit) {
                var ok = onSubmit(dialog);
                if (!ok) {
                    return;
                }
            }
            _this.CloseDialog($(this).closest('.rce-dialog'));
        });
    };
    DialogManager.prototype.ValidateFields = function (gridSelector, elem) {
        var valid = true;
        elem.each(function () {
            var input = $(this);
            var fieldValid = input[0].checkValidity();
            if (!fieldValid) {
                valid = false;
            }
            input.closest('.rce-form-field').toggleClass('invalid', !fieldValid);
        });
        if (!valid) {
            this.ShowErrorDialog(gridSelector, this.Locale.FieldValidationErrorMessage);
            return false;
        }
        return valid;
    };
    DialogManager.prototype.dialogKeyDown = function (e) {
        if (e.keyCode === 27) {
            if (DialogManager._dialogStack.length)
                this.CloseDialog(DialogManager._dialogStack.pop());
        }
    };
    DialogManager.prototype.CloseDialog = function (dialog) {
        var idx = DialogManager._dialogStack.indexOf(dialog);
        DialogManager._dialogStack = DialogManager._dialogStack.splice(idx, 1);
        var backdrop = dialog.closest('.rce-modal-backdrop').removeClass('active');
        dialog.detach().appendTo(dialog.data('origin'));
        backdrop.remove();
    };
    DialogManager.prototype.ShowErrorDialog = function (gridSelector, message) {
        var dialog = $(gridSelector + ' .error-dialog');
        if (!dialog.length) {
            dialog = $(this.getErrorDialogHtml());
            dialog.appendTo($(gridSelector));
        }
        $('.error-message', dialog).text(message);
        this.ShowDialog(dialog);
    };
    DialogManager.prototype.getErrorDialogHtml = function () {
        return "\n            <div class=\"rce-dialog error-dialog\">\n                <div class=\"rce-dialog-content\">\n                    <div class=\"rce-dialog-title\">" + this.Locale.ErrorDialogTitle + "</div>\n                    <p class=\"error-message\"></p>\n                </div>\n                <div class=\"rce-dialog-footer\">\n                    <a href=\"javascript:\" class=\"rce-button rce-button-flat rce-close-dialog\">OK</a>\n                </div>\n            </div>";
    };
    DialogManager._dialogStack = [];
    DialogManager._eventAttached = false;
    DialogManager._localeRegistrations = {};
    return DialogManager;
}());
var HtmlTemplates = /** @class */ (function () {
    function HtmlTemplates() {
    }
    HtmlTemplates.GetMainEditorTemplate = function (id) {
        return "\n            <div id=\"" + id + "\" class=\"rce-grid-wrapper edit-mode\">\n                <div class=\"rce-grid\">\n                    <a class=\"rce-button rce-button-flat rce-menu-button add-button\"><i class=\"fas fa-plus-circle\"></i></a>\n                </div>\n\n                <div class=\"rce-editor-top-icons\">\n                    <button type=\"button\" class=\"rce-button rce-button-toolbar rce-editor-save\"><i class=\"fas fa-save\"></i></button>\n                    <button type=\"button\" class=\"rce-button rce-button-toolbar rce-editor-preview\"><i class=\"fas fa-eye\"></i></button>\n                    <button type=\"button\" class=\"rce-button rce-button-toolbar rce-editor-preview-lock\"><i class=\"fas fa-lock-open\"></i></button>\n                    <button type=\"button\" class=\"rce-button rce-button-toolbar rce-editor-preview-unlock rce-hide\"><i class=\"fas fa-lock\"></i></button>\n                </div>\n            </div>";
    };
    return HtmlTemplates;
}());
//# sourceMappingURL=RichContentEditor.js.map
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var RichContentTextEditor = /** @class */ (function (_super) {
    __extends(RichContentTextEditor, _super);
    function RichContentTextEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RichContentTextEditor.RegisterLocale = function (localeType, language) {
        RichContentTextEditor._localeRegistrations[language] = localeType;
    };
    RichContentTextEditor.prototype.Init = function (richContentEditor) {
        _super.prototype.Init.call(this, richContentEditor);
        this._locale = new RichContentTextEditor._localeRegistrations[richContentEditor.Options.Language]();
    };
    RichContentTextEditor.prototype.Insert = function (targetElement) {
        this.InsertContent(null, targetElement);
    };
    RichContentTextEditor.prototype.InsertContent = function (html, targetElement) {
        _super.prototype.Insert.call(this, targetElement);
        if (!html)
            html = '';
        var textArea = $("<div class=\"rce-textarea-editor\" contenteditable=\"true\">" + html + "</div>");
        var textAreaWrapper = $('<div class="rce-textarea-wrapper"></div>');
        textAreaWrapper.append(textArea);
        if (!targetElement) {
            targetElement = $('.rce-grid', this.RichContentEditorInstance.GridSelector);
        }
        this.Attach(textAreaWrapper, targetElement);
        textAreaWrapper.find('.rce-textarea-editor').focus();
        textArea[0].onpaste = function (e) {
            e.preventDefault();
            var text = e.clipboardData.getData('text/plain');
            var selection = window.getSelection();
            if (!selection.rangeCount)
                return false;
            selection.deleteFromDocument();
            selection.getRangeAt(0).insertNode(document.createTextNode(text));
        };
    };
    RichContentTextEditor.prototype.GetMenuLabel = function () {
        return this._locale.MenuLabel;
    };
    RichContentTextEditor.prototype.GetMenuIconClasses = function () {
        return 'fas fa-font';
    };
    RichContentTextEditor.prototype.AllowInTableCell = function () {
        return true;
    };
    RichContentTextEditor.prototype.Clean = function (elem) {
        elem.removeClass('rce-textarea-editor');
        if (elem.attr('class') === '')
            elem.removeAttr('class');
        elem.removeAttr('contenteditable');
        _super.prototype.Clean.call(this, elem);
    };
    RichContentTextEditor.prototype.GetContextButtonText = function (_elem) {
        return 'A';
    };
    RichContentTextEditor.prototype.GetContextCommands = function (_elem) {
        var boldCommand = new ContextCommand(this._locale.Bold, 'fas fa-bold', function (elem) {
            elem.find('.rce-textarea-editor').focus();
            document.execCommand('bold', false, null);
        });
        var italicCommand = new ContextCommand(this._locale.Italic, 'fas fa-italic', function (elem) {
            elem.find('.rce-textarea-editor').focus();
            document.execCommand('italic', false, null);
        });
        var ulCommand = new ContextCommand(this._locale.UnorderedList, 'fas fa-list-ul', function (elem) {
            elem.find('.rce-textarea-editor').focus();
            document.execCommand('insertUnorderedList', false, null);
            // Fix for materialize
            elem.find('ul').addClass('browser-default');
        });
        var olCommand = new ContextCommand(this._locale.OrderedList, 'fas fa-list-ol', function (elem) {
            elem.find('.rce-textarea-editor').focus();
            document.execCommand('insertOrderedList', false, null);
        });
        return [boldCommand, italicCommand, ulCommand, olCommand];
    };
    RichContentTextEditor._localeRegistrations = {};
    return RichContentTextEditor;
}(RichContentBaseEditor));
RichContentBaseEditor.RegisterEditor(RichContentTextEditor);
//# sourceMappingURL=RichContentTextEditor.js.map
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var RichContentImageEditor = /** @class */ (function (_super) {
    __extends(RichContentImageEditor, _super);
    function RichContentImageEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RichContentImageEditor.RegisterLocale = function (localeType, language) {
        RichContentImageEditor._localeRegistrations[language] = localeType;
    };
    RichContentImageEditor.prototype.Init = function (richContentEditor) {
        _super.prototype.Init.call(this, richContentEditor);
        this._locale = new RichContentImageEditor._localeRegistrations[richContentEditor.Options.Language]();
    };
    RichContentImageEditor.prototype.Insert = function (targetElement) {
        var _this = this;
        _super.prototype.Insert.call(this, targetElement);
        if (!targetElement) {
            targetElement = $('.rce-grid', this.RichContentEditorInstance.GridSelector);
        }
        this._appendElement = targetElement;
        this.RichContentEditorInstance.FileManager.ShowFileSelectionDialog(function (url) { _this.onSelect(url); return true; });
    };
    RichContentImageEditor.prototype.onSelect = function (url) {
        var img = $('<img class="rce-image"></img>');
        img.attr('src', url);
        var imgWrapper = $('<div class="rce-image-wrapper rce-image-block"></div>');
        imgWrapper.append(img);
        this.Attach(imgWrapper, this._appendElement);
    };
    RichContentImageEditor.prototype.GetMenuLabel = function () {
        return this._locale.MenuLabel;
    };
    RichContentImageEditor.prototype.GetMenuIconClasses = function () {
        return 'fas fa-image';
    };
    RichContentImageEditor.prototype.AllowInTableCell = function () {
        return true;
    };
    RichContentImageEditor.prototype.Clean = function (elem) {
        var wrapper = elem.closest('.rce-image-wrapper');
        if (wrapper.hasClass('rce-image-left'))
            elem.addClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass());
        if (wrapper.hasClass('rce-image-right'))
            elem.addClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass());
        elem.removeClass('rce-image');
        if (elem.attr('class') === '')
            elem.removeAttr('class');
        elem.removeAttr('draggable');
        _super.prototype.Clean.call(this, elem);
    };
    RichContentImageEditor.prototype.GetContextButtonText = function (_elem) {
        return 'img';
    };
    RichContentImageEditor.prototype.GetContextCommands = function (_elem) {
        var leftCommand = new ContextCommand(this._locale.AlignLeftMenuLabel, 'fas fa-arrow-left', function (elem) {
            elem.removeClass('rce-image-block rce-image-right').addClass('rce-image-left');
        });
        var rightCommand = new ContextCommand(this._locale.AlignRightMenuLabel, 'fas fa-arrow-right', function (elem) {
            elem.removeClass('rce-image-block rce-image-left').addClass('rce-image-right');
        });
        var blockCommand = new ContextCommand(this._locale.BlockAlignMenuLabel, 'fas fa-arrows-alt-h', function (elem) {
            elem.removeClass('rce-image-left rce-image-right').addClass('rce-image-block');
        });
        return [leftCommand, rightCommand, blockCommand];
    };
    RichContentImageEditor._localeRegistrations = {};
    return RichContentImageEditor;
}(RichContentBaseEditor));
RichContentBaseEditor.RegisterEditor(RichContentImageEditor);
//# sourceMappingURL=RichContentImageEditor.js.map
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var RichContentTableEditor = /** @class */ (function (_super) {
    __extends(RichContentTableEditor, _super);
    function RichContentTableEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RichContentTableEditor.RegisterLocale = function (localeType, language) {
        RichContentTableEditor._localeRegistrations[language] = localeType;
    };
    RichContentTableEditor.prototype.Init = function (richContentEditor) {
        _super.prototype.Init.call(this, richContentEditor);
        var _this = this;
        this._locale = new RichContentTableEditor._localeRegistrations[richContentEditor.Options.Language]();
    };
    RichContentTableEditor.prototype.OnDelete = function (elem) {
        // Override OnDelete to remove the entire table if, after removing the row, there are no more rows left
        if (elem.hasClass('row') && elem.parent().find('.row').length < 2) {
            elem.closest('.rce-table-wrapper').remove();
        }
        else {
            _super.prototype.OnDelete.call(this, elem);
        }
    };
    RichContentTableEditor.prototype.Insert = function (targetElement) {
        _super.prototype.Insert.call(this, targetElement);
        var tableWrapper = $('<div class="rce-table-wrapper"></div>');
        var table = $('<div class="rce-table"></div>');
        this.addTableRow(table);
        tableWrapper.append(table);
        if (!targetElement) {
            targetElement = $('.rce-grid', this.RichContentEditorInstance.GridSelector);
        }
        this.Attach(tableWrapper, targetElement);
    };
    RichContentTableEditor.prototype.Clean = function (elem) {
        if (elem.hasClass('inner') && elem.parent().hasClass('col')) {
            this.RichContentEditorInstance.EliminateElement(elem);
        }
        if (elem.hasClass('rce-table')) {
            this.RichContentEditorInstance.EliminateElement(elem);
        }
        _super.prototype.Clean.call(this, elem);
    };
    RichContentTableEditor.prototype.addTableRow = function (table) {
        var _this = this;
        var rowClass = _this.RichContentEditorInstance.GridFramework.GetRowClass();
        var row = $("<div class=\"" + rowClass + "\"></div>");
        _this.addTableColumn(row);
        table.append(row);
        _this.SetupEditor(row, true);
        window.Sortable.create(row[0], {
            group: 'row-content',
            draggable: '.rce-editor-wrapper'
        });
        window.Sortable.create(row.closest('.rce-table')[0], {
            group: 'table-content',
            draggable: '.rce-editor-wrapper'
        });
    };
    RichContentTableEditor.prototype.addTableColumn = function (row) {
        var _this = this;
        var newWidth = 12;
        var cols = row.find('.col');
        if (cols.length > 0) {
            var totalWidth_1 = 0;
            cols.each(function () {
                totalWidth_1 += _this.getTableColumnWidth($(this), 's', true);
            });
            if (totalWidth_1 % 12 !== 0) {
                newWidth = 12 - totalWidth_1 % 12;
            }
        }
        var inner = $('<div class="inner"></div>');
        var colClass = _this.RichContentEditorInstance.GridFramework.GetColumnClass(newWidth);
        var col = $("<div class=\"" + colClass + "\"></div>");
        col.append(inner);
        window.Sortable.create(inner[0], {
            group: 'column-content',
            draggable: '.rce-editor-wrapper'
        });
        col.appendTo(row);
        this.SetupEditor(col, true);
    };
    RichContentTableEditor.prototype.getTableColumnWidth = function (col, size, exact) {
        var previousSize;
        if (!exact) {
            previousSize = this.RichContentEditorInstance.GridFramework.GetPreviousSize(size);
        }
        var classes = col.attr('class').split(' ');
        for (var index in classes) {
            var cls = classes[index];
            if (cls.substring(0, size.length) === size) {
                var w = parseInt(cls.substring(size.length));
                if (!isNaN(w)) {
                    return w;
                }
            }
        }
        if (previousSize) {
            return this.getTableColumnWidth(col, previousSize, false);
        }
        else {
            return 0;
        }
    };
    RichContentTableEditor.prototype.GetMenuLabel = function () {
        return this._locale.MenuLabel;
    };
    RichContentTableEditor.prototype.GetMenuIconClasses = function () {
        return 'fas fa-table';
    };
    RichContentTableEditor.prototype.GetContextButtonText = function (elem) {
        if (elem.hasClass('col'))
            return 'col';
        if (elem.hasClass('row'))
            return 'row';
        return 'tab';
    };
    RichContentTableEditor.prototype.GetContextCommands = function (elem) {
        if (elem.hasClass('col')) {
            return this.getColumnContextCommands(elem);
        }
        else if (elem.hasClass('row')) {
            return this.getRowContextCommands(elem);
        }
        else if (elem.hasClass('rce-table-wrapper')) {
            return this.getTableContextCommands(elem);
        }
        return [];
    };
    RichContentTableEditor.prototype.getColumnContextCommands = function (_elem) {
        var _this = this;
        var result = [];
        var editors = this.RichContentEditorInstance.RegisteredEditors;
        var gridSelector = this.RichContentEditorInstance.GridSelector;
        var _loop_1 = function (i) {
            var editor = editors[i];
            if (editor.AllowInTableCell()) {
                insertCommand = new ContextCommand(editor.GetMenuLabel(), editor.GetMenuIconClasses(), function (elem) {
                    var inner = elem.find('.inner');
                    editor.Insert(inner);
                    window.Sortable.create(inner[0], {
                        group: 'col',
                        draggable: '.rce-editor-wrapper'
                    });
                });
                result.push(insertCommand);
            }
        };
        var insertCommand;
        for (var i = 0; i < editors.length; i++) {
            _loop_1(i);
        }
        var widthCommand = new ContextCommand(this._locale.WidthMenuLabel, 'fas fa-arrows-alt-h', function (elem) {
            var dialog = _this.getColumnWidthDialog();
            $('input.rce-column-width-s', dialog).val(_this.getTableColumnWidth(elem, _this.RichContentEditorInstance.GridFramework.GetSmallPrefix(), true));
            $('input.rce-column-width-m', dialog).val(_this.getTableColumnWidth(elem, _this.RichContentEditorInstance.GridFramework.GetMediumPrefix(), false));
            $('input.rce-column-width-l', dialog).val(_this.getTableColumnWidth(elem, _this.RichContentEditorInstance.GridFramework.GetLargePrefix(), false));
            $('input.rce-column-width-xl', dialog).val(_this.getTableColumnWidth(elem, _this.RichContentEditorInstance.GridFramework.GetExtraLargePrefix(), false));
            _this.RichContentEditorInstance.GridFramework.UpdateFields();
            dialog.data('elem', elem);
            _this.RichContentEditorInstance.DialogManager.ShowDialog(dialog, function (dialog) {
                var valid = _this.RichContentEditorInstance.DialogManager.ValidateFields(gridSelector, $('input', dialog));
                if (!valid)
                    return;
                var gridFramework = _this.RichContentEditorInstance.GridFramework;
                //var elem = dialog.data('elem') as JQuery<HTMLElement>;
                elem.removeClass(gridFramework.GetSmallPrefix() + _this.getTableColumnWidth(elem, gridFramework.GetSmallPrefix(), true));
                elem.removeClass(gridFramework.GetMediumPrefix() + _this.getTableColumnWidth(elem, gridFramework.GetMediumPrefix(), true));
                elem.removeClass(gridFramework.GetLargePrefix() + _this.getTableColumnWidth(elem, gridFramework.GetLargePrefix(), true));
                elem.removeClass(gridFramework.GetExtraLargePrefix() + _this.getTableColumnWidth(elem, gridFramework.GetExtraLargePrefix(), true));
                elem.addClass(gridFramework.GetSmallPrefix() + $('input.rce-column-width-s', dialog).val());
                elem.addClass(gridFramework.GetMediumPrefix() + $('input.rce-column-width-m', dialog).val());
                elem.addClass(gridFramework.GetLargePrefix() + $('input.rce-column-width-l', dialog).val());
                elem.addClass(gridFramework.GetExtraLargePrefix() + $('input.rce-column-width-xl', dialog).val());
                _this.RichContentEditorInstance.DialogManager.CloseDialog($(gridSelector + ' .column-width-dialog'));
                return true;
            });
        });
        result.push(widthCommand);
        return result;
    };
    RichContentTableEditor.prototype.getColumnWidthDialog = function () {
        var dialog = $('#' + this.RichContentEditorInstance.EditorId + ' .column-width-dialog');
        if (!dialog.length) {
            dialog = $(this.getColumnWidthDialogHtml(this.RichContentEditorInstance.EditorId));
            dialog.appendTo($('#' + this.RichContentEditorInstance.EditorId));
        }
        return dialog;
    };
    RichContentTableEditor.prototype.getRowContextCommands = function (_elem) {
        var _this = this;
        var result = [];
        var insertColumnCommand = new ContextCommand(this._locale.InsertColumnMenuLabel, 'fas fa-indent', function (elem) {
            _this.addTableColumn(elem);
            window.Sortable.create(elem[0], {
                group: 'row-content',
                draggable: '.rce-editor-wrapper'
            });
        });
        result.push(insertColumnCommand);
        return result;
    };
    RichContentTableEditor.prototype.getTableContextCommands = function (_elem) {
        var _this = this;
        var result = [];
        var insertRowCommand = new ContextCommand(this._locale.InsertRowMenuLabel, 'fas fa-indent', function (elem) {
            _this.addTableRow(elem.find('.rce-table'));
        });
        result.push(insertRowCommand);
        return result;
    };
    RichContentTableEditor.prototype.getColumnWidthDialogHtml = function (id) {
        var validateWidthMessage = this._locale.ValidateWidthMessage.replace('{0}', this.RichContentEditorInstance.GridFramework.GetColumnCount().toString());
        return "\n            <div class=\"rce-dialog column-width-dialog\">\n                <div class=\"rce-dialog-content\">\n                    <div class=\"rce-dialog-title\">" + this._locale.ColumnWidthDialogTitle + "</div>\n                    <div class=\"rce-form-field rce-form-field-inline\">\n                        <label for=\"" + id + "_WidthS\" class=\"rce-label\">" + this._locale.ColumnWidthSmall + "</label>\n                        <input id=\"" + id + "_WidthS\" class=\"validate rce-input rce-column-width-s browser-default\" type=\"number\" required=\"required\" max=\"" + this.RichContentEditorInstance.GridFramework.GetColumnCount() + "\" />\n                        <span class=\"rce-error-text\">" + validateWidthMessage + "</span>\n                    </div>\n                    <div class=\"rce-form-field rce-form-field-inline\">\n                        <label for=\"" + id + "_WidthM\" class=\"rce-label\">" + this._locale.ColumnWidthMedium + "</label>\n                        <input id=\"" + id + "_WidthM\" class=\"validate rce-input rce-column-width-m browser-default\" type=\"number\" required=\"required\" max=\"" + this.RichContentEditorInstance.GridFramework.GetColumnCount() + "\" />\n                        <span class=\"rce-error-text\">" + validateWidthMessage + "</span>\n                    </div>\n                    <div class=\"rce-form-field rce-form-field-inline\">\n                        <label for=\"" + id + "_WidthL\" class=\"rce-label\">" + this._locale.ColumnWidthTablet + "</label>\n                        <input id=\"" + id + "_WidthL\" class=\"validate rce-input rce-column-width-l browser-default\" type=\"number\" required=\"required\" max=\"" + this.RichContentEditorInstance.GridFramework.GetColumnCount() + "\" />\n                        <span class=\"rce-error-text\">" + validateWidthMessage + "</span>\n                    </div>\n                    <div class=\"rce-form-field rce-form-field-inline\">\n                        <label for=\"" + id + "_WidthXL\" class=\"rce-label\">" + this._locale.ColumnWidthDesktop + "</label>\n                        <input id=\"" + id + "_WidthXL\" class=\"validate rce-input  rce-column-width-xl browser-default\" type=\"number\" required=\"required\" max=\"" + this.RichContentEditorInstance.GridFramework.GetColumnCount() + "\" />\n                        <span class=\"rce-error-text\">" + validateWidthMessage + "</span>\n                    </div>\n                </div>\n                <div class=\"rce-dialog-footer\">\n                    <a href=\"javascript:\" class=\"rce-button rce-button-flat rce-close-dialog\">" + this.RichContentEditorInstance.DialogManager.Locale.DialogCancelButton + "</a>\n                    <a href=\"javascript:\" class=\"rce-button rce-submit-dialog\">" + this.RichContentEditorInstance.DialogManager.Locale.DialogSaveButton + "</a>\n                </div>\n            </div>";
    };
    RichContentTableEditor._localeRegistrations = {};
    return RichContentTableEditor;
}(RichContentBaseEditor));
RichContentBaseEditor.RegisterEditor(RichContentTableEditor);
//# sourceMappingURL=RichContentTableEditor.js.map
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var GridFrameworkBootstrap = /** @class */ (function (_super) {
    __extends(GridFrameworkBootstrap, _super);
    function GridFrameworkBootstrap() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GridFrameworkBootstrap.prototype.GetRowClass = function () {
        return 'row';
    };
    GridFrameworkBootstrap.prototype.GetColumnClass = function (width) {
        return "col col-" + width + " col-md-" + width + " col-lg-" + width + " col-xl-" + width;
    };
    GridFrameworkBootstrap.prototype.GetSmallPrefix = function () {
        return 'col-';
    };
    GridFrameworkBootstrap.prototype.GetMediumPrefix = function () {
        return 'col-md-';
    };
    GridFrameworkBootstrap.prototype.GetLargePrefix = function () {
        return 'col-lg-';
    };
    GridFrameworkBootstrap.prototype.GetExtraLargePrefix = function () {
        return 'col-xl-';
    };
    GridFrameworkBootstrap.prototype.GetRightAlignClass = function () {
        return 'pull-right';
    };
    GridFrameworkBootstrap.prototype.GetLeftAlignClass = function () {
        return 'pull-left';
    };
    GridFrameworkBootstrap.prototype.GetRightAlignCss = function () {
        return null;
    };
    GridFrameworkBootstrap.prototype.GetLeftAlignCss = function () {
        return null;
    };
    return GridFrameworkBootstrap;
}(GridFrameworkBase));
GridFrameworkBase.Register(GridFrameworkBootstrap);
//# sourceMappingURL=GridFrameworkBootstrap.js.map
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var GridFrameworkMaterialize = /** @class */ (function (_super) {
    __extends(GridFrameworkMaterialize, _super);
    function GridFrameworkMaterialize() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GridFrameworkMaterialize.prototype.UpdateFields = function () {
        window.M.updateTextFields();
    };
    GridFrameworkMaterialize.prototype.GetRowClass = function () {
        return 'row';
    };
    GridFrameworkMaterialize.prototype.GetColumnClass = function (width) {
        return "col s" + width + " m" + width + " l" + width + " xl" + width;
    };
    GridFrameworkMaterialize.prototype.GetSmallPrefix = function () {
        return 's';
    };
    GridFrameworkMaterialize.prototype.GetMediumPrefix = function () {
        return 'm';
    };
    GridFrameworkMaterialize.prototype.GetLargePrefix = function () {
        return 'l';
    };
    GridFrameworkMaterialize.prototype.GetExtraLargePrefix = function () {
        return 'xl';
    };
    GridFrameworkMaterialize.prototype.GetPreviousSize = function (size) {
        if (size === 'm') {
            return 's';
        }
        if (size === 'l') {
            return 'm';
        }
        if (size === 'xl') {
            return 'l';
        }
    };
    GridFrameworkMaterialize.prototype.GetRightAlignClass = function () {
        return 'right';
    };
    GridFrameworkMaterialize.prototype.GetLeftAlignClass = function () {
        return 'left';
    };
    GridFrameworkMaterialize.prototype.GetRightAlignCss = function () {
        return null;
    };
    GridFrameworkMaterialize.prototype.GetLeftAlignCss = function () {
        return null;
    };
    return GridFrameworkMaterialize;
}(GridFrameworkBase));
GridFrameworkBase.Register(GridFrameworkMaterialize);
//# sourceMappingURL=GridFrameworkMaterialize.js.map
var DialogManagerLocale = /** @class */ (function () {
    function DialogManagerLocale() {
        this.DialogSaveButton = "Save";
        this.DialogCancelButton = "Cancel";
        this.ErrorDialogTitle = "Error";
        this.FieldValidationErrorMessage = 'One or more fields with errors encountered. Correct the errors and try again.';
    }
    return DialogManagerLocale;
}());
DialogManager.RegisterLocale(DialogManagerLocale, 'EN');
//# sourceMappingURL=DialogManagerLocaleEN.js.map
var FileManagerLocale = /** @class */ (function () {
    function FileManagerLocale() {
        this.FileSelectionDialogTitle = "Insert Image";
        this.ByUrlTab = "By URL";
        this.ByUploadTab = "By Upload";
        this.BySelectionTab = "Select File";
        this.UrlField = "Image URL";
        this.UploadButton = "Upload";
        this.NoUploadPlaceholder = "No file uploaded...";
        this.NoSelectionPlaceholder = "No file selected...";
        this.EnterUrlValidation = "Enter a correct file URL";
        this.UploadValidation = "Upload a file to continue";
        this.SelectValidation = "Select a file to continue";
        this.LoadingProgressMessage = "Loading...";
    }
    return FileManagerLocale;
}());
FileManager.RegisterLocale(FileManagerLocale, 'EN');
//# sourceMappingURL=FileManagerLocaleEN.js.map
var RichContentEditorLocale = /** @class */ (function () {
    function RichContentEditorLocale() {
        this.Delete = "Delete";
    }
    return RichContentEditorLocale;
}());
RichContentEditor.RegisterLocale(RichContentEditorLocale, 'EN');
//# sourceMappingURL=RichContentEditorLocaleEN.js.map
var RichContentImageEditorLocale = /** @class */ (function () {
    function RichContentImageEditorLocale() {
        this.MenuLabel = "Image";
        this.AlignLeftMenuLabel = "Align Left";
        this.AlignRightMenuLabel = "Align Right";
        this.BlockAlignMenuLabel = "Full Width";
    }
    return RichContentImageEditorLocale;
}());
RichContentImageEditor.RegisterLocale(RichContentImageEditorLocale, 'EN');
//# sourceMappingURL=RichContentImageEditorLocaleEN.js.map
var RichContentTableEditorLocale = /** @class */ (function () {
    function RichContentTableEditorLocale() {
        this.MenuLabel = "Table";
        this.WidthMenuLabel = "Change Width";
        this.InsertColumnMenuLabel = "Insert Column";
        this.InsertRowMenuLabel = "Insert Row";
        this.ColumnWidthDialogTitle = "Change Column Widths";
        this.ColumnWidthSmall = "Mobile";
        this.ColumnWidthMedium = "Mobile Landscape";
        this.ColumnWidthTablet = "Tablet";
        this.ColumnWidthDesktop = "Desktop";
        this.ValidateWidthMessage = "Enter a number consisting of digits only. Maximum value is {0}.";
    }
    return RichContentTableEditorLocale;
}());
RichContentTableEditor.RegisterLocale(RichContentTableEditorLocale, 'EN');
//# sourceMappingURL=RichContentTableEditorLocaleEN.js.map
var RichContentTextEditorLocale = /** @class */ (function () {
    function RichContentTextEditorLocale() {
        this.Bold = "Bold";
        this.Italic = "Italic";
        this.MenuLabel = "Text";
        this.OrderedList = "Numberic List";
        this.UnorderedList = "Bullet List";
    }
    return RichContentTextEditorLocale;
}());
RichContentTextEditor.RegisterLocale(RichContentTextEditorLocale, 'EN');
//# sourceMappingURL=RichContentTextEditorLocaleEN.js.map