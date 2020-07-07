var XYPosition = /** @class */ (function () {
    function XYPosition(x, y) {
        this.X = x;
        this.Y = y;
    }
    return XYPosition;
}());
var RichContentUtils = /** @class */ (function () {
    function RichContentUtils() {
    }
    RichContentUtils.GetMimeType = function (url) {
        var ext = this.GetExtensionOfUrl(url);
        if (ext === 'mp4') {
            return 'video/mp4';
        }
        return null;
    };
    RichContentUtils.IsVideoUrl = function (url) {
        var ext = this.GetExtensionOfUrl(url);
        if (ext === 'mp4') {
            return true;
        }
        return false;
    };
    RichContentUtils.HasFeatherLight = function () {
        return window.$.featherlight;
    };
    RichContentUtils.GetExtensionOfUrl = function (url) {
        var lastPointIndex = url.lastIndexOf('.');
        if (lastPointIndex > -1) {
            return url.substr(lastPointIndex + 1).toLowerCase();
        }
        return null;
    };
    RichContentUtils.ShowMenu = function (menu, buttonOrPosition) {
        var xy;
        if (buttonOrPosition instanceof XYPosition) {
            xy = buttonOrPosition;
        }
        else {
            var button = buttonOrPosition;
            menu.data('origin', button);
            xy = new XYPosition(button.offset().left, button.offset().top + button.height());
        }
        menu.css({ left: xy.X, top: xy.Y });
        $('body').append(menu);
    };
    RichContentUtils.IsNullOrEmpty = function (value) {
        return value === null || value === '' || value === undefined;
    };
    return RichContentUtils;
}());
//# sourceMappingURL=RichContentUtils.js.map  
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
        this._registeredCssClasses = [];
    }
    RichContentBaseEditor.RegisterEditor = function (name, editorType) {
        RichContentBaseEditor._registrations[name] = editorType;
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
    RichContentBaseEditor.prototype.GetDetectionSelectors = function () {
        return '';
    };
    RichContentBaseEditor.prototype.Import = function (_target, _source) {
        throw new Error("Method not implemented.");
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
    RichContentBaseEditor.prototype.GetToolbarCommands = function (_elem) {
        return null;
    };
    RichContentBaseEditor.prototype.AllowInTableCell = function () {
        return false;
    };
    RichContentBaseEditor.prototype.AllowInLink = function () {
        return false;
    };
    RichContentBaseEditor.prototype.Clean = function (_elem) {
    };
    RichContentBaseEditor.prototype.SetupEditor = function (elems, keepWhenCleaning) {
        if (keepWhenCleaning === void 0) { keepWhenCleaning = false; }
        var _this = this;
        elems.each(function () {
            var elem = $(this);
            elem.addClass('rce-editor-wrapper');
            if (keepWhenCleaning)
                elem.addClass('rce-editor-wrapper-keep');
            var menuButtonText = _this.GetContextButtonText(elem);
            var menuButton = $("<button type=\"button\" class=\"hover-button rce-menu-button\">" + menuButtonText + "\u25C0</button>");
            elem.prepend(menuButton);
            menuButton.click(function () {
                _this.showContextMenu(elem, menuButton);
            });
            elem.bind('contextmenu', function (e) {
                e.preventDefault();
                e.stopPropagation();
                _this.showContextMenu(elem, new XYPosition(e.clientX + window.scrollX, e.clientY + window.scrollY));
            });
            elem.focusin(function (e) {
                // show toolbar when focusing, but only when its not an inline element (because that screws up the layout)
                if (elem.closest('a').length === 0) {
                    _this.showToolbar(elem);
                    e.preventDefault();
                }
            });
        });
    };
    RichContentBaseEditor.prototype.showContextMenu = function (elem, buttonOrPosition) {
        var _this = this;
        var actualElement = _this.getActualElement(elem);
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
        if (this._registeredCssClasses.length) {
            var editClassesItem = $("<button type=\"button\" href=\"javascript:\" class=\"rce-menu-item\"><i class=\"rce-menu-icon fas fa-code\"></i> <span>" + _this.RichContentEditorInstance.Locale.EditClasses + "</span></button>");
            editClassesItem.click(function () {
                menu.remove();
                var dialog = _this.getCssClassesDialog();
                var list = $('.rce-checkbox-list', dialog);
                var gridSelector = _this.RichContentEditorInstance.GridSelector;
                for (var index in _this._registeredCssClasses) {
                    var cls = _this._registeredCssClasses[index];
                    $("input[data-value=\"" + cls + "\"]", list).prop('checked', actualElement.hasClass(cls));
                }
                dialog.data('elem', elem);
                _this.RichContentEditorInstance.DialogManager.ShowDialog(dialog, function (dialog) {
                    var valid = _this.RichContentEditorInstance.DialogManager.ValidateFields(gridSelector, $('input', dialog));
                    if (!valid)
                        return;
                    var checkBoxes = $('.rce-dialog-content input:checkbox', dialog);
                    checkBoxes.each(function () {
                        var checkBox = $(this);
                        var cls = checkBox.attr('data-value');
                        actualElement.toggleClass(cls, checkBox.prop('checked'));
                    });
                    _this.OnChange();
                    _this.RichContentEditorInstance.DialogManager.CloseDialog(dialog);
                    return true;
                });
            });
            menu.append(editClassesItem);
        }
        var deleteItem = $("<button type=\"button\" href=\"javascript:\" class=\"rce-menu-item\"><i class=\"rce-menu-icon fas fa-trash\"></i> <span>" + _this.RichContentEditorInstance.Locale.Delete + "</span></button>");
        deleteItem.click(function () { _this.OnDelete(elem), menu.remove(); });
        menu.append(deleteItem);
        RichContentUtils.ShowMenu(menu, buttonOrPosition);
    };
    RichContentBaseEditor.prototype.getActualElement = function (elem) {
        return elem;
    };
    RichContentBaseEditor.prototype.RegisterCssClasses = function (classes) {
        this._registeredCssClasses = this._registeredCssClasses.concat(classes);
    };
    RichContentBaseEditor.prototype.showToolbar = function (elem) {
        var commands = this.GetToolbarCommands(elem);
        if (commands !== null) {
            var toolbar_1 = elem.find('.rce-toolbar');
            // close all other toolbars
            $('.rce-toolbar').not(toolbar_1).remove();
            if (!toolbar_1.length) {
                toolbar_1 = $('<div class="rce-toolbar"></ul>');
                var _loop_2 = function (i) {
                    var command = commands[i];
                    var item = $("<button type=\"button\" class=\"rce-button rce-toolbar-item\" title=\"" + command.Label + "\"><i class=\"rce-toolbar-icon " + command.IconClasses + "\"></i></button>");
                    item.click(function (e) {
                        e.preventDefault();
                        command.OnClick(elem);
                    });
                    toolbar_1.append(item);
                };
                for (var i = 0; i < commands.length; i++) {
                    _loop_2(i);
                }
                elem.prepend(toolbar_1);
            }
        }
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
    RichContentBaseEditor.prototype.getCssClassesDialog = function () {
        var dialog = $('#' + this.RichContentEditorInstance.EditorId + ' .css-classes-dialog');
        if (!dialog.length) {
            dialog = $(this.getCssClassesDialogHtml(this.RichContentEditorInstance.EditorId));
            var list = $('.rce-checkbox-list', dialog);
            for (var index in this._registeredCssClasses) {
                var cls = this._registeredCssClasses[index];
                var checkBox = $("<label class=\"rce-checkbox\"><input data-value=\"" + cls + "\" type=\"checkbox\"><span>" + cls + "</span></label>");
                list.append(checkBox);
            }
            dialog.appendTo($('#' + this.RichContentEditorInstance.EditorId));
        }
        return dialog;
    };
    RichContentBaseEditor.prototype.getCssClassesDialogHtml = function (id) {
        return "\n            <div class=\"rce-dialog css-classes-dialog\">\n                <div class=\"rce-dialog-content\">\n                    <div class=\"rce-dialog-title\">" + this.RichContentEditorInstance.Locale.EditClasses + "</div>\n                    <div class=\"rce-checkbox-list\"></div>\n                </div>\n                <div class=\"rce-dialog-footer\">\n                    <a href=\"javascript:\" class=\"rce-button rce-button-flat rce-close-dialog\">" + this.RichContentEditorInstance.DialogManager.Locale.DialogCancelButton + "</a>\n                    <a href=\"javascript:\" class=\"rce-button rce-submit-dialog\">" + this.RichContentEditorInstance.DialogManager.Locale.DialogSaveButton + "</a>\n                </div>\n            </div>";
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
        this.CancelUrl = null;
        this.Editors = null;
        this.RenderOnSave = true;
        this.ShowCloseButton = true;
        this.ShowSaveButton = true;
        this.OnBeforeSave = null;
        this.OnSave = null;
        this.OnClose = null;
        this.OnChange = null;
    }
    return RichContentEditorOptions;
}());
var GridFrameworkBase = /** @class */ (function () {
    function GridFrameworkBase() {
    }
    GridFrameworkBase.Create = function (gridFramework) {
        if (RichContentUtils.IsNullOrEmpty(gridFramework)) {
            return new GridFrameworkBase();
        }
        if (!GridFrameworkBase._registrations.hasOwnProperty(gridFramework))
            throw "GridFrameworkBase " + gridFramework + " not registered!";
        return new GridFrameworkBase._registrations[gridFramework];
    };
    GridFrameworkBase.Register = function (name, gridFramework) {
        GridFrameworkBase._registrations[name] = gridFramework;
    };
    GridFrameworkBase.prototype.GetRightAlignClass = function () {
        return null;
    };
    GridFrameworkBase.prototype.GetLeftAlignClass = function () {
        return null;
    };
    GridFrameworkBase.prototype.GetBlockAlignClass = function () {
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
    GridFrameworkBase.prototype.GetBlockAlignCss = function () {
        var kv = {
            Key: 'width',
            Value: '100%'
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
    GridFrameworkBase.prototype.GetColumnLeftAlignClass = function () {
        return null;
    };
    GridFrameworkBase.prototype.GetColumnCenterAlignClass = function () {
        return null;
    };
    GridFrameworkBase.prototype.GetColumnRightAlignClass = function () {
        return null;
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
                    $('.image-url', dialog).val(url);
                });
            },
        });
    };
    FileManager.prototype.ShowFileSelectionDialog = function (url, lightBox, targetBlank, imageMode, action) {
        var _this_1 = this;
        var gridSelector = this._richContentEditor.GridSelector;
        var dialog = this.getFileSelectionDialog(imageMode);
        if (!this._richContentEditor.Options.UploadUrl)
            dialog.find("a[href=\"#" + this._richContentEditor.EditorId + "_ByUpload\"]").closest('li').addClass('rce-hide');
        if (!this._richContentEditor.Options.FileListUrl)
            dialog.find("a[href=\"#" + this._richContentEditor.EditorId + "_BySelection\"]").closest('li').addClass('rce-hide');
        $('.image-url', dialog).val(url);
        $('.lightbox-check', dialog).prop('checked', lightBox);
        $('.target-blank-check', dialog).prop('checked', targetBlank);
        this._richContentEditor.DialogManager.ShowDialog(dialog, function (dialog) {
            var valid = _this_1._richContentEditor.DialogManager.ValidateFields(gridSelector, $('input:not(:file)', dialog));
            if (!valid)
                return;
            var url = $('.image-url', dialog).val().toString();
            var lightBox = $('.lightbox-check', dialog).prop('checked');
            var targetBlank = $('.target-blank-check', dialog).prop('checked');
            var ok = action(url, lightBox, targetBlank);
            if (!ok)
                return false;
            $('.image-url', dialog).val('');
            return true;
        });
    };
    FileManager.prototype.getFileSelectionDialog = function (imageMode) {
        var _this = this;
        var editorId = this._richContentEditor.EditorId;
        var dialog = $('#' + editorId + ' .file-dialog');
        if (!dialog.length) {
            dialog = $(this.getFileSelectionDialogHtml(this._richContentEditor.EditorId, imageMode));
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
                        $('.image-url', dialog).val(data.toString());
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
        $('.rce-dialog-title', dialog).text(imageMode ? this.Locale.ImageSelectionDialogTitle : this.Locale.LinkSelectionDialogTitle);
        $("#" + editorId + "_ByUrl").text(imageMode ? this.Locale.ImageByUrlMessage : this.Locale.LinkByUrlMessage);
        $('.image-url-label').text(imageMode ? this.Locale.ImageUrlField : this.Locale.LinkUrlField);
        $('.featherlight-input-group', dialog).toggleClass('rce-hide', !RichContentUtils.HasFeatherLight() || imageMode);
        $('.target-blank-input-group', dialog).toggleClass('rce-hide', imageMode);
        return dialog;
    };
    FileManager.prototype.getFileSelectionDialogHtml = function (editorId, imageMode) {
        return "\n            <div class=\"rce-dialog file-dialog\">\n                <div class=\"rce-dialog-content\">\n                    <div class=\"rce-dialog-title\"></div>\n                    <div class=\"rce-tab-panel\" style=\"padding: 0;\">\n                        <ul class=\"rce-tabs\">\n                            <li class=\"rce-tab active\"><a href=\"#" + editorId + "_ByUrl\">" + this.Locale.ByUrlTab + "</a></li>\n                            <li class=\"rce-tab\"><a href=\"#" + editorId + "_ByUpload\">" + this.Locale.ByUploadTab + "</a></li>\n                            <li class=\"rce-tab\"><a href=\"#" + editorId + "_BySelection\">" + this.Locale.BySelectionTab + "</a></li>\n                        </ul>\n                        <div id=\"" + editorId + "_ByUrl\" class=\"rce-tab-body active\"></div>\n                        <div id=\"" + editorId + "_ByUpload\" class=\"rce-tab-body\">\n                            <div class=\"file-path-wrapper-with-progress\">\n                                <input type=\"file\" class=\"rce-left\">\n                                <div class=\"rce-right\">\n                                    <button type=\"button\" class=\"rce-button upload-button\" style=\"width: 100%;\" disabled=\"disabled\">" + this.Locale.UploadButton + "</button>\n                                </div>\n                                <div class=\"file-path-wrapper-progress\"></div>\n                                <div class=\"rce-clear\"></div>\n                            </div>\n                        </div>\n                        <div id=\"" + editorId + "_BySelection\" class=\"rce-tab-body\">\n                            <div class=\"file-table\">\n                                " + this.Locale.LoadingProgressMessage + "\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"rce-form-field\">\n                        <label for=\"" + editorId + "_ImageUrl\" class=\"rce-label image-url-label\"></label>\n                        <input id=\"" + editorId + "_ImageUrl\" class=\"image-url validate rce-input\" type=\"text\" required=\"required\" pattern=\"^([\\/].*|[#].+|\\w*:\\/\\/.+)\" />\n                        <span class=\"rce-error-text\">" + this.Locale.EnterUrlValidation + "</span>\n                    </div>\n                    <div class=\"rce-input-group rce-hide featherlight-input-group\">\n                        <label class=\"rce-radio\">\n                            <input class=\"lightbox-check\" type=\"checkbox\"/>\n                            <span>Featherlight</span>\n                        </label>\n                    </div>\n                    <div class=\"rce-input-group target-blank-input-group\">\n                        <label class=\"rce-radio\">\n                            <input class=\"target-blank-check\" type=\"checkbox\"/>\n                            <span>" + this.Locale.OpenInNewTagCheckBox + "</span>\n                        </label>\n                    </div>\n                </div>\n                <div class=\"rce-dialog-footer\">\n                    <a href=\"javascript:\" class=\"rce-button rce-button-flat rce-close-dialog\">" + this._richContentEditor.DialogManager.Locale.DialogCancelButton + "</a>\n                    <a href=\"javascript:\" class=\"rce-button rce-submit-dialog\">" + this._richContentEditor.DialogManager.Locale.DialogSaveButton + "</a>\n                </div>\n            </div>";
    };
    FileManager._localeRegistrations = {};
    return FileManager;
}());
var RichContentEditor = /** @class */ (function () {
    function RichContentEditor() {
        this.RegisteredEditors = {};
        this.FileManager = null;
        this.DialogManager = null;
        this.GridFramework = null;
    }
    RichContentEditor.RegisterLocale = function (localeType, language) {
        RichContentEditor._localeRegistrations[language] = localeType;
    };
    RichContentEditor.prototype.GetEditor = function (editor) {
        return this.RegisteredEditors[editor];
    };
    RichContentEditor.prototype.Init = function (editorId, options) {
        var _this = this;
        if (!options) {
            options = new RichContentEditorOptions();
        }
        if (options.RenderOnSave === undefined)
            options.RenderOnSave = true;
        if (options.ShowSaveButton === undefined)
            options.ShowSaveButton = true;
        if (options.ShowCloseButton === undefined)
            options.ShowCloseButton = true;
        this.EditorId = editorId;
        var gridSelector = '#' + editorId;
        this.GridSelector = gridSelector;
        this.Options = options;
        this.Locale = new RichContentEditor._localeRegistrations[options.Language]();
        this.GridFramework = GridFrameworkBase.Create(options.GridFramework);
        this.FileManager = new FileManager(this, options.Language);
        this.DialogManager = new DialogManager(this, options.Language);
        this.instantiateEditors(options.Editors);
        var editorElement = $(HtmlTemplates.GetMainEditorTemplate(editorId));
        editorElement.data('orig', $(gridSelector).prop('outerHTML'));
        if (options.CancelUrl) {
            editorElement.find('.rce-editor-close').attr('href', options.CancelUrl);
        }
        editorElement.find('.rce-editor-save').toggleClass('rce-hide', !options.ShowSaveButton);
        editorElement.find('.rce-editor-close').toggleClass('rce-hide', !options.ShowCloseButton);
        this.ImportChildren(editorElement, $(gridSelector), false, false);
        $(gridSelector).replaceWith(editorElement);
        var grid = $(gridSelector + ' .rce-grid');
        grid.bind('contextmenu', function (e) {
            e.preventDefault();
            e.stopPropagation();
            _this.CloseAllMenus();
            _this.showAddMenu(new XYPosition(e.clientX + window.scrollX, e.clientY + window.scrollY));
        });
        if (window.Sortable) {
            window.Sortable.create(grid[0], {
                draggable: '.rce-editor-wrapper'
            });
        }
        $(gridSelector + ' .rce-editor-save').click(function () {
            if (_this.Options.OnBeforeSave) {
                if (!_this.Options.OnBeforeSave())
                    return;
            }
            var html = _this.GetHtml();
            if (_this.Options.RenderOnSave) {
                var orig = $($(gridSelector).data('orig'));
                orig.empty();
                orig.append($(html));
                $(gridSelector).replaceWith(orig);
            }
            if (_this.Options.OnSave) {
                _this.Options.OnSave(html);
            }
        });
        if (!options.CancelUrl) {
            $(gridSelector + ' .rce-editor-close').click(function () {
                var orig = $($(gridSelector).data('orig'));
                $(gridSelector).replaceWith(orig);
                if (_this.Options.OnClose) {
                    _this.Options.OnClose();
                }
            });
        }
        $(gridSelector + ' .rce-editor-preview-lock').click(function () {
            $(gridSelector + ' .rce-editor-preview-lock').addClass('rce-hide');
            $(gridSelector + ' .rce-editor-preview-unlock').removeClass('rce-hide');
            $(gridSelector).removeClass('edit-mode');
            _this.CloseAllToolbars();
        });
        $(gridSelector + ' .rce-editor-preview-unlock').click(function () {
            $(gridSelector + ' .rce-editor-preview-lock').removeClass('rce-hide');
            $(gridSelector + ' .rce-editor-preview-unlock').addClass('rce-hide');
            $(gridSelector).addClass('edit-mode');
        });
        $(gridSelector + ' .add-button').click(function () {
            _this.CloseAllMenus();
            _this.showAddMenu($(this));
        });
        $(document).click(function (e) {
            var target = $(e.target);
            // Close all open menus if clicking outside of a menu button
            if (!target.hasClass('rce-menu-button') && target.closest('.rce-menu,.rce-menu-button').length === 0) {
                _this.CloseAllMenus();
                // When clicking outside of editor, close toolbars too
                if (target.closest('.rce-grid-wrapper').length === 0) {
                    _this.CloseAllToolbars();
                }
            }
        });
        $(document).keydown(function (e) {
            if (e.keyCode === 27)
                _this.CloseAllMenus();
        });
        $(gridSelector + ' input.readonly').on('keydown paste cut', function (e) {
            e.preventDefault();
        });
        return this;
    };
    RichContentEditor.prototype.GetDetectionSelectors = function (editor) {
        var result = 'table,form,script';
        for (var key in this.RegisteredEditors) {
            var otherEditor = this.RegisteredEditors[key];
            if (otherEditor != editor) {
                var otherSelectors = otherEditor.GetDetectionSelectors();
                if (otherSelectors) {
                    if (result !== '')
                        result += ',';
                    result += otherSelectors;
                }
            }
        }
        return result;
    };
    RichContentEditor.prototype.ImportChildren = function (target, source, inTableCell, inLink) {
        var _this = this;
        var elements = source.children();
        elements.each(function () {
            for (var key in _this.RegisteredEditors) {
                var editor = _this.RegisteredEditors[key];
                if ((!inTableCell || editor.AllowInTableCell()) && (!inLink || editor.AllowInLink())) {
                    editor.Import(target, $(this));
                }
            }
        });
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
        if (elem.hasClass('rce-menu-button') || elem.hasClass('rce-toolbar')) {
            elem.remove();
        }
        else if (elem.hasClass('rce-editor-wrapper') && !elem.hasClass('rce-editor-wrapper-keep')) {
            _this.EliminateElement(elem);
        }
        else {
            _this.clean(elem);
        }
        elem.removeClass('rce-editor-wrapper rce-editor-wrapper-keep');
        for (var key in this.RegisteredEditors) {
            var editor = this.RegisteredEditors[key];
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
        var _this = this;
        if (!editors) {
            var registrations = RichContentBaseEditor.GetRegistrations();
            for (var key in registrations) {
                var instance = RichContentBaseEditor.Create(key);
                instance.Init(this);
                instance.OnChange = function () {
                    _this.handleChanged();
                };
                this.RegisteredEditors[key] = instance;
            }
        }
        else {
            for (var i = 0; i < editors.length; i++) {
                var instance = RichContentBaseEditor.Create(editors[i]);
                instance.Init(this);
                instance.OnChange = function () {
                    _this.handleChanged();
                };
                this.RegisteredEditors[editors[i]] = instance;
            }
        }
    };
    RichContentEditor.prototype.handleChanged = function () {
        if (this.Options.OnChange) {
            this.Options.OnChange();
        }
    };
    RichContentEditor.prototype.InsertEditor = function (editorTypeName, element) {
        var editor = null;
        for (var key in this.RegisteredEditors) {
            var registeredEditor = this.RegisteredEditors[key];
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
    RichContentEditor.prototype.CloseAllToolbars = function () {
        $('.rce-toolbar').remove();
    };
    RichContentEditor.prototype.showAddMenu = function (button) {
        var _this = this;
        var menu = $('<div class="rce-menu"></div>');
        var _loop_1 = function (key) {
            var editor = this_1.RegisteredEditors[key];
            var item = $("<button type=\"button\" class=\"rce-menu-item\"><i class=\"rce-menu-icon " + editor.GetMenuIconClasses() + "\"></i> <span class=\"rce-menu-label\">" + editor.GetMenuLabel() + "</span></button>");
            item.click(function () { _this.handleChanged(); _this.CloseAllMenus(); editor.Insert($(_this.GridSelector + ' .rce-grid')); });
            menu.append(item);
        };
        var this_1 = this;
        for (var key in this.RegisteredEditors) {
            _loop_1(key);
        }
        RichContentUtils.ShowMenu(menu, button);
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
            $(document).on('keydown', function (e) { _this.dialogKeyDown(e); });
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
    DialogManager.prototype.dialogKeyDown = function (e) {
        if (e.keyCode === 27) {
            if (DialogManager._dialogStack.length)
                this.CloseDialog(DialogManager._dialogStack.pop());
        }
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
        return "\n            <div id=\"" + id + "\" class=\"rce-grid-wrapper edit-mode\">\n                <div class=\"rce-grid\">\n                    <a class=\"rce-button rce-button-flat rce-menu-button add-button\"><i class=\"fas fa-plus-circle\"></i></a>\n                </div>\n\n                <div class=\"rce-editor-top-icons\">\n                    <button type=\"button\" class=\"rce-button rce-button-toolbar rce-editor-preview-lock\"><i class=\"fas fa-eye\"></i></button>\n                    <button type=\"button\" class=\"rce-button rce-button-toolbar rce-editor-preview-unlock rce-hide\"><i class=\"fas fa-eye-slash\"></i></button>\n                    <button type=\"button\" class=\"rce-button rce-button-toolbar rce-editor-save rce-hide\"><i class=\"fas fa-save\"></i></button>\n                    <a href=\"javascript:\" class=\"rce-button rce-button-toolbar rce-editor-close rce-hide\"><i class=\"fas fa-times\"></i></a>\n                </div>\n            </div>";
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
        var _this_1 = _super !== null && _super.apply(this, arguments) || this;
        _this_1._selectionChangedBound = false;
        return _this_1;
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
        var inline = targetElement.is('a');
        var tag = inline ? 'span' : 'div';
        var textArea = $("<" + tag + " class=\"rce-textarea-editor\" contenteditable=\"true\">" + html + "</" + tag + ">");
        if (textArea.find('script,table,img,form').length) {
            throw 'It is not allowed to insert content containing the following tags: script, table, img, form';
        }
        var textAreaWrapper = $("<" + tag + " class=\"rce-textarea-wrapper\"></" + tag + ">");
        textAreaWrapper.append(textArea);
        if (!targetElement) {
            targetElement = $("#" + this.RichContentEditorInstance.EditorId + " .rce-grid");
        }
        this.Attach(textAreaWrapper, targetElement);
        textAreaWrapper.find('.rce-textarea-editor').focus();
        this.setupEvents(textArea);
    };
    RichContentTextEditor.prototype.getActualElement = function (elem) {
        if (elem.hasClass('rce-textarea-wrapper')) {
            return elem.find('.rce-textarea-editor');
        }
        return elem;
    };
    RichContentTextEditor.prototype.setupEvents = function (textArea) {
        var _this = this;
        textArea[0].onpaste = function (e) {
            e.preventDefault();
            var text = e.clipboardData.getData('text/plain');
            var selection = window.getSelection();
            if (!selection.rangeCount)
                return false;
            selection.deleteFromDocument();
            selection.getRangeAt(0).insertNode(document.createTextNode(text));
        };
        textArea.focusin(function (e) {
            if (textArea.data('selection')) {
                var sel = window.rangy.getSelection();
                sel.removeAllRanges();
                sel.addRange(textArea.data('selection'));
                textArea.data('selection', null);
            }
        });
        textArea.on('input', function (e) {
            _this.OnChange();
        });
        if (!this._selectionChangedBound) {
            document.addEventListener('selectionchange', function () {
                if ($(document.activeElement).hasClass('rce-textarea-editor')) {
                    $(document.activeElement).data('selection', window.rangy.getSelection().getRangeAt(0));
                }
            });
            this._selectionChangedBound = true;
        }
    };
    RichContentTextEditor.prototype.GetDetectionSelectors = function () {
        return '.text';
    };
    RichContentTextEditor.prototype.Import = function (targetElement, source) {
        if (source.hasClass('text')) {
            var clone = source.clone();
            var inline = targetElement.is('a');
            var tag = inline ? 'span' : 'div';
            var textArea = null;
            if (clone.is(tag)) {
                textArea = clone;
                textArea.attr('contenteditable', 'true');
                textArea.addClass('rce-textarea-editor');
            }
            else {
                textArea = $("<" + tag + " class=\"rce-textarea-editor\" contenteditable=\"true\">" + clone.html() + "</" + tag + ">");
            }
            var textAreaWrapper = $("<" + tag + " class=\"rce-textarea-wrapper\"></" + tag + ">");
            textAreaWrapper.append(textArea);
            source.replaceWith(textAreaWrapper.append(clone));
            this.Attach(textAreaWrapper, targetElement);
            this.setupEvents(textArea);
        }
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
    RichContentTextEditor.prototype.AllowInLink = function () {
        return true;
    };
    RichContentTextEditor.prototype.Clean = function (elem) {
        if (elem.hasClass('rce-textarea-editor')) {
            elem.removeClass('rce-textarea-editor');
            if (elem.attr('class') === '')
                elem.removeAttr('class');
            elem.removeAttr('contenteditable');
            elem.addClass('text');
        }
        _super.prototype.Clean.call(this, elem);
    };
    RichContentTextEditor.prototype.GetContextButtonText = function (_elem) {
        return 'A';
    };
    RichContentTextEditor.prototype.GetContextCommands = function (_elem) {
        var _this = this;
        var editor = this.RichContentEditorInstance;
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
        var linkCommand = new ContextCommand(this._locale.Link, 'fas fa-link', function (elem) {
            elem.find('.rce-textarea-editor').focus();
            var selection = window.rangy.getSelection();
            var value = selection.toString();
            if (RichContentUtils.IsNullOrEmpty(value)) {
                value = _this._locale.NewLinkText;
            }
            var url;
            var lightBox = false;
            var targetBlank = false;
            var a;
            if (selection.rangeCount > 0) {
                var range = selection.getRangeAt(0);
                if (range.startContainer.nodeType === 1 && range.startContainer.tagName === 'A') {
                    a = $(range.startContainer);
                }
                else {
                    var parentElement = range.startContainer.parentElement;
                    if (parentElement.tagName === 'A') {
                        a = $(parentElement);
                    }
                    else {
                        a = $(parentElement).closest(a);
                    }
                }
                if (a.length) {
                    url = a.attr('href');
                    value = a.text();
                    var lightBoxAttr = a.attr('data-featherlight');
                    lightBox = !RichContentUtils.IsNullOrEmpty(lightBoxAttr);
                    if (lightBox) {
                        url = lightBoxAttr;
                    }
                    targetBlank = a.attr('target') === '_blank';
                }
            }
            editor.FileManager.ShowFileSelectionDialog(url, lightBox, targetBlank, false, function (url, lightBox, targetBlank) {
                _this.OnChange();
                var link = $("<a href=\"" + url + "\" onclick=\"return false;\">" + value + "</a>");
                if (lightBox) {
                    link.attr('data-featherlight', url);
                    link.attr('href', 'javascript:');
                }
                if (targetBlank) {
                    link.attr('target', '_blank');
                }
                if (a.length) {
                    a.replaceWith(link);
                }
                else {
                    selection.deleteFromDocument();
                    selection.getRangeAt(0).insertNode(link[0]);
                }
                selection.selectAllChildren(link[0]);
                return true;
            });
        });
        return [boldCommand, italicCommand, ulCommand, olCommand, linkCommand];
    };
    RichContentTextEditor.prototype.GetToolbarCommands = function (elem) {
        return this.GetContextCommands(elem);
    };
    RichContentTextEditor._localeRegistrations = {};
    return RichContentTextEditor;
}(RichContentBaseEditor));
RichContentBaseEditor.RegisterEditor('RichContentTextEditor', RichContentTextEditor);
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
var RichContentHeadingEditor = /** @class */ (function (_super) {
    __extends(RichContentHeadingEditor, _super);
    function RichContentHeadingEditor() {
        var _this_1 = _super !== null && _super.apply(this, arguments) || this;
        _this_1._selectionChangedBound = false;
        return _this_1;
    }
    RichContentHeadingEditor.RegisterLocale = function (localeType, language) {
        this._localeRegistrations[language] = localeType;
    };
    RichContentHeadingEditor.prototype.Init = function (richContentEditor) {
        _super.prototype.Init.call(this, richContentEditor);
        this._locale = new RichContentHeadingEditor._localeRegistrations[richContentEditor.Options.Language]();
    };
    RichContentHeadingEditor.prototype.Insert = function (targetElement) {
        this.InsertContent(null, targetElement);
    };
    RichContentHeadingEditor.prototype.InsertContent = function (html, targetElement) {
        _super.prototype.Insert.call(this, targetElement);
        if (!html)
            html = '';
        var textArea = $("<h1 class=\"rce-heading-editor\" contenteditable=\"true\">" + html + "</h1>");
        if (textArea.find('script,table,img,form').length) {
            throw 'It is not allowed to insert content containing the following tags: script, table, img, form';
        }
        var textAreaWrapper = $('<div class="rce-heading-wrapper"></div>');
        textAreaWrapper.append(textArea);
        if (!targetElement) {
            targetElement = $("#" + this.RichContentEditorInstance.EditorId + " .rce-grid");
        }
        this.Attach(textAreaWrapper, targetElement);
        textAreaWrapper.find('.rce-heading-editor').focus();
        this.setupEvents(textArea);
    };
    RichContentHeadingEditor.prototype.setupEvents = function (textArea) {
        textArea[0].onpaste = function (e) {
            e.preventDefault();
            var text = e.clipboardData.getData('text/plain');
            var selection = window.getSelection();
            if (!selection.rangeCount)
                return false;
            selection.deleteFromDocument();
            selection.getRangeAt(0).insertNode(document.createTextNode(text));
        };
        textArea.focusin(function (e) {
            if (textArea.data('selection')) {
                var sel = window.rangy.getSelection();
                sel.removeAllRanges();
                sel.addRange(textArea.data('selection'));
                textArea.data('selection', null);
            }
        });
        if (!this._selectionChangedBound) {
            document.addEventListener('selectionchange', function () {
                if ($(document.activeElement).hasClass('rce-heading-editor')) {
                    $(document.activeElement).data('selection', window.rangy.getSelection().getRangeAt(0));
                }
            });
            this._selectionChangedBound = true;
        }
    };
    RichContentHeadingEditor.prototype.GetDetectionSelectors = function () {
        return 'h1,h2,h3,h4,h5,h6';
    };
    RichContentHeadingEditor.prototype.Import = function (targetElement, source) {
        if (source.is('h1,h2,h3,h4,h5,h6')) {
            var clone = source.clone();
            clone.attr('contenteditable', 'true');
            clone.addClass('rce-heading-editor');
            var headingWrapper = $('<div class="rce-heading-wrapper"></div>');
            headingWrapper.append(clone);
            source.replaceWith(headingWrapper.append(clone));
            this.Attach(headingWrapper, targetElement);
            this.setupEvents(clone);
        }
    };
    RichContentHeadingEditor.prototype.GetMenuLabel = function () {
        return this._locale.MenuLabel;
    };
    RichContentHeadingEditor.prototype.GetMenuIconClasses = function () {
        return 'fas fa-heading';
    };
    RichContentHeadingEditor.prototype.AllowInTableCell = function () {
        return true;
    };
    RichContentHeadingEditor.prototype.AllowInLink = function () {
        return true;
    };
    RichContentHeadingEditor.prototype.Clean = function (elem) {
        elem.removeClass('rce-heading-editor');
        if (elem.attr('class') === '')
            elem.removeAttr('class');
        elem.removeAttr('contenteditable');
        _super.prototype.Clean.call(this, elem);
    };
    RichContentHeadingEditor.prototype.GetContextButtonText = function (_elem) {
        return 'H';
    };
    RichContentHeadingEditor.prototype.GetContextCommands = function (_elem) {
        var _this = this;
        var gridSelector = this.RichContentEditorInstance.GridSelector;
        var sizeCommand = new ContextCommand(this._locale.Size, 'fas fa-text-height', function (elem) {
            var dialog = _this.getSizeDialog();
            var currentSize = parseInt(elem.find('h1,h2,h3,h4,h5,h6')[0].tagName.substring(1, 2));
            $('input.rce-size-input', dialog).val(currentSize);
            _this.RichContentEditorInstance.GridFramework.UpdateFields();
            dialog.data('elem', elem);
            _this.RichContentEditorInstance.DialogManager.ShowDialog(dialog, function (dialog) {
                var valid = _this.RichContentEditorInstance.DialogManager.ValidateFields(gridSelector, $('input', dialog));
                if (!valid)
                    return;
                var newSize = $('input.rce-size-input', dialog).val();
                var oldHeading = elem.find('h1,h2,h3,h4,h5,h6').first();
                var newHeading = $("<h" + newSize + " contenteditable=\"true\" class=\"rce-heading-editor\">" + oldHeading[0].innerHTML + "</h" + newSize + ">");
                oldHeading.first().replaceWith(newHeading);
                _this.RichContentEditorInstance.DialogManager.CloseDialog($(gridSelector + ' .column-width-dialog'));
                return true;
            });
        });
        return [sizeCommand];
    };
    RichContentHeadingEditor.prototype.getSizeDialog = function () {
        var dialog = $('#' + this.RichContentEditorInstance.EditorId + ' .heading-size-dialog');
        if (!dialog.length) {
            dialog = $(this.getSizeDialogHtml(this.RichContentEditorInstance.EditorId));
            dialog.appendTo($('#' + this.RichContentEditorInstance.EditorId));
        }
        return dialog;
    };
    RichContentHeadingEditor.prototype.getSizeDialogHtml = function (id) {
        return "\n            <div class=\"rce-dialog column-width-dialog\">\n                <div class=\"rce-dialog-content\">\n                    <div class=\"rce-dialog-title\">" + this._locale.ColumnSizeDialogTitle + "</div>\n                    <div class=\"rce-form-field rce-form-field-inline\">\n                        <label for=\"" + id + "_Size\" class=\"rce-label\">" + this._locale.SizeLabel + "</label>\n                        <input id=\"" + id + "_Size\" class=\"validate rce-input rce-size-input browser-default\" type=\"number\" required=\"required\" min=\"1\" max=\"6\" />\n                        <span class=\"rce-error-text\">" + this._locale.ValidateSizeMessage + "</span>\n                    </div>\n                </div>\n                <div class=\"rce-dialog-footer\">\n                    <a href=\"javascript:\" class=\"rce-button rce-button-flat rce-close-dialog\">" + this.RichContentEditorInstance.DialogManager.Locale.DialogCancelButton + "</a>\n                    <a href=\"javascript:\" class=\"rce-button rce-submit-dialog\">" + this.RichContentEditorInstance.DialogManager.Locale.DialogSaveButton + "</a>\n                </div>\n            </div>";
    };
    RichContentHeadingEditor._localeRegistrations = {};
    return RichContentHeadingEditor;
}(RichContentBaseEditor));
RichContentBaseEditor.RegisterEditor('RichContentHeadingEditor', RichContentHeadingEditor);
//# sourceMappingURL=RichContentHeadingEditor.js.map  
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
var ImageAlignment;
(function (ImageAlignment) {
    ImageAlignment[ImageAlignment["None"] = 0] = "None";
    ImageAlignment[ImageAlignment["Fill"] = 1] = "Fill";
    ImageAlignment[ImageAlignment["Left"] = 2] = "Left";
    ImageAlignment[ImageAlignment["Right"] = 3] = "Right";
})(ImageAlignment || (ImageAlignment = {}));
var ColumnAlignment;
(function (ColumnAlignment) {
    ColumnAlignment[ColumnAlignment["Left"] = 0] = "Left";
    ColumnAlignment[ColumnAlignment["Center"] = 1] = "Center";
    ColumnAlignment[ColumnAlignment["Right"] = 2] = "Right";
})(ColumnAlignment || (ColumnAlignment = {}));
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
        _super.prototype.Insert.call(this, targetElement);
        if (!targetElement) {
            targetElement = $('.rce-grid', this.RichContentEditorInstance.GridSelector);
        }
        this._appendElement = targetElement;
        this.showSelectionDialog(null);
    };
    RichContentImageEditor.prototype.showSelectionDialog = function (elem) {
        var _this_1 = this;
        var _this = this;
        var url = null;
        var update = elem !== null;
        var alignment = ImageAlignment.Fill;
        if (elem) {
            url = $('.rce-image', elem).attr('src');
            alignment = this.getImageAlignment(elem);
        }
        this.RichContentEditorInstance.FileManager.ShowFileSelectionDialog(url, false, false, true, function (url, _lightBox, _targetBlank) {
            _this.OnChange();
            if (update) {
                _this_1.updateImage(elem, url, alignment);
            }
            else {
                _this_1.InsertImage(url, alignment, _this_1._appendElement);
            }
            return true;
        });
    };
    RichContentImageEditor.prototype.InsertImage = function (url, alignment, targetElement) {
        var imgWrapper = $('<div class="rce-image-wrapper"></div>');
        var img = $('<img class="rce-image"></img>');
        imgWrapper.append(img);
        this.updateImage(imgWrapper, url, alignment);
        if (!targetElement) {
            targetElement = $("#" + this.RichContentEditorInstance.EditorId + " .rce-grid");
        }
        this.Attach(imgWrapper, targetElement);
    };
    RichContentImageEditor.prototype.updateImage = function (elem, url, alignment) {
        var img = elem.find('.rce-image');
        img.attr('src', url);
        var childToAppend = null;
        this.removeEditorAlignmentClasses(elem);
        elem.addClass(this.getImageAlignmentClass(alignment));
        if (childToAppend) {
            elem.append(childToAppend);
        }
    };
    RichContentImageEditor.prototype.getImageAlignmentClass = function (alignment) {
        switch (alignment) {
            case ImageAlignment.Left: return 'rce-image-left';
            case ImageAlignment.Right: return 'rce-image-right';
            case ImageAlignment.Fill: return 'rce-image-block';
            case ImageAlignment.None: return '';
            default: throw "Unexpected alignment value: " + alignment;
        }
    };
    RichContentImageEditor.prototype.getImageAlignment = function (elem) {
        if (elem.hasClass('rce-image-left'))
            return ImageAlignment.Left;
        if (elem.hasClass('rce-image-block'))
            return ImageAlignment.Fill;
        if (elem.hasClass('rce-image-right'))
            return ImageAlignment.Right;
        return ImageAlignment.None;
    };
    RichContentImageEditor.prototype.GetDetectionSelectors = function () {
        return 'img';
    };
    RichContentImageEditor.prototype.Import = function (targetElement, source) {
        if (source.is('img') || source.is('a') && source.children().first().is('img')) {
            var clone = source.clone();
            var imgWrapper = $('<div class="rce-image-wrapper"></div>');
            imgWrapper.append(clone);
            var img = imgWrapper.find('img');
            img.addClass('rce-image');
            var alignment = ImageAlignment.None;
            if (img.hasClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass())) {
                alignment = ImageAlignment.Left;
                img.removeClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass());
            }
            else if (img.hasClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass())) {
                alignment = ImageAlignment.Right;
                img.removeClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass());
            }
            else if (img.hasClass(this.RichContentEditorInstance.GridFramework.GetBlockAlignClass())) {
                alignment = ImageAlignment.Fill;
                img.removeClass(this.RichContentEditorInstance.GridFramework.GetBlockAlignClass());
            }
            else if (this.hasCss(img, this.RichContentEditorInstance.GridFramework.GetBlockAlignCss())) {
                alignment = ImageAlignment.Fill;
                img.css(this.RichContentEditorInstance.GridFramework.GetBlockAlignCss().Key, '');
            }
            if (alignment !== ImageAlignment.None) {
                imgWrapper.addClass(this.getImageAlignmentClass(alignment));
            }
            source.replaceWith(imgWrapper);
            this.Attach(imgWrapper, targetElement);
        }
    };
    RichContentImageEditor.prototype.hasCss = function (elem, css) {
        if (css === null) {
            return false;
        }
        if (elem.css(css.Key) === css.Value)
            return true;
        return false;
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
    RichContentImageEditor.prototype.AllowInLink = function () {
        return true;
    };
    RichContentImageEditor.prototype.Clean = function (elem) {
        var wrapper = elem.closest('.rce-image-wrapper');
        if (wrapper.hasClass('rce-image-left')) {
            elem.addClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass());
            var css = this.RichContentEditorInstance.GridFramework.GetLeftAlignCss();
            if (css != null)
                elem.css(css.Key, css.Value);
        }
        if (wrapper.hasClass('rce-image-right')) {
            elem.addClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass());
            var css = this.RichContentEditorInstance.GridFramework.GetRightAlignCss();
            if (css != null)
                elem.css(css.Key, css.Value);
        }
        if (wrapper.hasClass('rce-image-block')) {
            elem.addClass(this.RichContentEditorInstance.GridFramework.GetBlockAlignClass());
            var css = this.RichContentEditorInstance.GridFramework.GetBlockAlignCss();
            if (css != null)
                elem.css(css.Key, css.Value);
        }
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
        var _this = this;
        var leftCommand = new ContextCommand(this._locale.AlignLeftMenuLabel, 'fas fa-arrow-left', function (elem) {
            _this.removeEditorAlignmentClasses(elem);
            elem.addClass('rce-image-left');
            _this.OnChange();
        });
        var rightCommand = new ContextCommand(this._locale.AlignRightMenuLabel, 'fas fa-arrow-right', function (elem) {
            _this.removeEditorAlignmentClasses(elem);
            elem.addClass('rce-image-right');
            _this.OnChange();
        });
        var blockCommand = new ContextCommand(this._locale.BlockAlignMenuLabel, 'fas fa-expand-arrows-alt', function (elem) {
            _this.removeEditorAlignmentClasses(elem);
            elem.addClass('rce-image-block');
            _this.OnChange();
        });
        var defaultCommand = new ContextCommand(this._locale.DefaultSizeMenuLabel, 'fas fa-compress-arrows-alt', function (elem) {
            _this.removeEditorAlignmentClasses(elem);
            _this.OnChange();
        });
        var editCommand = new ContextCommand(this._locale.EditMenuLabel, 'fas fa-cog', function (elem) {
            _this.showSelectionDialog(elem);
        });
        return [leftCommand, rightCommand, blockCommand, defaultCommand, editCommand];
    };
    RichContentImageEditor.prototype.removeEditorAlignmentClasses = function (elem) {
        elem.removeClass('rce-image-left rce-image-block rce-image-right');
    };
    RichContentImageEditor._localeRegistrations = {};
    return RichContentImageEditor;
}(RichContentBaseEditor));
RichContentBaseEditor.RegisterEditor('RichContentImageEditor', RichContentImageEditor);
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
var RichContentVideoEditor = /** @class */ (function (_super) {
    __extends(RichContentVideoEditor, _super);
    function RichContentVideoEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RichContentVideoEditor.RegisterLocale = function (localeType, language) {
        RichContentVideoEditor._localeRegistrations[language] = localeType;
    };
    RichContentVideoEditor.prototype.Init = function (richContentEditor) {
        _super.prototype.Init.call(this, richContentEditor);
        this._locale = new RichContentVideoEditor._localeRegistrations[richContentEditor.Options.Language]();
    };
    RichContentVideoEditor.prototype.Insert = function (targetElement) {
        _super.prototype.Insert.call(this, targetElement);
        if (!targetElement) {
            targetElement = $('.rce-grid', this.RichContentEditorInstance.GridSelector);
        }
        this._appendElement = targetElement;
        this.showSelectionDialog(null);
    };
    RichContentVideoEditor.prototype.showSelectionDialog = function (elem) {
        var _this_1 = this;
        var _this = this;
        var url = null;
        var update = elem !== null;
        if (elem) {
            var coreElement = elem.find('.video');
            url = this.getUrl(coreElement);
        }
        this.RichContentEditorInstance.FileManager.ShowFileSelectionDialog(url, false, false, false, function (url, _lightBox, _targetBlank) {
            _this.OnChange();
            if (update) {
                _this_1.updateElement(elem, url);
            }
            else {
                _this_1.InsertElement(url, _this_1._appendElement);
            }
            return true;
        });
    };
    RichContentVideoEditor.prototype.getUrl = function (coreElement) {
        if ($('iframe', coreElement).length) {
            return $('iframe', coreElement).attr('src');
        }
        return $('video source', coreElement).attr('src');
    };
    RichContentVideoEditor.prototype.InsertElement = function (url, targetElement) {
        var wrapper = $('<div class="rce-video-wrapper"></div>');
        this.updateElement(wrapper, url);
        if (!targetElement) {
            targetElement = $("#" + this.RichContentEditorInstance.EditorId + " .rce-grid");
        }
        this.Attach(wrapper, targetElement);
    };
    RichContentVideoEditor.prototype.isYouTube = function (url) {
        return url.indexOf('youtube.com/embed/') > -1;
    };
    RichContentVideoEditor.prototype.getCoreElement = function (youtube) {
        if (youtube) {
            return $('<div class="rce-video video"><iframe allowfullscreen="allowfullscreen" frameborder="0"></iframe></div>');
        }
        return $('<div class="rce-video video videojs"><video class="video-js vjs-default-skin vjs-16-9" preload="auto" controls><source /></video></div>');
    };
    RichContentVideoEditor.prototype.updateElement = function (elem, url) {
        var youtube = this.isYouTube(url);
        var coreElement = this.getCoreElement(youtube);
        elem.empty();
        elem.append(coreElement);
        if (youtube) {
            var iframe = coreElement.find('iframe');
            iframe.attr('src', url);
        }
        else {
            var source = coreElement.find('video source');
            source.attr('src', url);
        }
    };
    RichContentVideoEditor.prototype.GetDetectionSelectors = function () {
        return 'div.video';
    };
    RichContentVideoEditor.prototype.Import = function (targetElement, source) {
        if (source.is('div.video')) {
            var clone = source.clone();
            clone.addClass('rce-video');
            var wrapper = $('<div class="rce-video-wrapper"></div>');
            wrapper.append(clone);
            source.replaceWith(wrapper);
            this.Attach(wrapper, targetElement);
        }
    };
    RichContentVideoEditor.prototype.GetMenuLabel = function () {
        return this._locale.MenuLabel;
    };
    RichContentVideoEditor.prototype.GetMenuIconClasses = function () {
        return 'fas fa-video';
    };
    RichContentVideoEditor.prototype.AllowInTableCell = function () {
        return true;
    };
    RichContentVideoEditor.prototype.AllowInLink = function () {
        return true;
    };
    RichContentVideoEditor.prototype.Clean = function (elem) {
        var wrapper = elem.closest('.rce-video-wrapper');
        var coreElement = wrapper.find('.rce-video');
        coreElement.removeClass('rce-video');
        elem.removeAttr('draggable');
        _super.prototype.Clean.call(this, elem);
    };
    RichContentVideoEditor.prototype.GetContextButtonText = function (_elem) {
        return 'vid';
    };
    RichContentVideoEditor.prototype.GetContextCommands = function (_elem) {
        var _this = this;
        var editCommand = new ContextCommand(this._locale.EditMenuLabel, 'fas fa-cog', function (elem) {
            _this.showSelectionDialog(elem);
        });
        return [editCommand];
    };
    RichContentVideoEditor._localeRegistrations = {};
    return RichContentVideoEditor;
}(RichContentBaseEditor));
RichContentBaseEditor.RegisterEditor('RichContentVideoEditor', RichContentVideoEditor);
//# sourceMappingURL=RichContentVideoEditor.js.map  
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
var LinkAlignment;
(function (LinkAlignment) {
    LinkAlignment[LinkAlignment["None"] = 0] = "None";
    LinkAlignment[LinkAlignment["Fill"] = 1] = "Fill";
    LinkAlignment[LinkAlignment["Left"] = 2] = "Left";
    LinkAlignment[LinkAlignment["Right"] = 3] = "Right";
})(LinkAlignment || (LinkAlignment = {}));
var RichContentLinkEditor = /** @class */ (function (_super) {
    __extends(RichContentLinkEditor, _super);
    function RichContentLinkEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RichContentLinkEditor.RegisterLocale = function (localeType, language) {
        this._localeRegistrations[language] = localeType;
    };
    RichContentLinkEditor.prototype.Init = function (richContentEditor) {
        _super.prototype.Init.call(this, richContentEditor);
        this._locale = new RichContentLinkEditor._localeRegistrations[richContentEditor.Options.Language]();
    };
    RichContentLinkEditor.prototype.Insert = function (targetElement) {
        _super.prototype.Insert.call(this, targetElement);
        if (!targetElement) {
            targetElement = $('.rce-grid', this.RichContentEditorInstance.GridSelector);
        }
        this._appendElement = targetElement;
        this.showSelectionDialog(null);
    };
    RichContentLinkEditor.prototype.showSelectionDialog = function (elem) {
        var _this_1 = this;
        var _this = this;
        var url = null;
        var lightBox = false;
        var targetBlank = false;
        var update = elem !== null;
        if (elem) {
            url = $('.rce-link', elem).attr(lightBox ? 'data-featherlight' : 'href');
            lightBox = $('a[data-featherlight]', elem).length > 0;
            targetBlank = $('a[target="_blank"]', elem).length > 0;
        }
        this.RichContentEditorInstance.FileManager.ShowFileSelectionDialog(url, lightBox, targetBlank, false, function (url, lightBox, targetBlank) {
            _this.OnChange();
            if (update) {
                _this_1.updateLink(elem, url, lightBox, targetBlank);
            }
            else {
                _this_1.InsertLink(url, lightBox, targetBlank, LinkAlignment.None, _this_1._appendElement);
            }
            return true;
        });
    };
    RichContentLinkEditor.prototype.InsertLink = function (url, lightBox, targetBlank, alignment, targetElement) {
        var linkWrapper = $('<div class="rce-link-wrapper"></div>');
        var link = $('<a class="rce-link" onclick="return false;"></a>');
        linkWrapper.append(link);
        this.updateLink(linkWrapper, url, lightBox, targetBlank);
        linkWrapper.addClass(this.getAlignmentClass(alignment));
        if (!targetElement) {
            targetElement = $("#" + this.RichContentEditorInstance.EditorId + " .rce-grid");
        }
        this.Attach(linkWrapper, targetElement);
    };
    RichContentLinkEditor.prototype.updateLink = function (elem, url, lightBox, targetBlank) {
        var link = elem.find('.rce-link');
        if (lightBox && RichContentUtils.HasFeatherLight()) {
            if (RichContentUtils.IsVideoUrl(url)) {
                var mimeType = RichContentUtils.GetMimeType(url);
                link.attr('data-featherlight', "<video class=\"video-js js-video\" preload=\"auto\" controls=\"\" autoplay=\"autoplay\"><source src=\"" + url + "\" type=\"" + mimeType + "\"></video>");
            }
            else {
                link.attr('data-featherlight', url);
            }
            link.attr('href', 'javascript:');
        }
        else {
            link.attr('href', url);
            link.removeAttr('data-featherlight');
        }
        if (targetBlank) {
            link.attr('target', '_blank');
        }
        else {
            link.removeAttr('target');
        }
        this.removeEditorAlignmentClasses(elem);
    };
    RichContentLinkEditor.prototype.getAlignmentClass = function (alignment) {
        switch (alignment) {
            case LinkAlignment.Left: return 'rce-left';
            case LinkAlignment.Right: return 'rce-right';
            case LinkAlignment.Fill: return 'rce-fill';
            case LinkAlignment.None: return '';
            default: throw "Unexpected alignment value: " + alignment;
        }
    };
    RichContentLinkEditor.prototype.getAlignment = function (elem) {
        if (elem.hasClass('rce-left'))
            return LinkAlignment.Left;
        if (elem.hasClass('rce-fill'))
            return LinkAlignment.Fill;
        if (elem.hasClass('rce-right'))
            return LinkAlignment.Right;
        return LinkAlignment.None;
    };
    RichContentLinkEditor.prototype.GetDetectionSelectors = function () {
        return 'a';
    };
    RichContentLinkEditor.prototype.getActualElement = function (elem) {
        if (elem.is('.rce-link-wrapper')) {
            return elem.find('a.rce-link');
        }
        return elem;
    };
    RichContentLinkEditor.prototype.Import = function (targetElement, source) {
        if (source.is('a')) {
            var clone = source.clone();
            clone.empty();
            var linkWrapper = $('<div class="rce-link-wrapper"></div>');
            linkWrapper.append(clone);
            var link = linkWrapper.find('a');
            link.addClass('rce-link');
            link.attr('onclick', 'return false;');
            this.RichContentEditorInstance.ImportChildren(link, source, false, true);
            var alignment = LinkAlignment.None;
            if (link.hasClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass())) {
                alignment = LinkAlignment.Left;
                link.removeClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass());
            }
            else if (link.hasClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass())) {
                alignment = LinkAlignment.Right;
                link.removeClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass());
            }
            else if (link.hasClass(this.RichContentEditorInstance.GridFramework.GetBlockAlignClass())) {
                alignment = LinkAlignment.Fill;
                link.removeClass(this.RichContentEditorInstance.GridFramework.GetBlockAlignClass());
            }
            else if (this.hasCss(link, this.RichContentEditorInstance.GridFramework.GetBlockAlignCss())) {
                alignment = LinkAlignment.Fill;
                link.css(this.RichContentEditorInstance.GridFramework.GetBlockAlignCss().Key, '');
            }
            if (alignment !== LinkAlignment.None) {
                linkWrapper.addClass(this.getAlignmentClass(alignment));
            }
            source.replaceWith(linkWrapper);
            this.Attach(linkWrapper, targetElement);
        }
    };
    RichContentLinkEditor.prototype.hasCss = function (elem, css) {
        if (css === null) {
            return false;
        }
        if (elem.css(css.Key) === css.Value)
            return true;
        return false;
    };
    RichContentLinkEditor.prototype.GetMenuLabel = function () {
        return this._locale.MenuLabel;
    };
    RichContentLinkEditor.prototype.GetMenuIconClasses = function () {
        return 'fas fa-external-link-square-alt';
    };
    RichContentLinkEditor.prototype.AllowInTableCell = function () {
        return true;
    };
    RichContentLinkEditor.prototype.Clean = function (elem) {
        elem.removeAttr('onclick');
        var wrapper = elem.closest('.rce-link-wrapper');
        if (wrapper.hasClass('rce-left')) {
            elem.addClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass());
            var css = this.RichContentEditorInstance.GridFramework.GetLeftAlignCss();
            if (css != null)
                elem.css(css.Key, css.Value);
        }
        if (wrapper.hasClass('rce-right')) {
            elem.addClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass());
            var css = this.RichContentEditorInstance.GridFramework.GetRightAlignCss();
            if (css != null)
                elem.css(css.Key, css.Value);
        }
        if (wrapper.hasClass('rce-fill')) {
            elem.addClass(this.RichContentEditorInstance.GridFramework.GetBlockAlignClass());
            var css = this.RichContentEditorInstance.GridFramework.GetBlockAlignCss();
            if (css != null)
                elem.css(css.Key, css.Value);
        }
        elem.removeClass('rce-link');
        if (elem.attr('class') === '')
            elem.removeAttr('class');
        elem.removeAttr('draggable');
        _super.prototype.Clean.call(this, elem);
    };
    RichContentLinkEditor.prototype.GetContextButtonText = function (_elem) {
        return 'lnk';
    };
    RichContentLinkEditor.prototype.GetContextCommands = function (_elem) {
        var _this = this;
        var result = [];
        var editors = this.RichContentEditorInstance.RegisteredEditors;
        var _loop_1 = function (key) {
            var editor = editors[key];
            if (editor.AllowInLink()) {
                insertCommand = new ContextCommand(editor.GetMenuLabel(), editor.GetMenuIconClasses(), function (elem) {
                    var inner = elem.find('a.rce-link');
                    editor.Insert(inner);
                    _this.OnChange();
                    if (window.Sortable) {
                        window.Sortable.create(inner[0], {
                            group: 'col',
                            draggable: '.rce-editor-wrapper'
                        });
                    }
                });
                result.push(insertCommand);
            }
        };
        var insertCommand;
        for (var key in editors) {
            _loop_1(key);
        }
        var editCommand = new ContextCommand(this._locale.EditMenuLabel, 'fas fa-cog', function (elem) {
            _this.showSelectionDialog(elem);
        });
        result.push(editCommand);
        return result;
    };
    RichContentLinkEditor.prototype.removeEditorAlignmentClasses = function (elem) {
        elem.removeClass('rce-left rce-fill rce-right');
    };
    RichContentLinkEditor._localeRegistrations = {};
    return RichContentLinkEditor;
}(RichContentBaseEditor));
RichContentBaseEditor.RegisterEditor('RichContentLinkEditor', RichContentLinkEditor);
//# sourceMappingURL=RichContentLinkEditor.js.map  
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
var IconAlignment;
(function (IconAlignment) {
    IconAlignment[IconAlignment["None"] = 0] = "None";
    IconAlignment[IconAlignment["Left"] = 1] = "Left";
    IconAlignment[IconAlignment["Right"] = 2] = "Right";
})(IconAlignment || (IconAlignment = {}));
var RichContentFontAwesomeIconEditor = /** @class */ (function (_super) {
    __extends(RichContentFontAwesomeIconEditor, _super);
    function RichContentFontAwesomeIconEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RichContentFontAwesomeIconEditor.RegisterLocale = function (localeType, language) {
        RichContentFontAwesomeIconEditor._localeRegistrations[language] = localeType;
    };
    RichContentFontAwesomeIconEditor.prototype.Init = function (richContentEditor) {
        _super.prototype.Init.call(this, richContentEditor);
        this._locale = new RichContentFontAwesomeIconEditor._localeRegistrations[richContentEditor.Options.Language]();
    };
    RichContentFontAwesomeIconEditor.prototype.Insert = function (targetElement) {
        _super.prototype.Insert.call(this, targetElement);
        if (!targetElement) {
            targetElement = $('.rce-grid', this.RichContentEditorInstance.GridSelector);
        }
        this._appendElement = targetElement;
        this.showSelectionDialog(null);
    };
    RichContentFontAwesomeIconEditor.prototype.showSelectionDialog = function (elem) {
        var _this = this;
        var oldIconClass = null;
        var linkUrl = null;
        var lightBox = false;
        var update = elem !== null;
        var alignment = IconAlignment.None;
        if (elem) {
            var classes = $('.fas', elem).attr('class').split(/\s/);
            var filtered = classes.filter(function (cls) { return cls.substr(0, 3) === 'fa-'; });
            oldIconClass = filtered[0];
            alignment = this.getIconAlignment(elem);
        }
        var dialog = _this.getEditDialog();
        $('.rce-grid a', dialog).unbind('click');
        $('.rce-grid a', dialog).bind('click', function () {
            var classes = $('.fas', this).attr('class').split(/\s/);
            var filtered = classes.filter(function (cls) { return cls.substr(0, 3) === 'fa-'; });
            var newIconClass = filtered[0];
            if (newIconClass !== oldIconClass) {
                _this.OnChange();
                if (update) {
                    $('.rce-icon', elem).removeClass(oldIconClass);
                    _this.updateIcon(elem, newIconClass, linkUrl, lightBox, alignment);
                }
                else {
                    _this.InsertIcon(newIconClass, linkUrl, lightBox, alignment, _this._appendElement);
                }
            }
            var dialog = $(this).closest('.rce-dialog');
            _this.RichContentEditorInstance.DialogManager.CloseDialog(dialog);
        });
        this.RichContentEditorInstance.DialogManager.ShowDialog(dialog);
    };
    RichContentFontAwesomeIconEditor.prototype.InsertIcon = function (iconClass, linkUrl, lightBox, alignment, targetElement) {
        if (!targetElement) {
            targetElement = $("#" + this.RichContentEditorInstance.EditorId + " .rce-grid");
        }
        var inline = targetElement.is('a');
        var tag = inline ? 'span' : 'div';
        var iconWrapper = $("<" + tag + " class=\"rce-icon-wrapper\"></" + tag + ">");
        var icon = $('<i class="fas"></i>');
        iconWrapper.append(icon);
        this.updateIcon(iconWrapper, iconClass, linkUrl, lightBox, alignment);
        this.Attach(iconWrapper, targetElement);
    };
    RichContentFontAwesomeIconEditor.prototype.updateIcon = function (elem, iconClass, linkUrl, lightBox, alignment) {
        var icon = elem.find('.fas');
        icon.addClass(iconClass);
        var childToAppend = null;
        if (linkUrl) {
            var a = elem.find('a').first();
            if (!a.length) {
                a = $("<a href=\"" + linkUrl + "\"></a>");
                a.append(icon.detach());
                childToAppend = a;
            }
            if (lightBox && RichContentUtils.HasFeatherLight()) {
                //a.attr('href', 'javascript:');
                if (RichContentUtils.IsVideoUrl(linkUrl)) {
                    var mimeType = RichContentUtils.GetMimeType(linkUrl);
                    a.attr('data-featherlight', "<video class=\"video-js js-video\" preload=\"auto\" controls=\"\" autoplay=\"autoplay\"><source src=\"" + linkUrl + "\" type=\"" + mimeType + "\"></video>");
                }
                else {
                    a.attr('data-featherlight', linkUrl);
                }
            }
        }
        this.removeEditorAlignmentClasses(elem);
        elem.addClass(this.getIconAlignmentClass(alignment));
        if (childToAppend) {
            elem.append(childToAppend);
        }
    };
    RichContentFontAwesomeIconEditor.prototype.getIconAlignmentClass = function (alignment) {
        switch (alignment) {
            case IconAlignment.Left: return 'rce-icon-left';
            case IconAlignment.Right: return 'rce-icon-right';
            case IconAlignment.None: return '';
            default: throw "Unexpected alignment value: " + alignment;
        }
    };
    RichContentFontAwesomeIconEditor.prototype.getIconAlignment = function (elem) {
        if (elem.hasClass('rce-icon-left'))
            return IconAlignment.Left;
        if (elem.hasClass('rce-icon-right'))
            return IconAlignment.Right;
        return IconAlignment.None;
    };
    RichContentFontAwesomeIconEditor.prototype.GetDetectionSelectors = function () {
        return '.fas';
    };
    RichContentFontAwesomeIconEditor.prototype.Import = function (targetElement, source) {
        if (source.is('i.fas')) {
            var clone = source.clone();
            var inline = targetElement.is('a');
            var tag = inline ? 'span' : 'div';
            var imgWrapper = $("<" + tag + " class=\"rce-icon-wrapper\"></" + tag + ">");
            imgWrapper.append(clone);
            var img = imgWrapper.find('i');
            var alignment = IconAlignment.None;
            if (img.hasClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass())) {
                alignment = IconAlignment.Left;
                img.removeClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass());
            }
            else if (img.hasClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass())) {
                alignment = IconAlignment.Right;
                img.removeClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass());
            }
            if (alignment !== IconAlignment.None) {
                imgWrapper.addClass(this.getIconAlignmentClass(alignment));
            }
            source.replaceWith(imgWrapper);
            this.Attach(imgWrapper, targetElement);
        }
    };
    RichContentFontAwesomeIconEditor.prototype.GetMenuLabel = function () {
        return this._locale.MenuLabel;
    };
    RichContentFontAwesomeIconEditor.prototype.GetMenuIconClasses = function () {
        return 'fas fa-icons';
    };
    RichContentFontAwesomeIconEditor.prototype.AllowInTableCell = function () {
        return true;
    };
    RichContentFontAwesomeIconEditor.prototype.AllowInLink = function () {
        return true;
    };
    RichContentFontAwesomeIconEditor.prototype.Clean = function (elem) {
        var wrapper = elem.closest('.rce-icon-wrapper');
        if (wrapper.hasClass('rce-icon-left')) {
            elem.addClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass());
            var css = this.RichContentEditorInstance.GridFramework.GetLeftAlignCss();
            if (css != null)
                elem.css(css.Key, css.Value);
        }
        if (wrapper.hasClass('rce-icon-right')) {
            elem.addClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass());
            var css = this.RichContentEditorInstance.GridFramework.GetRightAlignCss();
            if (css != null)
                elem.css(css.Key, css.Value);
        }
        elem.removeAttr('draggable');
        _super.prototype.Clean.call(this, elem);
    };
    RichContentFontAwesomeIconEditor.prototype.GetContextButtonText = function (_elem) {
        return 'ico';
    };
    RichContentFontAwesomeIconEditor.prototype.GetContextCommands = function (_elem) {
        var _this = this;
        var leftCommand = new ContextCommand(this._locale.AlignLeftMenuLabel, 'fas fa-arrow-left', function (elem) {
            _this.removeEditorAlignmentClasses(elem);
            elem.addClass('rce-icon-left');
            _this.OnChange();
        });
        var rightCommand = new ContextCommand(this._locale.AlignRightMenuLabel, 'fas fa-arrow-right', function (elem) {
            _this.removeEditorAlignmentClasses(elem);
            elem.addClass('rce-icon-right');
            _this.OnChange();
        });
        var defaultCommand = new ContextCommand(this._locale.DefaultSizeMenuLabel, 'fas fa-compress-arrows-alt', function (elem) {
            _this.removeEditorAlignmentClasses(elem);
            _this.OnChange();
        });
        var editCommand = new ContextCommand(this._locale.EditMenuLabel, 'fas fa-cog', function (elem) {
            _this.showSelectionDialog(elem);
        });
        return [leftCommand, rightCommand, defaultCommand, editCommand];
    };
    RichContentFontAwesomeIconEditor.prototype.removeEditorAlignmentClasses = function (elem) {
        elem.removeClass('rce-icon-left rce-icon-right');
    };
    RichContentFontAwesomeIconEditor.prototype.getEditDialog = function () {
        var dialog = $('#' + this.RichContentEditorInstance.EditorId + ' .fa-icon-edit-dialog');
        if (!dialog.length) {
            dialog = $(this.getEditDialogHtml(this.RichContentEditorInstance.EditorId));
            dialog.appendTo($('#' + this.RichContentEditorInstance.EditorId));
        }
        return dialog;
    };
    RichContentFontAwesomeIconEditor.prototype.getEditDialogHtml = function (id) {
        return "\n            <div class=\"rce-dialog fa-icon-edit-dialog\">\n                <div class=\"rce-dialog-content\">\n                    <div class=\"rce-dialog-title\">" + this._locale.EditMenuLabel + "</div>\n                    <div class=\"rce-grid\" style=\"height: 400px; overflow-y: auto; font-size: 28px;\">\n                        <a href=\"javascript:\"><i class=\"fas fa-ad\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-address-book\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-address-card\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-adjust\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-air-freshener\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-align-center\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-align-justify\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-align-left\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-align-right\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-allergies\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-ambulance\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-american-sign-language-interpreting\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-anchor\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-angle-double-down\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-angle-double-left\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-angle-double-right\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-angle-double-up\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-angle-down\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-angle-left\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-angle-right\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-angle-up\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-angry\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-ankh\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-apple-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-archive\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-archway\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-arrow-alt-circle-down\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-arrow-alt-circle-left\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-arrow-alt-circle-right\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-arrow-alt-circle-up\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-arrow-circle-down\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-arrow-circle-left\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-arrow-circle-right\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-arrow-circle-up\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-arrow-down\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-arrow-left\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-arrow-right\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-arrow-up\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-arrows-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-arrows-alt-h\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-arrows-alt-v\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-assistive-listening-systems\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-asterisk\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-at\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-atlas\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-atom\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-audio-description\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-award\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-baby\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-baby-carriage\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-backspace\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-backward\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bacon\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bahai\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-balance-scale\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-balance-scale-left\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-balance-scale-right\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-ban\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-band-aid\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-barcode\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bars\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-baseball-ball\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-basketball-ball\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bath\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-battery-empty\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-battery-full\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-battery-half\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-battery-quarter\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-battery-three-quarters\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bed\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-beer\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bell\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bell-slash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bezier-curve\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bible\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bicycle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-biking\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-binoculars\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-biohazard\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-birthday-cake\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-blender\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-blender-phone\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-blind\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-blog\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bold\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bolt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bomb\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bone\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bong\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-book\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-book-dead\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-book-medical\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-book-open\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-book-reader\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bookmark\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-border-all\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-border-none\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-border-style\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bowling-ball\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-box\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-box-open\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-box-tissue\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-boxes\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-braille\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-brain\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bread-slice\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-briefcase\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-briefcase-medical\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-broadcast-tower\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-broom\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-brush\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bug\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-building\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bullhorn\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bullseye\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-burn\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bus\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-bus-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-business-time\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-calculator\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-calendar\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-calendar-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-calendar-check\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-calendar-day\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-calendar-minus\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-calendar-plus\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-calendar-times\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-calendar-week\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-camera\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-camera-retro\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-campground\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-candy-cane\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cannabis\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-capsules\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-car\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-car-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-car-battery\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-car-crash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-car-side\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-caravan\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-caret-down\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-caret-left\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-caret-right\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-caret-square-down\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-caret-square-left\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-caret-square-right\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-caret-square-up\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-caret-up\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-carrot\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cart-arrow-down\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cart-plus\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cash-register\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cat\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-certificate\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chair\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chalkboard\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chalkboard-teacher\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-charging-station\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chart-area\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chart-bar\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chart-line\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chart-pie\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-check\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-check-circle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-check-double\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-check-square\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cheese\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chess\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chess-bishop\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chess-board\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chess-king\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chess-knight\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chess-pawn\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chess-queen\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chess-rook\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chevron-circle-down\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chevron-circle-left\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chevron-circle-right\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chevron-circle-up\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chevron-down\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chevron-left\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chevron-right\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-chevron-up\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-child\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-church\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-circle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-circle-notch\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-city\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-clinic-medical\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-clipboard\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-clipboard-check\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-clipboard-list\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-clock\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-clone\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-closed-captioning\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cloud\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cloud-download-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cloud-meatball\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cloud-moon\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cloud-moon-rain\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cloud-rain\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cloud-showers-heavy\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cloud-sun\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cloud-sun-rain\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cloud-upload-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cocktail\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-code\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-code-branch\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-coffee\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cog\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cogs\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-coins\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-columns\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-comment\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-comment-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-comment-dollar\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-comment-dots\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-comment-medical\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-comment-slash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-comments\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-comments-dollar\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-compact-disc\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-compass\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-compress\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-compress-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-compress-arrows-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-concierge-bell\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cookie\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cookie-bite\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-copy\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-copyright\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-couch\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-credit-card\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-crop\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-crop-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cross\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-crosshairs\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-crow\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-crown\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-crutch\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cube\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cubes\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-cut\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-database\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-deaf\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-democrat\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-desktop\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dharmachakra\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-diagnoses\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dice\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dice-d20\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dice-d6\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dice-five\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dice-four\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dice-one\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dice-six\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dice-three\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dice-two\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-digital-tachograph\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-directions\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-disease\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-divide\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dizzy\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dna\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dog\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dollar-sign\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dolly\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dolly-flatbed\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-donate\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-door-closed\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-door-open\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dot-circle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dove\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-download\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-drafting-compass\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dragon\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-draw-polygon\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-drum\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-drum-steelpan\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-drumstick-bite\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dumbbell\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dumpster\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dumpster-fire\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-dungeon\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-edit\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-egg\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-eject\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-ellipsis-h\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-ellipsis-v\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-envelope\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-envelope-open\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-envelope-open-text\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-envelope-square\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-equals\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-eraser\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-ethernet\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-euro-sign\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-exchange-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-exclamation\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-exclamation-circle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-exclamation-triangle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-expand\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-expand-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-expand-arrows-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-external-link-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-external-link-square-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-eye\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-eye-dropper\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-eye-slash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-fan\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-fast-backward\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-fast-forward\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-faucet\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-fax\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-feather\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-feather-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-female\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-fighter-jet\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-archive\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-audio\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-code\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-contract\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-csv\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-download\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-excel\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-export\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-image\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-import\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-invoice\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-invoice-dollar\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-medical\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-medical-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-pdf\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-powerpoint\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-prescription\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-signature\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-upload\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-video\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-file-word\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-fill\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-fill-drip\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-film\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-filter\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-fingerprint\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-fire\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-fire-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-fire-extinguisher\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-first-aid\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-fish\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-fist-raised\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-flag\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-flag-checkered\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-flag-usa\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-flask\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-flushed\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-folder\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-folder-minus\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-folder-open\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-folder-plus\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-font\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-football-ball\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-forward\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-frog\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-frown\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-frown-open\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-funnel-dollar\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-futbol\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-gamepad\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-gas-pump\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-gavel\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-gem\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-genderless\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-ghost\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-gift\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-gifts\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-glass-cheers\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-glass-martini\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-glass-martini-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-glass-whiskey\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-glasses\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-globe\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-globe-africa\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-globe-americas\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-globe-asia\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-globe-europe\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-golf-ball\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-gopuram\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-graduation-cap\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-greater-than\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-greater-than-equal\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-grimace\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-grin\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-grin-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-grin-beam\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-grin-beam-sweat\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-grin-hearts\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-grin-squint\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-grin-squint-tears\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-grin-stars\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-grin-tears\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-grin-tongue\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-grin-tongue-squint\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-grin-tongue-wink\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-grin-wink\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-grip-horizontal\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-grip-lines\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-grip-lines-vertical\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-grip-vertical\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-guitar\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-h-square\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hamburger\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hammer\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hamsa\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hand-holding\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hand-holding-heart\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hand-holding-medical\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hand-holding-usd\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hand-holding-water\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hand-lizard\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hand-middle-finger\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hand-paper\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hand-peace\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hand-point-down\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hand-point-left\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hand-point-right\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hand-point-up\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hand-pointer\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hand-rock\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hand-scissors\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hand-sparkles\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hand-spock\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hands\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hands-helping\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hands-wash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-handshake\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-handshake-alt-slash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-handshake-slash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hanukiah\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hard-hat\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hashtag\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hat-cowboy\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hat-cowboy-side\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hat-wizard\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hdd\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-head-side-cough\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-head-side-cough-slash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-head-side-mask\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-head-side-virus\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-heading\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-headphones\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-headphones-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-headset\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-heart\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-heart-broken\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-heartbeat\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-helicopter\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-highlighter\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hiking\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hippo\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-history\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hockey-puck\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-holly-berry\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-home\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-horse\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-horse-head\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hospital\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hospital-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hospital-symbol\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hospital-user\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hot-tub\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hotdog\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hotel\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hourglass\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hourglass-end\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hourglass-half\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hourglass-start\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-house-damage\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-house-user\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-hryvnia\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-i-cursor\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-ice-cream\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-icicles\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-icons\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-id-badge\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-id-card\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-id-card-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-igloo\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-image\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-images\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-inbox\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-indent\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-industry\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-infinity\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-info\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-info-circle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-italic\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-jedi\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-joint\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-journal-whills\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-kaaba\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-key\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-keyboard\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-khanda\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-kiss\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-kiss-beam\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-kiss-wink-heart\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-kiwi-bird\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-landmark\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-language\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-laptop\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-laptop-code\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-laptop-house\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-laptop-medical\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-laugh\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-laugh-beam\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-laugh-squint\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-laugh-wink\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-layer-group\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-leaf\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-lemon\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-less-than\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-less-than-equal\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-level-down-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-level-up-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-life-ring\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-lightbulb\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-link\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-lira-sign\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-list\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-list-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-list-ol\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-list-ul\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-location-arrow\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-lock\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-lock-open\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-long-arrow-alt-down\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-long-arrow-alt-left\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-long-arrow-alt-right\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-long-arrow-alt-up\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-low-vision\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-luggage-cart\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-lungs\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-lungs-virus\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-magic\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-magnet\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-mail-bulk\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-male\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-map\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-map-marked\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-map-marked-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-map-marker\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-map-marker-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-map-pin\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-map-signs\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-marker\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-mars\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-mars-double\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-mars-stroke\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-mars-stroke-h\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-mars-stroke-v\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-mask\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-medal\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-medkit\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-meh\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-meh-blank\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-meh-rolling-eyes\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-memory\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-menorah\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-mercury\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-meteor\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-microchip\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-microphone\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-microphone-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-microphone-alt-slash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-microphone-slash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-microscope\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-minus\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-minus-circle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-minus-square\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-mitten\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-mobile\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-mobile-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-money-bill\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-money-bill-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-money-bill-wave\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-money-bill-wave-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-money-check\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-money-check-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-monument\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-moon\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-mortar-pestle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-mosque\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-motorcycle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-mountain\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-mouse\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-mouse-pointer\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-mug-hot\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-music\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-network-wired\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-neuter\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-newspaper\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-not-equal\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-notes-medical\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-object-group\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-object-ungroup\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-oil-can\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-om\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-otter\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-outdent\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-pager\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-paint-brush\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-paint-roller\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-palette\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-pallet\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-paper-plane\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-paperclip\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-parachute-box\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-paragraph\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-parking\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-passport\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-pastafarianism\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-paste\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-pause\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-pause-circle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-paw\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-peace\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-pen\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-pen-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-pen-fancy\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-pen-nib\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-pen-square\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-pencil-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-pencil-ruler\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-people-arrows\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-people-carry\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-pepper-hot\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-percent\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-percentage\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-person-booth\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-phone\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-phone-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-phone-slash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-phone-square\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-phone-square-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-phone-volume\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-photo-video\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-piggy-bank\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-pills\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-pizza-slice\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-place-of-worship\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-plane\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-plane-arrival\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-plane-departure\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-plane-slash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-play\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-play-circle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-plug\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-plus\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-plus-circle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-plus-square\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-podcast\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-poll\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-poll-h\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-poo\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-poo-storm\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-poop\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-portrait\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-pound-sign\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-power-off\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-pray\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-praying-hands\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-prescription\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-prescription-bottle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-prescription-bottle-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-print\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-procedures\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-project-diagram\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-pump-medical\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-pump-soap\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-puzzle-piece\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-qrcode\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-question\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-question-circle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-quidditch\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-quote-left\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-quote-right\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-quran\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-radiation\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-radiation-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-rainbow\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-random\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-receipt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-record-vinyl\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-recycle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-redo\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-redo-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-registered\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-remove-format\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-reply\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-reply-all\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-republican\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-restroom\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-retweet\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-ribbon\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-ring\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-road\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-robot\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-rocket\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-route\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-rss\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-rss-square\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-ruble-sign\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-ruler\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-ruler-combined\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-ruler-horizontal\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-ruler-vertical\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-running\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-rupee-sign\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sad-cry\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sad-tear\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-satellite\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-satellite-dish\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-save\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-school\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-screwdriver\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-scroll\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sd-card\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-search\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-search-dollar\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-search-location\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-search-minus\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-search-plus\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-seedling\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-server\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-shapes\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-share\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-share-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-share-alt-square\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-share-square\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-shekel-sign\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-shield-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-shield-virus\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-ship\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-shipping-fast\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-shoe-prints\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-shopping-bag\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-shopping-basket\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-shopping-cart\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-shower\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-shuttle-van\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sign\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sign-in-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sign-language\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sign-out-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-signal\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-signature\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sim-card\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sitemap\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-skating\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-skiing\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-skiing-nordic\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-skull\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-skull-crossbones\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-slash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sleigh\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sliders-h\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-smile\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-smile-beam\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-smile-wink\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-smog\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-smoking\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-smoking-ban\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sms\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-snowboarding\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-snowflake\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-snowman\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-snowplow\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-soap\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-socks\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-solar-panel\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sort\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sort-alpha-down\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sort-alpha-down-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sort-alpha-up\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sort-alpha-up-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sort-amount-down\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sort-amount-down-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sort-amount-up\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sort-amount-up-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sort-down\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sort-numeric-down\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sort-numeric-down-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sort-numeric-up\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sort-numeric-up-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sort-up\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-spa\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-space-shuttle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-spell-check\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-spider\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-spinner\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-splotch\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-spray-can\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-square\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-square-full\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-square-root-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-stamp\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-star\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-star-and-crescent\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-star-half\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-star-half-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-star-of-david\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-star-of-life\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-step-backward\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-step-forward\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-stethoscope\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sticky-note\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-stop\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-stop-circle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-stopwatch\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-stopwatch-20\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-store\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-store-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-store-alt-slash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-store-slash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-stream\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-street-view\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-strikethrough\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-stroopwafel\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-subscript\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-subway\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-suitcase\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-suitcase-rolling\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sun\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-superscript\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-surprise\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-swatchbook\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-swimmer\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-swimming-pool\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-synagogue\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sync\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-sync-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-syringe\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-table\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-table-tennis\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-tablet\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-tablet-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-tablets\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-tachometer-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-tag\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-tags\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-tape\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-tasks\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-taxi\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-teeth\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-teeth-open\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-temperature-high\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-temperature-low\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-tenge\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-terminal\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-text-height\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-text-width\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-th\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-th-large\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-th-list\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-theater-masks\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-thermometer\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-thermometer-empty\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-thermometer-full\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-thermometer-half\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-thermometer-quarter\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-thermometer-three-quarters\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-thumbs-down\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-thumbs-up\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-thumbtack\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-ticket-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-times\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-times-circle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-tint\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-tint-slash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-tired\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-toggle-off\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-toggle-on\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-toilet\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-toilet-paper\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-toilet-paper-slash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-toolbox\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-tools\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-tooth\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-torah\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-torii-gate\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-tractor\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-trademark\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-traffic-light\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-trailer\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-train\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-tram\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-transgender\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-transgender-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-trash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-trash-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-trash-restore\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-trash-restore-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-tree\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-trophy\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-truck\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-truck-loading\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-truck-monster\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-truck-moving\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-truck-pickup\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-tshirt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-tty\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-tv\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-umbrella\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-umbrella-beach\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-underline\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-undo\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-undo-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-universal-access\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-university\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-unlink\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-unlock\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-unlock-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-upload\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-alt-slash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-astronaut\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-check\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-circle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-clock\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-cog\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-edit\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-friends\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-graduate\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-injured\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-lock\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-md\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-minus\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-ninja\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-nurse\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-plus\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-secret\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-shield\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-slash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-tag\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-tie\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-user-times\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-users\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-users-cog\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-utensil-spoon\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-utensils\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-vector-square\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-venus\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-venus-double\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-venus-mars\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-vial\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-vials\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-video\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-video-slash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-vihara\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-virus\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-virus-slash\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-viruses\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-voicemail\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-volleyball-ball\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-volume-down\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-volume-mute\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-volume-off\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-volume-up\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-vote-yea\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-vr-cardboard\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-walking\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-wallet\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-warehouse\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-water\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-wave-square\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-weight\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-weight-hanging\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-wheelchair\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-wifi\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-wind\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-window-close\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-window-maximize\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-window-minimize\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-window-restore\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-wine-bottle\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-wine-glass\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-wine-glass-alt\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-won-sign\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-wrench\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-x-ray\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-yen-sign\"></i></a>\n                        <a href=\"javascript:\"><i class=\"fas fa-yin-yang\"></i></a>\n                    </div>\n                    <div class=\"rce-clear\"></div>\n                </div>\n                <div class=\"rce-dialog-footer\">\n                    <a href=\"javascript:\" class=\"rce-button rce-button-flat rce-close-dialog\">" + this.RichContentEditorInstance.DialogManager.Locale.DialogCancelButton + "</a>\n                </div>\n            </div>";
    };
    RichContentFontAwesomeIconEditor._localeRegistrations = {};
    return RichContentFontAwesomeIconEditor;
}(RichContentBaseEditor));
RichContentBaseEditor.RegisterEditor('RichContentFontAwesomeIconEditor', RichContentFontAwesomeIconEditor);
//# sourceMappingURL=RichContentFontAwesomeIconEditor.js.map  
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
        if (elem.hasClass('col')) {
            var alignment = this.getTableColumnAlignment(elem);
            this.setFrameworkColumnAlignment(elem, alignment);
            this.cleanEditorColumnAlignment(elem);
        }
        if (elem.hasClass('inner') && elem.parent().hasClass('col')) {
            this.RichContentEditorInstance.EliminateElement(elem);
        }
        if (elem.hasClass('rce-table')) {
            elem.removeClass('rce-table').addClass('table');
        }
        _super.prototype.Clean.call(this, elem);
    };
    RichContentTableEditor.prototype.AllowInTableCell = function () {
        return true;
    };
    RichContentTableEditor.prototype.addTableRow = function (table) {
        var rowClass = this.RichContentEditorInstance.GridFramework.GetRowClass();
        var row = $("<div class=\"" + rowClass + "\"></div>");
        this.addTableColumn(row);
        table.append(row);
        this.SetupEditor(row, true);
        this.attachRow(row);
    };
    RichContentTableEditor.prototype.attachRow = function (row) {
        if (window.Sortable) {
            window.Sortable.create(row[0], {
                group: 'row-content',
                draggable: '.rce-editor-wrapper'
            });
            window.Sortable.create(row.closest('.rce-table')[0], {
                group: 'table-content',
                draggable: '.rce-editor-wrapper'
            });
        }
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
        this.attachColumn(col);
        col.appendTo(row);
        this.SetupEditor(col, true);
    };
    RichContentTableEditor.prototype.attachColumn = function (col) {
        if (window.Sortable) {
            window.Sortable.create(col.find('.inner')[0], {
                group: 'column-content',
                draggable: '.rce-editor-wrapper'
            });
        }
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
    RichContentTableEditor.prototype.GetDetectionSelectors = function () {
        return '.table,.row,.col';
    };
    RichContentTableEditor.prototype.Import = function (targetElement, source) {
        var _this = this;
        if (source.is('.table')) {
            var table = $('<div class="rce-table"></div>').addClass(source.attr('class')).removeClass('table');
            var rows = source.find(' > .row').clone();
            rows.addClass(['rce-editor-wrapper', 'rce-editor-wrapper-keep']);
            var cols = rows.find(' > .col');
            cols.addClass(['rce-editor-wrapper', 'rce-editor-wrapper-keep']);
            table.append(rows);
            rows.each(function () {
                _this.attachRow($(this));
            });
            cols.each(function () {
                var inner = $('<div class="inner"></div>');
                _this.RichContentEditorInstance.ImportChildren(inner, $(this), true, false);
                var alignment = _this.getFrameworkTableColumnAlignment($(this));
                _this.setEditorColumnAlignment($(this), alignment);
                $(this).empty();
                $(this).append(inner);
                _this.attachColumn($(this));
            });
            this.SetupEditor(rows, true);
            this.SetupEditor(cols, true);
            var tableWrapper = $('<div class="rce-table-wrapper"></div>');
            tableWrapper.append(table);
            source.replaceWith(tableWrapper);
            this.Attach(tableWrapper, targetElement);
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
        var editorId = this.RichContentEditorInstance.EditorId;
        var _loop_1 = function (key) {
            var editor = editors[key];
            if (editor.AllowInTableCell()) {
                insertCommand = new ContextCommand(editor.GetMenuLabel(), editor.GetMenuIconClasses(), function (elem) {
                    var inner = elem.find('.inner');
                    editor.Insert(inner);
                    _this.OnChange();
                    if (window.Sortable) {
                        window.Sortable.create(inner[0], {
                            group: 'col',
                            draggable: '.rce-editor-wrapper'
                        });
                    }
                });
                result.push(insertCommand);
            }
        };
        var insertCommand;
        for (var key in editors) {
            _loop_1(key);
        }
        var widthCommand = new ContextCommand(this._locale.SettingsMenuLabel, 'fas fa-cog', function (elem) {
            var dialog = _this.getColumnWidthDialog();
            $('input.rce-column-width-s', dialog).val(_this.getTableColumnWidth(elem, _this.RichContentEditorInstance.GridFramework.GetSmallPrefix(), true));
            $('input.rce-column-width-m', dialog).val(_this.getTableColumnWidth(elem, _this.RichContentEditorInstance.GridFramework.GetMediumPrefix(), false));
            $('input.rce-column-width-l', dialog).val(_this.getTableColumnWidth(elem, _this.RichContentEditorInstance.GridFramework.GetLargePrefix(), false));
            $('input.rce-column-width-xl', dialog).val(_this.getTableColumnWidth(elem, _this.RichContentEditorInstance.GridFramework.GetExtraLargePrefix(), false));
            var alignment = _this.getTableColumnAlignment(elem);
            if (alignment === ColumnAlignment.Center) {
                $('#' + editorId + '_AlignCenter').prop('checked', true);
            }
            else if (alignment === ColumnAlignment.Right) {
                $('#' + editorId + '_AlignRight').prop('checked', true);
            }
            else {
                $('#' + editorId + '_AlignLeft').prop('checked', true);
            }
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
                var alignment = ColumnAlignment.Left;
                if ($('#' + editorId + '_AlignCenter').prop('checked')) {
                    alignment = ColumnAlignment.Center;
                }
                else if ($('#' + editorId + '_AlignRight').prop('checked')) {
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
    };
    RichContentTableEditor.prototype.setEditorColumnAlignment = function (elem, alignment) {
        var gridFramework = this.RichContentEditorInstance.GridFramework;
        elem.removeClass([gridFramework.GetColumnLeftAlignClass(), gridFramework.GetColumnCenterAlignClass(), gridFramework.GetColumnRightAlignClass()]);
        if (alignment === ColumnAlignment.Center) {
            elem.addClass(gridFramework.GetColumnCenterAlignClass());
        }
        else if (alignment === ColumnAlignment.Right) {
            elem.addClass(gridFramework.GetColumnRightAlignClass());
        }
        else {
            elem.addClass(gridFramework.GetColumnLeftAlignClass());
        }
    };
    RichContentTableEditor.prototype.setFrameworkColumnAlignment = function (elem, alignment) {
        this.cleanEditorColumnAlignment(elem);
        if (alignment === ColumnAlignment.Center) {
            elem.addClass('rce-col-align-center');
        }
        else if (alignment === ColumnAlignment.Right) {
            elem.addClass('rce-col-align-right');
        }
        else {
            elem.addClass('rce-col-align-left');
        }
    };
    RichContentTableEditor.prototype.cleanEditorColumnAlignment = function (elem) {
        elem.removeClass(['rce-col-align-left', 'rce-col-align-center', 'rce-col-align-right']);
    };
    RichContentTableEditor.prototype.getTableColumnAlignment = function (elem) {
        if (elem.hasClass('rce-col-align-left'))
            return ColumnAlignment.Left;
        if (elem.hasClass('rce-col-align-center'))
            return ColumnAlignment.Center;
        if (elem.hasClass('rce-col-align-right'))
            return ColumnAlignment.Right;
    };
    RichContentTableEditor.prototype.getFrameworkTableColumnAlignment = function (elem) {
        var gridFramework = this.RichContentEditorInstance.GridFramework;
        if (elem.hasClass(gridFramework.GetColumnLeftAlignClass()))
            return ColumnAlignment.Left;
        if (elem.hasClass(gridFramework.GetColumnCenterAlignClass()))
            return ColumnAlignment.Center;
        if (elem.hasClass(gridFramework.GetColumnRightAlignClass()))
            return ColumnAlignment.Right;
    };
    RichContentTableEditor.prototype.getRowContextCommands = function (_elem) {
        var _this = this;
        var result = [];
        var insertColumnCommand = new ContextCommand(this._locale.InsertColumnMenuLabel, 'fas fa-indent', function (elem) {
            _this.addTableColumn(elem);
            _this.OnChange();
            if (window.Sortable) {
                window.Sortable.create(elem[0], {
                    group: 'row-content',
                    draggable: '.rce-editor-wrapper'
                });
            }
        });
        result.push(insertColumnCommand);
        return result;
    };
    RichContentTableEditor.prototype.getTableContextCommands = function (_elem) {
        var _this = this;
        var result = [];
        var insertRowCommand = new ContextCommand(this._locale.InsertRowMenuLabel, 'fas fa-indent', function (elem) {
            _this.addTableRow(elem.find('.rce-table'));
            _this.OnChange();
        });
        result.push(insertRowCommand);
        return result;
    };
    RichContentTableEditor.prototype.getActualElement = function (elem) {
        if (elem.hasClass('rce-table-wrapper')) {
            return elem.find(' > .rce-table');
        }
        return elem;
    };
    RichContentTableEditor.prototype.getColumnWidthDialog = function () {
        var dialog = $('#' + this.RichContentEditorInstance.EditorId + ' .column-width-dialog');
        if (!dialog.length) {
            dialog = $(this.getColumnWidthDialogHtml(this.RichContentEditorInstance.EditorId));
            dialog.appendTo($('#' + this.RichContentEditorInstance.EditorId));
        }
        return dialog;
    };
    RichContentTableEditor.prototype.getColumnWidthDialogHtml = function (id) {
        var validateWidthMessage = this._locale.ValidateWidthMessage.replace('{0}', this.RichContentEditorInstance.GridFramework.GetColumnCount().toString());
        return "\n            <div class=\"rce-dialog column-width-dialog\">\n                <div class=\"rce-dialog-content\">\n                    <div class=\"rce-dialog-title\">" + this._locale.SettingsDialogTitle + "</div>\n                    <div class=\"rce-left\" style=\"width: 50%; padding-right: 10px;\">\n                        <b>" + this._locale.ColumnWidthLabel + "</b>\n                        <div class=\"rce-form-field rce-form-field-inline\">\n                            <label for=\"" + id + "_WidthS\" class=\"rce-label\">" + this._locale.ColumnWidthSmall + "</label>\n                            <input id=\"" + id + "_WidthS\" class=\"validate rce-input rce-column-width-s browser-default\" type=\"number\" required=\"required\" max=\"" + this.RichContentEditorInstance.GridFramework.GetColumnCount() + "\" />\n                            <span class=\"rce-error-text\">" + validateWidthMessage + "</span>\n                        </div>\n                        <div class=\"rce-form-field rce-form-field-inline\">\n                            <label for=\"" + id + "_WidthM\" class=\"rce-label\">" + this._locale.ColumnWidthMedium + "</label>\n                            <input id=\"" + id + "_WidthM\" class=\"validate rce-input rce-column-width-m browser-default\" type=\"number\" required=\"required\" max=\"" + this.RichContentEditorInstance.GridFramework.GetColumnCount() + "\" />\n                            <span class=\"rce-error-text\">" + validateWidthMessage + "</span>\n                        </div>\n                        <div class=\"rce-form-field rce-form-field-inline\">\n                            <label for=\"" + id + "_WidthL\" class=\"rce-label\">" + this._locale.ColumnWidthTablet + "</label>\n                            <input id=\"" + id + "_WidthL\" class=\"validate rce-input rce-column-width-l browser-default\" type=\"number\" required=\"required\" max=\"" + this.RichContentEditorInstance.GridFramework.GetColumnCount() + "\" />\n                            <span class=\"rce-error-text\">" + validateWidthMessage + "</span>\n                        </div>\n                        <div class=\"rce-form-field rce-form-field-inline\">\n                            <label for=\"" + id + "_WidthXL\" class=\"rce-label\">" + this._locale.ColumnWidthDesktop + "</label>\n                            <input id=\"" + id + "_WidthXL\" class=\"validate rce-input  rce-column-width-xl browser-default\" type=\"number\" required=\"required\" max=\"" + this.RichContentEditorInstance.GridFramework.GetColumnCount() + "\" />\n                            <span class=\"rce-error-text\">" + validateWidthMessage + "</span>\n                        </div>\n                        <div class=\"rce-form-field rce-form-field-inline\">\n                            <label class=\"rce-label\">" + this._locale.AlignmentLabel + "</label>\n                            <div class=\"rce-input-group\">\n                                <label class=\"rce-radio\">\n                                    <input  id=\"" + id + "_AlignLeft\" name=\"" + id + "_Align\" type=\"radio\" />\n                                    <span>Left</span>\n                                </label><br/>\n                                <label class=\"rce-radio\">\n                                    <input  id=\"" + id + "_AlignCenter\" name=\"" + id + "_Align\" type=\"radio\" />\n                                    <span>Center</span>\n                                </label><br/>\n                                <label class=\"rce-radio\">\n                                    <input  id=\"" + id + "_AlignRight\" name=\"" + id + "_Align\" type=\"radio\" />\n                                    <span>Right</span>\n                                </label>\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"rce-clear\"></div>\n                </div>\n                <div class=\"rce-dialog-footer\">\n                    <a href=\"javascript:\" class=\"rce-button rce-button-flat rce-close-dialog\">" + this.RichContentEditorInstance.DialogManager.Locale.DialogCancelButton + "</a>\n                    <a href=\"javascript:\" class=\"rce-button rce-submit-dialog\">" + this.RichContentEditorInstance.DialogManager.Locale.DialogSaveButton + "</a>\n                </div>\n            </div>";
    };
    RichContentTableEditor._localeRegistrations = {};
    return RichContentTableEditor;
}(RichContentBaseEditor));
RichContentBaseEditor.RegisterEditor('RichContentTableEditor', RichContentTableEditor);
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
        return 'float-right';
    };
    GridFrameworkBootstrap.prototype.GetLeftAlignClass = function () {
        return 'float-left';
    };
    GridFrameworkBootstrap.prototype.GetBlockAlignClass = function () {
        return null;
    };
    GridFrameworkBootstrap.prototype.GetRightAlignCss = function () {
        return null;
    };
    GridFrameworkBootstrap.prototype.GetLeftAlignCss = function () {
        return null;
    };
    GridFrameworkBootstrap.prototype.GetColumnLeftAlignClass = function () {
        return "text-left";
    };
    GridFrameworkBootstrap.prototype.GetColumnCenterAlignClass = function () {
        return "text-center";
    };
    GridFrameworkBootstrap.prototype.GetColumnRightAlignClass = function () {
        return "text-right";
    };
    return GridFrameworkBootstrap;
}(GridFrameworkBase));
GridFrameworkBase.Register('GridFrameworkBootstrap', GridFrameworkBootstrap);
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
    GridFrameworkMaterialize.prototype.GetBlockAlignClass = function () {
        return 'fill';
    };
    GridFrameworkMaterialize.prototype.GetRightAlignCss = function () {
        return null;
    };
    GridFrameworkMaterialize.prototype.GetLeftAlignCss = function () {
        return null;
    };
    GridFrameworkMaterialize.prototype.GetBlockAlignCss = function () {
        return null;
    };
    GridFrameworkMaterialize.prototype.GetColumnLeftAlignClass = function () {
        return "left-align";
    };
    GridFrameworkMaterialize.prototype.GetColumnCenterAlignClass = function () {
        return "center-align";
    };
    GridFrameworkMaterialize.prototype.GetColumnRightAlignClass = function () {
        return "right-align";
    };
    return GridFrameworkMaterialize;
}(GridFrameworkBase));
GridFrameworkBase.Register('GridFrameworkMaterialize', GridFrameworkMaterialize);
//# sourceMappingURL=GridFrameworkMaterialize.js.map  
var XYPosition = /** @class */ (function () {
    function XYPosition(x, y) {
        this.X = x;
        this.Y = y;
    }
    return XYPosition;
}());
var RichContentUtils = /** @class */ (function () {
    function RichContentUtils() {
    }
    RichContentUtils.GetMimeType = function (url) {
        var ext = this.GetExtensionOfUrl(url);
        if (ext === 'mp4') {
            return 'video/mp4';
        }
        return null;
    };
    RichContentUtils.IsVideoUrl = function (url) {
        var ext = this.GetExtensionOfUrl(url);
        if (ext === 'mp4') {
            return true;
        }
        return false;
    };
    RichContentUtils.HasFeatherLight = function () {
        return window.$.featherlight;
    };
    RichContentUtils.GetExtensionOfUrl = function (url) {
        var lastPointIndex = url.lastIndexOf('.');
        if (lastPointIndex > -1) {
            return url.substr(lastPointIndex + 1).toLowerCase();
        }
        return null;
    };
    RichContentUtils.ShowMenu = function (menu, buttonOrPosition) {
        var xy;
        if (buttonOrPosition instanceof XYPosition) {
            xy = buttonOrPosition;
        }
        else {
            var button = buttonOrPosition;
            menu.data('origin', button);
            xy = new XYPosition(button.offset().left, button.offset().top + button.height());
        }
        menu.css({ left: xy.X, top: xy.Y });
        $('body').append(menu);
    };
    RichContentUtils.IsNullOrEmpty = function (value) {
        return value === null || value === '' || value === undefined;
    };
    return RichContentUtils;
}());
//# sourceMappingURL=RichContentUtils.js.map  
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
        this.ByUrlTab = "By URL";
        this.ByUploadTab = "By Upload";
        this.BySelectionTab = "Select File";
        this.EnterUrlValidation = "Enter a correct URL";
        this.ImageByUrlMessage = "Enter the url in the Image URL field below.";
        this.ImageSelectionDialogTitle = "Insert Image";
        this.ImageUrlField = "Image URL";
        this.LinkByUrlMessage = "Enter the url in the Link URL field below.";
        this.LinkSelectionDialogTitle = "Insert Link";
        this.LinkUrlField = "Link URL";
        this.UploadButton = "Upload";
        this.NoUploadPlaceholder = "No file uploaded...";
        this.NoSelectionPlaceholder = "No file selected...";
        this.UploadValidation = "Upload a file to continue";
        this.SelectValidation = "Select a file to continue";
        this.LoadingProgressMessage = "Loading...";
        this.OpenInNewTagCheckBox = "Open in new tab";
    }
    return FileManagerLocale;
}());
FileManager.RegisterLocale(FileManagerLocale, 'EN');
//# sourceMappingURL=FileManagerLocaleEN.js.map  
var RichContentEditorLocale = /** @class */ (function () {
    function RichContentEditorLocale() {
        this.Delete = "Delete";
        this.FieldRequiredLabel = "This field is required";
        this.EditClasses = "Edit CSS Classes";
    }
    return RichContentEditorLocale;
}());
RichContentEditor.RegisterLocale(RichContentEditorLocale, 'EN');
//# sourceMappingURL=RichContentEditorLocaleEN.js.map  
var RichContentFontAwesomeIconEditorLocale = /** @class */ (function () {
    function RichContentFontAwesomeIconEditorLocale() {
        this.MenuLabel = "Fontawesome Icon";
        this.AlignLeftMenuLabel = "Align Left";
        this.AlignRightMenuLabel = "Align Right";
        this.DefaultSizeMenuLabel = "Reset Alignment";
        this.EditMenuLabel = "Select Icon";
        this.IconLabel = "Icon";
        this.FieldRequiredLabel = "This field is required";
    }
    return RichContentFontAwesomeIconEditorLocale;
}());
RichContentFontAwesomeIconEditor.RegisterLocale(RichContentFontAwesomeIconEditorLocale, 'EN');
//# sourceMappingURL=RichContentFontAwesomeIconEditorLocaleEN.js.map  
var RichContentHeadingEditorLocale = /** @class */ (function () {
    function RichContentHeadingEditorLocale() {
        this.MenuLabel = "Heading";
        this.Size = "Size";
        this.ColumnSizeDialogTitle = "Change Size";
        this.ValidateSizeMessage = "Size must be between 1 and 6";
        this.SizeLabel = "Size";
    }
    return RichContentHeadingEditorLocale;
}());
RichContentHeadingEditor.RegisterLocale(RichContentHeadingEditorLocale, 'EN');
//# sourceMappingURL=RichContentHeadingEditorLocaleEN.js.map  
var RichContentImageEditorLocale = /** @class */ (function () {
    function RichContentImageEditorLocale() {
        this.MenuLabel = "Image";
        this.AlignLeftMenuLabel = "Align Left";
        this.AlignRightMenuLabel = "Align Right";
        this.BlockAlignMenuLabel = "Full Width";
        this.DefaultSizeMenuLabel = "Default Width";
        this.EditMenuLabel = "Edit Settings";
    }
    return RichContentImageEditorLocale;
}());
RichContentImageEditor.RegisterLocale(RichContentImageEditorLocale, 'EN');
//# sourceMappingURL=RichContentImageEditorLocaleEN.js.map  
var RichContentVideoEditorLocale = /** @class */ (function () {
    function RichContentVideoEditorLocale() {
        this.MenuLabel = "Video";
        this.EditMenuLabel = "Edit Settings";
    }
    return RichContentVideoEditorLocale;
}());
RichContentVideoEditor.RegisterLocale(RichContentVideoEditorLocale, 'EN');
//# sourceMappingURL=RichContentVideoEditorLocaleEN.js.map  
var RichContentLinkEditorLocale = /** @class */ (function () {
    function RichContentLinkEditorLocale() {
        this.MenuLabel = "Link";
        this.EditorDialogTitle = "Edit Link";
        this.UrlLabel = "URL";
        this.AlignmentLabel = "Alignment";
        this.AlignNoneLabel = "None";
        this.AlignLeftLabel = "Left";
        this.AlignFillLabel = "Fill";
        this.AlignRightLabel = "Right";
        this.AlignLeftMenuLabel = "Align Left";
        this.AlignRightMenuLabel = "Align Right";
        this.BlockAlignMenuLabel = "Full Width";
        this.DefaultSizeMenuLabel = "Default Width";
        this.EditMenuLabel = "Edit Settings";
    }
    return RichContentLinkEditorLocale;
}());
RichContentLinkEditor.RegisterLocale(RichContentLinkEditorLocale, 'EN');
//# sourceMappingURL=RichContentLinkEditorLocaleEN.js.map  
var RichContentFontAwesomeIconEditorLocale = /** @class */ (function () {
    function RichContentFontAwesomeIconEditorLocale() {
        this.MenuLabel = "Fontawesome Icon";
        this.AlignLeftMenuLabel = "Align Left";
        this.AlignRightMenuLabel = "Align Right";
        this.DefaultSizeMenuLabel = "Reset Alignment";
        this.EditMenuLabel = "Select Icon";
        this.IconLabel = "Icon";
        this.FieldRequiredLabel = "This field is required";
    }
    return RichContentFontAwesomeIconEditorLocale;
}());
RichContentFontAwesomeIconEditor.RegisterLocale(RichContentFontAwesomeIconEditorLocale, 'EN');
//# sourceMappingURL=RichContentFontAwesomeIconEditorLocaleEN.js.map  
var RichContentTableEditorLocale = /** @class */ (function () {
    function RichContentTableEditorLocale() {
        this.MenuLabel = "Table";
        this.SettingsMenuLabel = "Change Settings";
        this.InsertColumnMenuLabel = "Insert Column";
        this.InsertRowMenuLabel = "Insert Row";
        this.SettingsDialogTitle = "Change Column Settings";
        this.ColumnWidthLabel = "Width";
        this.ColumnWidthSmall = "Mobile";
        this.ColumnOrderLabel = "Order";
        this.ColumnWidthMedium = "Mobile Landscape";
        this.ColumnWidthTablet = "Tablet";
        this.ColumnWidthDesktop = "Desktop";
        this.ValidateWidthMessage = "Enter a number consisting of digits only. Maximum value is {0}.";
        this.ValidateOrderMessage = "Enter a number consisting of digits only.";
        this.AlignmentLabel = "Alignment";
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
        this.Link = "Link";
        this.NewLinkText = "New link";
    }
    return RichContentTextEditorLocale;
}());
RichContentTextEditor.RegisterLocale(RichContentTextEditorLocale, 'EN');
//# sourceMappingURL=RichContentTextEditorLocaleEN.js.map  
