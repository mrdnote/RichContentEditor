enum IconAlignment
{
    None, Left, Right
}

class RichContentFontAwesomeIconEditor extends RichContentBaseEditor
{
    private _appendElement: JQuery<HTMLElement>;
    private static _localeRegistrations?: Dictionary<typeof RichContentFontAwesomeIconEditorLocale> = {};
    private _locale?: RichContentFontAwesomeIconEditorLocale;

    public static RegisterLocale?<T extends typeof RichContentFontAwesomeIconEditorLocale>(localeType: T, language: string)
    {
        RichContentFontAwesomeIconEditor._localeRegistrations[language] = localeType;
    }

    public Init(richContentEditor: RichContentEditor)
    {
        super.Init(richContentEditor);

        this._locale = new RichContentFontAwesomeIconEditor._localeRegistrations[richContentEditor.Options.Language]();
    }

    public Insert(targetElement?: JQuery<HTMLElement>)
    {
        super.Insert(targetElement);

        if (!targetElement)
        {
            targetElement = $('.rce-grid', this.RichContentEditorInstance.GridSelector);
        }

        this._appendElement = targetElement;

        this.showSelectionDialog(null);
    }

    private showSelectionDialog(elem?: JQuery<HTMLElement>)
    {
        const _this = this;

        let oldIconClass: string = null;
        let linkUrl: string = null;
        let lightBox = false;
        let update = elem !== null;
        let alignment = IconAlignment.None;

        if (elem)
        {
            const classes = $('.fas', elem).attr('class').split(/\s/);
            const filtered = classes.filter((cls) => { return cls.substr(0, 3) === 'fa-'; });
            oldIconClass = filtered[0];
            alignment = this.getIconAlignment(elem);
        }

        let dialog = _this.getEditDialog();
        $('.rce-grid a', dialog).unbind('click');
        $('.rce-grid a', dialog).bind('click', function ()
        {
            const classes = $('.fas', this).attr('class').split(/\s/);
            const filtered = classes.filter((cls) => { return cls.substr(0, 3) === 'fa-'; });
            const newIconClass = filtered[0];
            if (newIconClass !== oldIconClass)
            {
                _this.OnChange();
                if (update)
                {
                    $('.rce-icon', elem).removeClass(oldIconClass);
                    _this.updateIcon(elem, newIconClass, linkUrl, lightBox, alignment);
                }
                else 
                {
                    _this.InsertIcon(newIconClass, linkUrl, lightBox, alignment, _this._appendElement);
                }
            }
            const dialog = $(this).closest('.rce-dialog');
            _this.RichContentEditorInstance.DialogManager.CloseDialog(dialog);
        });
        this.RichContentEditorInstance.DialogManager.ShowDialog(dialog);
    }

    public InsertIcon(iconClass, linkUrl: string, lightBox: boolean, alignment: IconAlignment, targetElement?: JQuery<HTMLElement>)
    {
        if (!targetElement)
        {
            targetElement = $(`#${this.RichContentEditorInstance.EditorId} .rce-grid`);
        }

        const inline = targetElement.is('a');
        const tag = inline ? 'span' : 'div';
        const iconWrapper = $(`<${tag} class="rce-icon-wrapper"></${tag}>`);
        const icon = $('<i class="fas"></i>');
        iconWrapper.append(icon);

        this.updateIcon(iconWrapper, iconClass, linkUrl, lightBox, alignment);

        this.Attach(iconWrapper, targetElement);
    }

    private updateIcon(elem: JQuery<HTMLElement>, iconClass: string, linkUrl: string, lightBox: boolean, alignment: IconAlignment)
    {
        const icon = elem.find('.fas');
        icon.addClass(iconClass);
        let childToAppend: JQuery<HTMLElement> = null;
        if (linkUrl)
        {
            let a = elem.find('a').first();
            if (!a.length)
            {
                a = $(`<a href="${linkUrl}"></a>`);
                a.append(icon.detach());
                childToAppend = a;
            }
            if (lightBox && RichContentUtils.HasFeatherLight())
            {
                //a.attr('href', 'javascript:');
                if (RichContentUtils.IsVideoUrl(linkUrl))
                {
                    const mimeType = RichContentUtils.GetMimeType(linkUrl)
                    a.attr('data-featherlight', `<video class="video-js js-video" preload="auto" controls="" autoplay="autoplay"><source src="${linkUrl}" type="${mimeType}"></video>`);
                }
                else
                {
                    a.attr('data-featherlight', linkUrl);
                }
            }
        }
        this.removeEditorAlignmentClasses(elem);
        elem.addClass(this.getIconAlignmentClass(alignment));
        if (childToAppend)
        {
            elem.append(childToAppend);
        }
    }

    private getIconAlignmentClass(alignment: IconAlignment): string
    {
        switch (alignment)
        {
            case IconAlignment.Left: return 'rce-icon-left';
            case IconAlignment.Right: return 'rce-icon-right';
            case IconAlignment.None: return '';
            default: throw `Unexpected alignment value: ${alignment}`;
        }
    }

    private getIconAlignment(elem: JQuery<HTMLElement>): IconAlignment
    {
        if (elem.hasClass('rce-icon-left')) return IconAlignment.Left;
        if (elem.hasClass('rce-icon-right')) return IconAlignment.Right;
        return IconAlignment.None;
    }

    public GetDetectionSelectors(): string
    {
        return '.fas';
    }

    public GetActualElement(elem: JQuery<HTMLElement>): JQuery<HTMLElement>
    {
        return elem.find('i.fas');
    }

    public Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>, touchedElements: HTMLElement[]): JQuery<HTMLElement>
    {
        if (source.is('i.fas'))
        {
            let clone = source.clone();
            const inline = targetElement.is('a');
            const tag = inline ? 'span' : 'div';
            const imgWrapper = $(`<${tag} class="rce-icon-wrapper"></${tag}>`);
            imgWrapper.append(clone);
            const img = imgWrapper.find('i');
            let alignment = IconAlignment.None;
            if (img.hasClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass()))
            {
                alignment = IconAlignment.Left;
                img.removeClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass());
            }
            else if (img.hasClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass()))
            {
                alignment = IconAlignment.Right;
                img.removeClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass());
            }
            if (alignment !== IconAlignment.None)
            {
                imgWrapper.addClass(this.getIconAlignmentClass(alignment));
            }
            source.replaceWith(imgWrapper);

            this.Attach(imgWrapper, targetElement);

            return imgWrapper;
        }

        return null;
    }

    public GetMenuLabel(): string
    {
        return this._locale.MenuLabel;
    }

    public GetMenuIconClasses(): string
    {
        return 'fas fa-icons';
    }

    public AllowInTableCell(): boolean
    {
        return true;
    }

    public AllowInLink(): boolean
    {
        return true;
    }

    public Clean(elem: JQuery<HTMLElement>): void
    {
        var wrapper = elem.closest('.rce-icon-wrapper');
        if (wrapper.hasClass('rce-icon-left'))
        {
            elem.addClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass());
            const css = this.RichContentEditorInstance.GridFramework.GetLeftAlignCss();
            if (css != null) elem.css(css.Key, css.Value);
        }
        if (wrapper.hasClass('rce-icon-right'))
        {
            elem.addClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass());
            const css = this.RichContentEditorInstance.GridFramework.GetRightAlignCss();
            if (css != null) elem.css(css.Key, css.Value);
        }

        elem.removeAttr('draggable');

        super.Clean(elem);
    }

    public GetContextButtonText(_elem: JQuery<HTMLElement>): string
    {
        return 'ico';
    }

    public GetContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[]
    {
        const _this = this;

        var leftCommand = new ContextCommand(this._locale.AlignLeftMenuLabel, 'fas fa-arrow-left', function (elem)
        {
            _this.removeEditorAlignmentClasses(elem);
            elem.addClass('rce-icon-left');
            _this.OnChange();
        });

        var rightCommand = new ContextCommand(this._locale.AlignRightMenuLabel, 'fas fa-arrow-right', function (elem)
        {
            _this.removeEditorAlignmentClasses(elem);
            elem.addClass('rce-icon-right');
            _this.OnChange();
        });

        var defaultCommand = new ContextCommand(this._locale.DefaultSizeMenuLabel, 'fas fa-compress-arrows-alt', function (elem)
        {
            _this.removeEditorAlignmentClasses(elem);
            _this.OnChange();
        });

        var editCommand = new ContextCommand(this._locale.EditMenuLabel, 'fas fa-cog', function (elem)
        {
            _this.showSelectionDialog(elem);
        });

        return [leftCommand, rightCommand, defaultCommand, editCommand];
    }

    private removeEditorAlignmentClasses(elem: JQuery<HTMLElement>)
    {
        elem.removeClass('rce-icon-left rce-icon-right');
    }

    private getEditDialog()
    {
        let dialog = $('#' + this.RichContentEditorInstance.EditorId + ' .fa-icon-edit-dialog');
        if (!dialog.length)
        {
            dialog = $(this.getEditDialogHtml(this.RichContentEditorInstance.EditorId));
            dialog.appendTo($('#' + this.RichContentEditorInstance.EditorId));
        }
        return dialog;
    }

    private getEditDialogHtml(id: string): string
    {
        return `
            <div class="rce-dialog fa-icon-edit-dialog">
                <div class="rce-dialog-content">
                    <div class="rce-dialog-title">${this._locale.EditMenuLabel}</div>
                    <div class="rce-grid" style="height: 400px; overflow-y: auto; font-size: 28px;">
                        <a href="javascript:"><i class="fas fa-ad"></i></a>
                        <a href="javascript:"><i class="fas fa-address-book"></i></a>
                        <a href="javascript:"><i class="fas fa-address-card"></i></a>
                        <a href="javascript:"><i class="fas fa-adjust"></i></a>
                        <a href="javascript:"><i class="fas fa-air-freshener"></i></a>
                        <a href="javascript:"><i class="fas fa-align-center"></i></a>
                        <a href="javascript:"><i class="fas fa-align-justify"></i></a>
                        <a href="javascript:"><i class="fas fa-align-left"></i></a>
                        <a href="javascript:"><i class="fas fa-align-right"></i></a>
                        <a href="javascript:"><i class="fas fa-allergies"></i></a>
                        <a href="javascript:"><i class="fas fa-ambulance"></i></a>
                        <a href="javascript:"><i class="fas fa-american-sign-language-interpreting"></i></a>
                        <a href="javascript:"><i class="fas fa-anchor"></i></a>
                        <a href="javascript:"><i class="fas fa-angle-double-down"></i></a>
                        <a href="javascript:"><i class="fas fa-angle-double-left"></i></a>
                        <a href="javascript:"><i class="fas fa-angle-double-right"></i></a>
                        <a href="javascript:"><i class="fas fa-angle-double-up"></i></a>
                        <a href="javascript:"><i class="fas fa-angle-down"></i></a>
                        <a href="javascript:"><i class="fas fa-angle-left"></i></a>
                        <a href="javascript:"><i class="fas fa-angle-right"></i></a>
                        <a href="javascript:"><i class="fas fa-angle-up"></i></a>
                        <a href="javascript:"><i class="fas fa-angry"></i></a>
                        <a href="javascript:"><i class="fas fa-ankh"></i></a>
                        <a href="javascript:"><i class="fas fa-apple-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-archive"></i></a>
                        <a href="javascript:"><i class="fas fa-archway"></i></a>
                        <a href="javascript:"><i class="fas fa-arrow-alt-circle-down"></i></a>
                        <a href="javascript:"><i class="fas fa-arrow-alt-circle-left"></i></a>
                        <a href="javascript:"><i class="fas fa-arrow-alt-circle-right"></i></a>
                        <a href="javascript:"><i class="fas fa-arrow-alt-circle-up"></i></a>
                        <a href="javascript:"><i class="fas fa-arrow-circle-down"></i></a>
                        <a href="javascript:"><i class="fas fa-arrow-circle-left"></i></a>
                        <a href="javascript:"><i class="fas fa-arrow-circle-right"></i></a>
                        <a href="javascript:"><i class="fas fa-arrow-circle-up"></i></a>
                        <a href="javascript:"><i class="fas fa-arrow-down"></i></a>
                        <a href="javascript:"><i class="fas fa-arrow-left"></i></a>
                        <a href="javascript:"><i class="fas fa-arrow-right"></i></a>
                        <a href="javascript:"><i class="fas fa-arrow-up"></i></a>
                        <a href="javascript:"><i class="fas fa-arrows-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-arrows-alt-h"></i></a>
                        <a href="javascript:"><i class="fas fa-arrows-alt-v"></i></a>
                        <a href="javascript:"><i class="fas fa-assistive-listening-systems"></i></a>
                        <a href="javascript:"><i class="fas fa-asterisk"></i></a>
                        <a href="javascript:"><i class="fas fa-at"></i></a>
                        <a href="javascript:"><i class="fas fa-atlas"></i></a>
                        <a href="javascript:"><i class="fas fa-atom"></i></a>
                        <a href="javascript:"><i class="fas fa-audio-description"></i></a>
                        <a href="javascript:"><i class="fas fa-award"></i></a>
                        <a href="javascript:"><i class="fas fa-baby"></i></a>
                        <a href="javascript:"><i class="fas fa-baby-carriage"></i></a>
                        <a href="javascript:"><i class="fas fa-backspace"></i></a>
                        <a href="javascript:"><i class="fas fa-backward"></i></a>
                        <a href="javascript:"><i class="fas fa-bacon"></i></a>
                        <a href="javascript:"><i class="fas fa-bahai"></i></a>
                        <a href="javascript:"><i class="fas fa-balance-scale"></i></a>
                        <a href="javascript:"><i class="fas fa-balance-scale-left"></i></a>
                        <a href="javascript:"><i class="fas fa-balance-scale-right"></i></a>
                        <a href="javascript:"><i class="fas fa-ban"></i></a>
                        <a href="javascript:"><i class="fas fa-band-aid"></i></a>
                        <a href="javascript:"><i class="fas fa-barcode"></i></a>
                        <a href="javascript:"><i class="fas fa-bars"></i></a>
                        <a href="javascript:"><i class="fas fa-baseball-ball"></i></a>
                        <a href="javascript:"><i class="fas fa-basketball-ball"></i></a>
                        <a href="javascript:"><i class="fas fa-bath"></i></a>
                        <a href="javascript:"><i class="fas fa-battery-empty"></i></a>
                        <a href="javascript:"><i class="fas fa-battery-full"></i></a>
                        <a href="javascript:"><i class="fas fa-battery-half"></i></a>
                        <a href="javascript:"><i class="fas fa-battery-quarter"></i></a>
                        <a href="javascript:"><i class="fas fa-battery-three-quarters"></i></a>
                        <a href="javascript:"><i class="fas fa-bed"></i></a>
                        <a href="javascript:"><i class="fas fa-beer"></i></a>
                        <a href="javascript:"><i class="fas fa-bell"></i></a>
                        <a href="javascript:"><i class="fas fa-bell-slash"></i></a>
                        <a href="javascript:"><i class="fas fa-bezier-curve"></i></a>
                        <a href="javascript:"><i class="fas fa-bible"></i></a>
                        <a href="javascript:"><i class="fas fa-bicycle"></i></a>
                        <a href="javascript:"><i class="fas fa-biking"></i></a>
                        <a href="javascript:"><i class="fas fa-binoculars"></i></a>
                        <a href="javascript:"><i class="fas fa-biohazard"></i></a>
                        <a href="javascript:"><i class="fas fa-birthday-cake"></i></a>
                        <a href="javascript:"><i class="fas fa-blender"></i></a>
                        <a href="javascript:"><i class="fas fa-blender-phone"></i></a>
                        <a href="javascript:"><i class="fas fa-blind"></i></a>
                        <a href="javascript:"><i class="fas fa-blog"></i></a>
                        <a href="javascript:"><i class="fas fa-bold"></i></a>
                        <a href="javascript:"><i class="fas fa-bolt"></i></a>
                        <a href="javascript:"><i class="fas fa-bomb"></i></a>
                        <a href="javascript:"><i class="fas fa-bone"></i></a>
                        <a href="javascript:"><i class="fas fa-bong"></i></a>
                        <a href="javascript:"><i class="fas fa-book"></i></a>
                        <a href="javascript:"><i class="fas fa-book-dead"></i></a>
                        <a href="javascript:"><i class="fas fa-book-medical"></i></a>
                        <a href="javascript:"><i class="fas fa-book-open"></i></a>
                        <a href="javascript:"><i class="fas fa-book-reader"></i></a>
                        <a href="javascript:"><i class="fas fa-bookmark"></i></a>
                        <a href="javascript:"><i class="fas fa-border-all"></i></a>
                        <a href="javascript:"><i class="fas fa-border-none"></i></a>
                        <a href="javascript:"><i class="fas fa-border-style"></i></a>
                        <a href="javascript:"><i class="fas fa-bowling-ball"></i></a>
                        <a href="javascript:"><i class="fas fa-box"></i></a>
                        <a href="javascript:"><i class="fas fa-box-open"></i></a>
                        <a href="javascript:"><i class="fas fa-box-tissue"></i></a>
                        <a href="javascript:"><i class="fas fa-boxes"></i></a>
                        <a href="javascript:"><i class="fas fa-braille"></i></a>
                        <a href="javascript:"><i class="fas fa-brain"></i></a>
                        <a href="javascript:"><i class="fas fa-bread-slice"></i></a>
                        <a href="javascript:"><i class="fas fa-briefcase"></i></a>
                        <a href="javascript:"><i class="fas fa-briefcase-medical"></i></a>
                        <a href="javascript:"><i class="fas fa-broadcast-tower"></i></a>
                        <a href="javascript:"><i class="fas fa-broom"></i></a>
                        <a href="javascript:"><i class="fas fa-brush"></i></a>
                        <a href="javascript:"><i class="fas fa-bug"></i></a>
                        <a href="javascript:"><i class="fas fa-building"></i></a>
                        <a href="javascript:"><i class="fas fa-bullhorn"></i></a>
                        <a href="javascript:"><i class="fas fa-bullseye"></i></a>
                        <a href="javascript:"><i class="fas fa-burn"></i></a>
                        <a href="javascript:"><i class="fas fa-bus"></i></a>
                        <a href="javascript:"><i class="fas fa-bus-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-business-time"></i></a>
                        <a href="javascript:"><i class="fas fa-calculator"></i></a>
                        <a href="javascript:"><i class="fas fa-calendar"></i></a>
                        <a href="javascript:"><i class="fas fa-calendar-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-calendar-check"></i></a>
                        <a href="javascript:"><i class="fas fa-calendar-day"></i></a>
                        <a href="javascript:"><i class="fas fa-calendar-minus"></i></a>
                        <a href="javascript:"><i class="fas fa-calendar-plus"></i></a>
                        <a href="javascript:"><i class="fas fa-calendar-times"></i></a>
                        <a href="javascript:"><i class="fas fa-calendar-week"></i></a>
                        <a href="javascript:"><i class="fas fa-camera"></i></a>
                        <a href="javascript:"><i class="fas fa-camera-retro"></i></a>
                        <a href="javascript:"><i class="fas fa-campground"></i></a>
                        <a href="javascript:"><i class="fas fa-candy-cane"></i></a>
                        <a href="javascript:"><i class="fas fa-cannabis"></i></a>
                        <a href="javascript:"><i class="fas fa-capsules"></i></a>
                        <a href="javascript:"><i class="fas fa-car"></i></a>
                        <a href="javascript:"><i class="fas fa-car-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-car-battery"></i></a>
                        <a href="javascript:"><i class="fas fa-car-crash"></i></a>
                        <a href="javascript:"><i class="fas fa-car-side"></i></a>
                        <a href="javascript:"><i class="fas fa-caravan"></i></a>
                        <a href="javascript:"><i class="fas fa-caret-down"></i></a>
                        <a href="javascript:"><i class="fas fa-caret-left"></i></a>
                        <a href="javascript:"><i class="fas fa-caret-right"></i></a>
                        <a href="javascript:"><i class="fas fa-caret-square-down"></i></a>
                        <a href="javascript:"><i class="fas fa-caret-square-left"></i></a>
                        <a href="javascript:"><i class="fas fa-caret-square-right"></i></a>
                        <a href="javascript:"><i class="fas fa-caret-square-up"></i></a>
                        <a href="javascript:"><i class="fas fa-caret-up"></i></a>
                        <a href="javascript:"><i class="fas fa-carrot"></i></a>
                        <a href="javascript:"><i class="fas fa-cart-arrow-down"></i></a>
                        <a href="javascript:"><i class="fas fa-cart-plus"></i></a>
                        <a href="javascript:"><i class="fas fa-cash-register"></i></a>
                        <a href="javascript:"><i class="fas fa-cat"></i></a>
                        <a href="javascript:"><i class="fas fa-certificate"></i></a>
                        <a href="javascript:"><i class="fas fa-chair"></i></a>
                        <a href="javascript:"><i class="fas fa-chalkboard"></i></a>
                        <a href="javascript:"><i class="fas fa-chalkboard-teacher"></i></a>
                        <a href="javascript:"><i class="fas fa-charging-station"></i></a>
                        <a href="javascript:"><i class="fas fa-chart-area"></i></a>
                        <a href="javascript:"><i class="fas fa-chart-bar"></i></a>
                        <a href="javascript:"><i class="fas fa-chart-line"></i></a>
                        <a href="javascript:"><i class="fas fa-chart-pie"></i></a>
                        <a href="javascript:"><i class="fas fa-check"></i></a>
                        <a href="javascript:"><i class="fas fa-check-circle"></i></a>
                        <a href="javascript:"><i class="fas fa-check-double"></i></a>
                        <a href="javascript:"><i class="fas fa-check-square"></i></a>
                        <a href="javascript:"><i class="fas fa-cheese"></i></a>
                        <a href="javascript:"><i class="fas fa-chess"></i></a>
                        <a href="javascript:"><i class="fas fa-chess-bishop"></i></a>
                        <a href="javascript:"><i class="fas fa-chess-board"></i></a>
                        <a href="javascript:"><i class="fas fa-chess-king"></i></a>
                        <a href="javascript:"><i class="fas fa-chess-knight"></i></a>
                        <a href="javascript:"><i class="fas fa-chess-pawn"></i></a>
                        <a href="javascript:"><i class="fas fa-chess-queen"></i></a>
                        <a href="javascript:"><i class="fas fa-chess-rook"></i></a>
                        <a href="javascript:"><i class="fas fa-chevron-circle-down"></i></a>
                        <a href="javascript:"><i class="fas fa-chevron-circle-left"></i></a>
                        <a href="javascript:"><i class="fas fa-chevron-circle-right"></i></a>
                        <a href="javascript:"><i class="fas fa-chevron-circle-up"></i></a>
                        <a href="javascript:"><i class="fas fa-chevron-down"></i></a>
                        <a href="javascript:"><i class="fas fa-chevron-left"></i></a>
                        <a href="javascript:"><i class="fas fa-chevron-right"></i></a>
                        <a href="javascript:"><i class="fas fa-chevron-up"></i></a>
                        <a href="javascript:"><i class="fas fa-child"></i></a>
                        <a href="javascript:"><i class="fas fa-church"></i></a>
                        <a href="javascript:"><i class="fas fa-circle"></i></a>
                        <a href="javascript:"><i class="fas fa-circle-notch"></i></a>
                        <a href="javascript:"><i class="fas fa-city"></i></a>
                        <a href="javascript:"><i class="fas fa-clinic-medical"></i></a>
                        <a href="javascript:"><i class="fas fa-clipboard"></i></a>
                        <a href="javascript:"><i class="fas fa-clipboard-check"></i></a>
                        <a href="javascript:"><i class="fas fa-clipboard-list"></i></a>
                        <a href="javascript:"><i class="fas fa-clock"></i></a>
                        <a href="javascript:"><i class="fas fa-clone"></i></a>
                        <a href="javascript:"><i class="fas fa-closed-captioning"></i></a>
                        <a href="javascript:"><i class="fas fa-cloud"></i></a>
                        <a href="javascript:"><i class="fas fa-cloud-download-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-cloud-meatball"></i></a>
                        <a href="javascript:"><i class="fas fa-cloud-moon"></i></a>
                        <a href="javascript:"><i class="fas fa-cloud-moon-rain"></i></a>
                        <a href="javascript:"><i class="fas fa-cloud-rain"></i></a>
                        <a href="javascript:"><i class="fas fa-cloud-showers-heavy"></i></a>
                        <a href="javascript:"><i class="fas fa-cloud-sun"></i></a>
                        <a href="javascript:"><i class="fas fa-cloud-sun-rain"></i></a>
                        <a href="javascript:"><i class="fas fa-cloud-upload-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-cocktail"></i></a>
                        <a href="javascript:"><i class="fas fa-code"></i></a>
                        <a href="javascript:"><i class="fas fa-code-branch"></i></a>
                        <a href="javascript:"><i class="fas fa-coffee"></i></a>
                        <a href="javascript:"><i class="fas fa-cog"></i></a>
                        <a href="javascript:"><i class="fas fa-cogs"></i></a>
                        <a href="javascript:"><i class="fas fa-coins"></i></a>
                        <a href="javascript:"><i class="fas fa-columns"></i></a>
                        <a href="javascript:"><i class="fas fa-comment"></i></a>
                        <a href="javascript:"><i class="fas fa-comment-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-comment-dollar"></i></a>
                        <a href="javascript:"><i class="fas fa-comment-dots"></i></a>
                        <a href="javascript:"><i class="fas fa-comment-medical"></i></a>
                        <a href="javascript:"><i class="fas fa-comment-slash"></i></a>
                        <a href="javascript:"><i class="fas fa-comments"></i></a>
                        <a href="javascript:"><i class="fas fa-comments-dollar"></i></a>
                        <a href="javascript:"><i class="fas fa-compact-disc"></i></a>
                        <a href="javascript:"><i class="fas fa-compass"></i></a>
                        <a href="javascript:"><i class="fas fa-compress"></i></a>
                        <a href="javascript:"><i class="fas fa-compress-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-compress-arrows-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-concierge-bell"></i></a>
                        <a href="javascript:"><i class="fas fa-cookie"></i></a>
                        <a href="javascript:"><i class="fas fa-cookie-bite"></i></a>
                        <a href="javascript:"><i class="fas fa-copy"></i></a>
                        <a href="javascript:"><i class="fas fa-copyright"></i></a>
                        <a href="javascript:"><i class="fas fa-couch"></i></a>
                        <a href="javascript:"><i class="fas fa-credit-card"></i></a>
                        <a href="javascript:"><i class="fas fa-crop"></i></a>
                        <a href="javascript:"><i class="fas fa-crop-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-cross"></i></a>
                        <a href="javascript:"><i class="fas fa-crosshairs"></i></a>
                        <a href="javascript:"><i class="fas fa-crow"></i></a>
                        <a href="javascript:"><i class="fas fa-crown"></i></a>
                        <a href="javascript:"><i class="fas fa-crutch"></i></a>
                        <a href="javascript:"><i class="fas fa-cube"></i></a>
                        <a href="javascript:"><i class="fas fa-cubes"></i></a>
                        <a href="javascript:"><i class="fas fa-cut"></i></a>
                        <a href="javascript:"><i class="fas fa-database"></i></a>
                        <a href="javascript:"><i class="fas fa-deaf"></i></a>
                        <a href="javascript:"><i class="fas fa-democrat"></i></a>
                        <a href="javascript:"><i class="fas fa-desktop"></i></a>
                        <a href="javascript:"><i class="fas fa-dharmachakra"></i></a>
                        <a href="javascript:"><i class="fas fa-diagnoses"></i></a>
                        <a href="javascript:"><i class="fas fa-dice"></i></a>
                        <a href="javascript:"><i class="fas fa-dice-d20"></i></a>
                        <a href="javascript:"><i class="fas fa-dice-d6"></i></a>
                        <a href="javascript:"><i class="fas fa-dice-five"></i></a>
                        <a href="javascript:"><i class="fas fa-dice-four"></i></a>
                        <a href="javascript:"><i class="fas fa-dice-one"></i></a>
                        <a href="javascript:"><i class="fas fa-dice-six"></i></a>
                        <a href="javascript:"><i class="fas fa-dice-three"></i></a>
                        <a href="javascript:"><i class="fas fa-dice-two"></i></a>
                        <a href="javascript:"><i class="fas fa-digital-tachograph"></i></a>
                        <a href="javascript:"><i class="fas fa-directions"></i></a>
                        <a href="javascript:"><i class="fas fa-disease"></i></a>
                        <a href="javascript:"><i class="fas fa-divide"></i></a>
                        <a href="javascript:"><i class="fas fa-dizzy"></i></a>
                        <a href="javascript:"><i class="fas fa-dna"></i></a>
                        <a href="javascript:"><i class="fas fa-dog"></i></a>
                        <a href="javascript:"><i class="fas fa-dollar-sign"></i></a>
                        <a href="javascript:"><i class="fas fa-dolly"></i></a>
                        <a href="javascript:"><i class="fas fa-dolly-flatbed"></i></a>
                        <a href="javascript:"><i class="fas fa-donate"></i></a>
                        <a href="javascript:"><i class="fas fa-door-closed"></i></a>
                        <a href="javascript:"><i class="fas fa-door-open"></i></a>
                        <a href="javascript:"><i class="fas fa-dot-circle"></i></a>
                        <a href="javascript:"><i class="fas fa-dove"></i></a>
                        <a href="javascript:"><i class="fas fa-download"></i></a>
                        <a href="javascript:"><i class="fas fa-drafting-compass"></i></a>
                        <a href="javascript:"><i class="fas fa-dragon"></i></a>
                        <a href="javascript:"><i class="fas fa-draw-polygon"></i></a>
                        <a href="javascript:"><i class="fas fa-drum"></i></a>
                        <a href="javascript:"><i class="fas fa-drum-steelpan"></i></a>
                        <a href="javascript:"><i class="fas fa-drumstick-bite"></i></a>
                        <a href="javascript:"><i class="fas fa-dumbbell"></i></a>
                        <a href="javascript:"><i class="fas fa-dumpster"></i></a>
                        <a href="javascript:"><i class="fas fa-dumpster-fire"></i></a>
                        <a href="javascript:"><i class="fas fa-dungeon"></i></a>
                        <a href="javascript:"><i class="fas fa-edit"></i></a>
                        <a href="javascript:"><i class="fas fa-egg"></i></a>
                        <a href="javascript:"><i class="fas fa-eject"></i></a>
                        <a href="javascript:"><i class="fas fa-ellipsis-h"></i></a>
                        <a href="javascript:"><i class="fas fa-ellipsis-v"></i></a>
                        <a href="javascript:"><i class="fas fa-envelope"></i></a>
                        <a href="javascript:"><i class="fas fa-envelope-open"></i></a>
                        <a href="javascript:"><i class="fas fa-envelope-open-text"></i></a>
                        <a href="javascript:"><i class="fas fa-envelope-square"></i></a>
                        <a href="javascript:"><i class="fas fa-equals"></i></a>
                        <a href="javascript:"><i class="fas fa-eraser"></i></a>
                        <a href="javascript:"><i class="fas fa-ethernet"></i></a>
                        <a href="javascript:"><i class="fas fa-euro-sign"></i></a>
                        <a href="javascript:"><i class="fas fa-exchange-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-exclamation"></i></a>
                        <a href="javascript:"><i class="fas fa-exclamation-circle"></i></a>
                        <a href="javascript:"><i class="fas fa-exclamation-triangle"></i></a>
                        <a href="javascript:"><i class="fas fa-expand"></i></a>
                        <a href="javascript:"><i class="fas fa-expand-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-expand-arrows-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-external-link-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-external-link-square-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-eye"></i></a>
                        <a href="javascript:"><i class="fas fa-eye-dropper"></i></a>
                        <a href="javascript:"><i class="fas fa-eye-slash"></i></a>
                        <a href="javascript:"><i class="fas fa-fan"></i></a>
                        <a href="javascript:"><i class="fas fa-fast-backward"></i></a>
                        <a href="javascript:"><i class="fas fa-fast-forward"></i></a>
                        <a href="javascript:"><i class="fas fa-faucet"></i></a>
                        <a href="javascript:"><i class="fas fa-fax"></i></a>
                        <a href="javascript:"><i class="fas fa-feather"></i></a>
                        <a href="javascript:"><i class="fas fa-feather-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-female"></i></a>
                        <a href="javascript:"><i class="fas fa-fighter-jet"></i></a>
                        <a href="javascript:"><i class="fas fa-file"></i></a>
                        <a href="javascript:"><i class="fas fa-file-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-file-archive"></i></a>
                        <a href="javascript:"><i class="fas fa-file-audio"></i></a>
                        <a href="javascript:"><i class="fas fa-file-code"></i></a>
                        <a href="javascript:"><i class="fas fa-file-contract"></i></a>
                        <a href="javascript:"><i class="fas fa-file-csv"></i></a>
                        <a href="javascript:"><i class="fas fa-file-download"></i></a>
                        <a href="javascript:"><i class="fas fa-file-excel"></i></a>
                        <a href="javascript:"><i class="fas fa-file-export"></i></a>
                        <a href="javascript:"><i class="fas fa-file-image"></i></a>
                        <a href="javascript:"><i class="fas fa-file-import"></i></a>
                        <a href="javascript:"><i class="fas fa-file-invoice"></i></a>
                        <a href="javascript:"><i class="fas fa-file-invoice-dollar"></i></a>
                        <a href="javascript:"><i class="fas fa-file-medical"></i></a>
                        <a href="javascript:"><i class="fas fa-file-medical-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-file-pdf"></i></a>
                        <a href="javascript:"><i class="fas fa-file-powerpoint"></i></a>
                        <a href="javascript:"><i class="fas fa-file-prescription"></i></a>
                        <a href="javascript:"><i class="fas fa-file-signature"></i></a>
                        <a href="javascript:"><i class="fas fa-file-upload"></i></a>
                        <a href="javascript:"><i class="fas fa-file-video"></i></a>
                        <a href="javascript:"><i class="fas fa-file-word"></i></a>
                        <a href="javascript:"><i class="fas fa-fill"></i></a>
                        <a href="javascript:"><i class="fas fa-fill-drip"></i></a>
                        <a href="javascript:"><i class="fas fa-film"></i></a>
                        <a href="javascript:"><i class="fas fa-filter"></i></a>
                        <a href="javascript:"><i class="fas fa-fingerprint"></i></a>
                        <a href="javascript:"><i class="fas fa-fire"></i></a>
                        <a href="javascript:"><i class="fas fa-fire-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-fire-extinguisher"></i></a>
                        <a href="javascript:"><i class="fas fa-first-aid"></i></a>
                        <a href="javascript:"><i class="fas fa-fish"></i></a>
                        <a href="javascript:"><i class="fas fa-fist-raised"></i></a>
                        <a href="javascript:"><i class="fas fa-flag"></i></a>
                        <a href="javascript:"><i class="fas fa-flag-checkered"></i></a>
                        <a href="javascript:"><i class="fas fa-flag-usa"></i></a>
                        <a href="javascript:"><i class="fas fa-flask"></i></a>
                        <a href="javascript:"><i class="fas fa-flushed"></i></a>
                        <a href="javascript:"><i class="fas fa-folder"></i></a>
                        <a href="javascript:"><i class="fas fa-folder-minus"></i></a>
                        <a href="javascript:"><i class="fas fa-folder-open"></i></a>
                        <a href="javascript:"><i class="fas fa-folder-plus"></i></a>
                        <a href="javascript:"><i class="fas fa-font"></i></a>
                        <a href="javascript:"><i class="fas fa-football-ball"></i></a>
                        <a href="javascript:"><i class="fas fa-forward"></i></a>
                        <a href="javascript:"><i class="fas fa-frog"></i></a>
                        <a href="javascript:"><i class="fas fa-frown"></i></a>
                        <a href="javascript:"><i class="fas fa-frown-open"></i></a>
                        <a href="javascript:"><i class="fas fa-funnel-dollar"></i></a>
                        <a href="javascript:"><i class="fas fa-futbol"></i></a>
                        <a href="javascript:"><i class="fas fa-gamepad"></i></a>
                        <a href="javascript:"><i class="fas fa-gas-pump"></i></a>
                        <a href="javascript:"><i class="fas fa-gavel"></i></a>
                        <a href="javascript:"><i class="fas fa-gem"></i></a>
                        <a href="javascript:"><i class="fas fa-genderless"></i></a>
                        <a href="javascript:"><i class="fas fa-ghost"></i></a>
                        <a href="javascript:"><i class="fas fa-gift"></i></a>
                        <a href="javascript:"><i class="fas fa-gifts"></i></a>
                        <a href="javascript:"><i class="fas fa-glass-cheers"></i></a>
                        <a href="javascript:"><i class="fas fa-glass-martini"></i></a>
                        <a href="javascript:"><i class="fas fa-glass-martini-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-glass-whiskey"></i></a>
                        <a href="javascript:"><i class="fas fa-glasses"></i></a>
                        <a href="javascript:"><i class="fas fa-globe"></i></a>
                        <a href="javascript:"><i class="fas fa-globe-africa"></i></a>
                        <a href="javascript:"><i class="fas fa-globe-americas"></i></a>
                        <a href="javascript:"><i class="fas fa-globe-asia"></i></a>
                        <a href="javascript:"><i class="fas fa-globe-europe"></i></a>
                        <a href="javascript:"><i class="fas fa-golf-ball"></i></a>
                        <a href="javascript:"><i class="fas fa-gopuram"></i></a>
                        <a href="javascript:"><i class="fas fa-graduation-cap"></i></a>
                        <a href="javascript:"><i class="fas fa-greater-than"></i></a>
                        <a href="javascript:"><i class="fas fa-greater-than-equal"></i></a>
                        <a href="javascript:"><i class="fas fa-grimace"></i></a>
                        <a href="javascript:"><i class="fas fa-grin"></i></a>
                        <a href="javascript:"><i class="fas fa-grin-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-grin-beam"></i></a>
                        <a href="javascript:"><i class="fas fa-grin-beam-sweat"></i></a>
                        <a href="javascript:"><i class="fas fa-grin-hearts"></i></a>
                        <a href="javascript:"><i class="fas fa-grin-squint"></i></a>
                        <a href="javascript:"><i class="fas fa-grin-squint-tears"></i></a>
                        <a href="javascript:"><i class="fas fa-grin-stars"></i></a>
                        <a href="javascript:"><i class="fas fa-grin-tears"></i></a>
                        <a href="javascript:"><i class="fas fa-grin-tongue"></i></a>
                        <a href="javascript:"><i class="fas fa-grin-tongue-squint"></i></a>
                        <a href="javascript:"><i class="fas fa-grin-tongue-wink"></i></a>
                        <a href="javascript:"><i class="fas fa-grin-wink"></i></a>
                        <a href="javascript:"><i class="fas fa-grip-horizontal"></i></a>
                        <a href="javascript:"><i class="fas fa-grip-lines"></i></a>
                        <a href="javascript:"><i class="fas fa-grip-lines-vertical"></i></a>
                        <a href="javascript:"><i class="fas fa-grip-vertical"></i></a>
                        <a href="javascript:"><i class="fas fa-guitar"></i></a>
                        <a href="javascript:"><i class="fas fa-h-square"></i></a>
                        <a href="javascript:"><i class="fas fa-hamburger"></i></a>
                        <a href="javascript:"><i class="fas fa-hammer"></i></a>
                        <a href="javascript:"><i class="fas fa-hamsa"></i></a>
                        <a href="javascript:"><i class="fas fa-hand-holding"></i></a>
                        <a href="javascript:"><i class="fas fa-hand-holding-heart"></i></a>
                        <a href="javascript:"><i class="fas fa-hand-holding-medical"></i></a>
                        <a href="javascript:"><i class="fas fa-hand-holding-usd"></i></a>
                        <a href="javascript:"><i class="fas fa-hand-holding-water"></i></a>
                        <a href="javascript:"><i class="fas fa-hand-lizard"></i></a>
                        <a href="javascript:"><i class="fas fa-hand-middle-finger"></i></a>
                        <a href="javascript:"><i class="fas fa-hand-paper"></i></a>
                        <a href="javascript:"><i class="fas fa-hand-peace"></i></a>
                        <a href="javascript:"><i class="fas fa-hand-point-down"></i></a>
                        <a href="javascript:"><i class="fas fa-hand-point-left"></i></a>
                        <a href="javascript:"><i class="fas fa-hand-point-right"></i></a>
                        <a href="javascript:"><i class="fas fa-hand-point-up"></i></a>
                        <a href="javascript:"><i class="fas fa-hand-pointer"></i></a>
                        <a href="javascript:"><i class="fas fa-hand-rock"></i></a>
                        <a href="javascript:"><i class="fas fa-hand-scissors"></i></a>
                        <a href="javascript:"><i class="fas fa-hand-sparkles"></i></a>
                        <a href="javascript:"><i class="fas fa-hand-spock"></i></a>
                        <a href="javascript:"><i class="fas fa-hands"></i></a>
                        <a href="javascript:"><i class="fas fa-hands-helping"></i></a>
                        <a href="javascript:"><i class="fas fa-hands-wash"></i></a>
                        <a href="javascript:"><i class="fas fa-handshake"></i></a>
                        <a href="javascript:"><i class="fas fa-handshake-alt-slash"></i></a>
                        <a href="javascript:"><i class="fas fa-handshake-slash"></i></a>
                        <a href="javascript:"><i class="fas fa-hanukiah"></i></a>
                        <a href="javascript:"><i class="fas fa-hard-hat"></i></a>
                        <a href="javascript:"><i class="fas fa-hashtag"></i></a>
                        <a href="javascript:"><i class="fas fa-hat-cowboy"></i></a>
                        <a href="javascript:"><i class="fas fa-hat-cowboy-side"></i></a>
                        <a href="javascript:"><i class="fas fa-hat-wizard"></i></a>
                        <a href="javascript:"><i class="fas fa-hdd"></i></a>
                        <a href="javascript:"><i class="fas fa-head-side-cough"></i></a>
                        <a href="javascript:"><i class="fas fa-head-side-cough-slash"></i></a>
                        <a href="javascript:"><i class="fas fa-head-side-mask"></i></a>
                        <a href="javascript:"><i class="fas fa-head-side-virus"></i></a>
                        <a href="javascript:"><i class="fas fa-heading"></i></a>
                        <a href="javascript:"><i class="fas fa-headphones"></i></a>
                        <a href="javascript:"><i class="fas fa-headphones-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-headset"></i></a>
                        <a href="javascript:"><i class="fas fa-heart"></i></a>
                        <a href="javascript:"><i class="fas fa-heart-broken"></i></a>
                        <a href="javascript:"><i class="fas fa-heartbeat"></i></a>
                        <a href="javascript:"><i class="fas fa-helicopter"></i></a>
                        <a href="javascript:"><i class="fas fa-highlighter"></i></a>
                        <a href="javascript:"><i class="fas fa-hiking"></i></a>
                        <a href="javascript:"><i class="fas fa-hippo"></i></a>
                        <a href="javascript:"><i class="fas fa-history"></i></a>
                        <a href="javascript:"><i class="fas fa-hockey-puck"></i></a>
                        <a href="javascript:"><i class="fas fa-holly-berry"></i></a>
                        <a href="javascript:"><i class="fas fa-home"></i></a>
                        <a href="javascript:"><i class="fas fa-horse"></i></a>
                        <a href="javascript:"><i class="fas fa-horse-head"></i></a>
                        <a href="javascript:"><i class="fas fa-hospital"></i></a>
                        <a href="javascript:"><i class="fas fa-hospital-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-hospital-symbol"></i></a>
                        <a href="javascript:"><i class="fas fa-hospital-user"></i></a>
                        <a href="javascript:"><i class="fas fa-hot-tub"></i></a>
                        <a href="javascript:"><i class="fas fa-hotdog"></i></a>
                        <a href="javascript:"><i class="fas fa-hotel"></i></a>
                        <a href="javascript:"><i class="fas fa-hourglass"></i></a>
                        <a href="javascript:"><i class="fas fa-hourglass-end"></i></a>
                        <a href="javascript:"><i class="fas fa-hourglass-half"></i></a>
                        <a href="javascript:"><i class="fas fa-hourglass-start"></i></a>
                        <a href="javascript:"><i class="fas fa-house-damage"></i></a>
                        <a href="javascript:"><i class="fas fa-house-user"></i></a>
                        <a href="javascript:"><i class="fas fa-hryvnia"></i></a>
                        <a href="javascript:"><i class="fas fa-i-cursor"></i></a>
                        <a href="javascript:"><i class="fas fa-ice-cream"></i></a>
                        <a href="javascript:"><i class="fas fa-icicles"></i></a>
                        <a href="javascript:"><i class="fas fa-icons"></i></a>
                        <a href="javascript:"><i class="fas fa-id-badge"></i></a>
                        <a href="javascript:"><i class="fas fa-id-card"></i></a>
                        <a href="javascript:"><i class="fas fa-id-card-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-igloo"></i></a>
                        <a href="javascript:"><i class="fas fa-image"></i></a>
                        <a href="javascript:"><i class="fas fa-images"></i></a>
                        <a href="javascript:"><i class="fas fa-inbox"></i></a>
                        <a href="javascript:"><i class="fas fa-indent"></i></a>
                        <a href="javascript:"><i class="fas fa-industry"></i></a>
                        <a href="javascript:"><i class="fas fa-infinity"></i></a>
                        <a href="javascript:"><i class="fas fa-info"></i></a>
                        <a href="javascript:"><i class="fas fa-info-circle"></i></a>
                        <a href="javascript:"><i class="fas fa-italic"></i></a>
                        <a href="javascript:"><i class="fas fa-jedi"></i></a>
                        <a href="javascript:"><i class="fas fa-joint"></i></a>
                        <a href="javascript:"><i class="fas fa-journal-whills"></i></a>
                        <a href="javascript:"><i class="fas fa-kaaba"></i></a>
                        <a href="javascript:"><i class="fas fa-key"></i></a>
                        <a href="javascript:"><i class="fas fa-keyboard"></i></a>
                        <a href="javascript:"><i class="fas fa-khanda"></i></a>
                        <a href="javascript:"><i class="fas fa-kiss"></i></a>
                        <a href="javascript:"><i class="fas fa-kiss-beam"></i></a>
                        <a href="javascript:"><i class="fas fa-kiss-wink-heart"></i></a>
                        <a href="javascript:"><i class="fas fa-kiwi-bird"></i></a>
                        <a href="javascript:"><i class="fas fa-landmark"></i></a>
                        <a href="javascript:"><i class="fas fa-language"></i></a>
                        <a href="javascript:"><i class="fas fa-laptop"></i></a>
                        <a href="javascript:"><i class="fas fa-laptop-code"></i></a>
                        <a href="javascript:"><i class="fas fa-laptop-house"></i></a>
                        <a href="javascript:"><i class="fas fa-laptop-medical"></i></a>
                        <a href="javascript:"><i class="fas fa-laugh"></i></a>
                        <a href="javascript:"><i class="fas fa-laugh-beam"></i></a>
                        <a href="javascript:"><i class="fas fa-laugh-squint"></i></a>
                        <a href="javascript:"><i class="fas fa-laugh-wink"></i></a>
                        <a href="javascript:"><i class="fas fa-layer-group"></i></a>
                        <a href="javascript:"><i class="fas fa-leaf"></i></a>
                        <a href="javascript:"><i class="fas fa-lemon"></i></a>
                        <a href="javascript:"><i class="fas fa-less-than"></i></a>
                        <a href="javascript:"><i class="fas fa-less-than-equal"></i></a>
                        <a href="javascript:"><i class="fas fa-level-down-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-level-up-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-life-ring"></i></a>
                        <a href="javascript:"><i class="fas fa-lightbulb"></i></a>
                        <a href="javascript:"><i class="fas fa-link"></i></a>
                        <a href="javascript:"><i class="fas fa-lira-sign"></i></a>
                        <a href="javascript:"><i class="fas fa-list"></i></a>
                        <a href="javascript:"><i class="fas fa-list-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-list-ol"></i></a>
                        <a href="javascript:"><i class="fas fa-list-ul"></i></a>
                        <a href="javascript:"><i class="fas fa-location-arrow"></i></a>
                        <a href="javascript:"><i class="fas fa-lock"></i></a>
                        <a href="javascript:"><i class="fas fa-lock-open"></i></a>
                        <a href="javascript:"><i class="fas fa-long-arrow-alt-down"></i></a>
                        <a href="javascript:"><i class="fas fa-long-arrow-alt-left"></i></a>
                        <a href="javascript:"><i class="fas fa-long-arrow-alt-right"></i></a>
                        <a href="javascript:"><i class="fas fa-long-arrow-alt-up"></i></a>
                        <a href="javascript:"><i class="fas fa-low-vision"></i></a>
                        <a href="javascript:"><i class="fas fa-luggage-cart"></i></a>
                        <a href="javascript:"><i class="fas fa-lungs"></i></a>
                        <a href="javascript:"><i class="fas fa-lungs-virus"></i></a>
                        <a href="javascript:"><i class="fas fa-magic"></i></a>
                        <a href="javascript:"><i class="fas fa-magnet"></i></a>
                        <a href="javascript:"><i class="fas fa-mail-bulk"></i></a>
                        <a href="javascript:"><i class="fas fa-male"></i></a>
                        <a href="javascript:"><i class="fas fa-map"></i></a>
                        <a href="javascript:"><i class="fas fa-map-marked"></i></a>
                        <a href="javascript:"><i class="fas fa-map-marked-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-map-marker"></i></a>
                        <a href="javascript:"><i class="fas fa-map-marker-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-map-pin"></i></a>
                        <a href="javascript:"><i class="fas fa-map-signs"></i></a>
                        <a href="javascript:"><i class="fas fa-marker"></i></a>
                        <a href="javascript:"><i class="fas fa-mars"></i></a>
                        <a href="javascript:"><i class="fas fa-mars-double"></i></a>
                        <a href="javascript:"><i class="fas fa-mars-stroke"></i></a>
                        <a href="javascript:"><i class="fas fa-mars-stroke-h"></i></a>
                        <a href="javascript:"><i class="fas fa-mars-stroke-v"></i></a>
                        <a href="javascript:"><i class="fas fa-mask"></i></a>
                        <a href="javascript:"><i class="fas fa-medal"></i></a>
                        <a href="javascript:"><i class="fas fa-medkit"></i></a>
                        <a href="javascript:"><i class="fas fa-meh"></i></a>
                        <a href="javascript:"><i class="fas fa-meh-blank"></i></a>
                        <a href="javascript:"><i class="fas fa-meh-rolling-eyes"></i></a>
                        <a href="javascript:"><i class="fas fa-memory"></i></a>
                        <a href="javascript:"><i class="fas fa-menorah"></i></a>
                        <a href="javascript:"><i class="fas fa-mercury"></i></a>
                        <a href="javascript:"><i class="fas fa-meteor"></i></a>
                        <a href="javascript:"><i class="fas fa-microchip"></i></a>
                        <a href="javascript:"><i class="fas fa-microphone"></i></a>
                        <a href="javascript:"><i class="fas fa-microphone-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-microphone-alt-slash"></i></a>
                        <a href="javascript:"><i class="fas fa-microphone-slash"></i></a>
                        <a href="javascript:"><i class="fas fa-microscope"></i></a>
                        <a href="javascript:"><i class="fas fa-minus"></i></a>
                        <a href="javascript:"><i class="fas fa-minus-circle"></i></a>
                        <a href="javascript:"><i class="fas fa-minus-square"></i></a>
                        <a href="javascript:"><i class="fas fa-mitten"></i></a>
                        <a href="javascript:"><i class="fas fa-mobile"></i></a>
                        <a href="javascript:"><i class="fas fa-mobile-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-money-bill"></i></a>
                        <a href="javascript:"><i class="fas fa-money-bill-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-money-bill-wave"></i></a>
                        <a href="javascript:"><i class="fas fa-money-bill-wave-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-money-check"></i></a>
                        <a href="javascript:"><i class="fas fa-money-check-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-monument"></i></a>
                        <a href="javascript:"><i class="fas fa-moon"></i></a>
                        <a href="javascript:"><i class="fas fa-mortar-pestle"></i></a>
                        <a href="javascript:"><i class="fas fa-mosque"></i></a>
                        <a href="javascript:"><i class="fas fa-motorcycle"></i></a>
                        <a href="javascript:"><i class="fas fa-mountain"></i></a>
                        <a href="javascript:"><i class="fas fa-mouse"></i></a>
                        <a href="javascript:"><i class="fas fa-mouse-pointer"></i></a>
                        <a href="javascript:"><i class="fas fa-mug-hot"></i></a>
                        <a href="javascript:"><i class="fas fa-music"></i></a>
                        <a href="javascript:"><i class="fas fa-network-wired"></i></a>
                        <a href="javascript:"><i class="fas fa-neuter"></i></a>
                        <a href="javascript:"><i class="fas fa-newspaper"></i></a>
                        <a href="javascript:"><i class="fas fa-not-equal"></i></a>
                        <a href="javascript:"><i class="fas fa-notes-medical"></i></a>
                        <a href="javascript:"><i class="fas fa-object-group"></i></a>
                        <a href="javascript:"><i class="fas fa-object-ungroup"></i></a>
                        <a href="javascript:"><i class="fas fa-oil-can"></i></a>
                        <a href="javascript:"><i class="fas fa-om"></i></a>
                        <a href="javascript:"><i class="fas fa-otter"></i></a>
                        <a href="javascript:"><i class="fas fa-outdent"></i></a>
                        <a href="javascript:"><i class="fas fa-pager"></i></a>
                        <a href="javascript:"><i class="fas fa-paint-brush"></i></a>
                        <a href="javascript:"><i class="fas fa-paint-roller"></i></a>
                        <a href="javascript:"><i class="fas fa-palette"></i></a>
                        <a href="javascript:"><i class="fas fa-pallet"></i></a>
                        <a href="javascript:"><i class="fas fa-paper-plane"></i></a>
                        <a href="javascript:"><i class="fas fa-paperclip"></i></a>
                        <a href="javascript:"><i class="fas fa-parachute-box"></i></a>
                        <a href="javascript:"><i class="fas fa-paragraph"></i></a>
                        <a href="javascript:"><i class="fas fa-parking"></i></a>
                        <a href="javascript:"><i class="fas fa-passport"></i></a>
                        <a href="javascript:"><i class="fas fa-pastafarianism"></i></a>
                        <a href="javascript:"><i class="fas fa-paste"></i></a>
                        <a href="javascript:"><i class="fas fa-pause"></i></a>
                        <a href="javascript:"><i class="fas fa-pause-circle"></i></a>
                        <a href="javascript:"><i class="fas fa-paw"></i></a>
                        <a href="javascript:"><i class="fas fa-peace"></i></a>
                        <a href="javascript:"><i class="fas fa-pen"></i></a>
                        <a href="javascript:"><i class="fas fa-pen-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-pen-fancy"></i></a>
                        <a href="javascript:"><i class="fas fa-pen-nib"></i></a>
                        <a href="javascript:"><i class="fas fa-pen-square"></i></a>
                        <a href="javascript:"><i class="fas fa-pencil-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-pencil-ruler"></i></a>
                        <a href="javascript:"><i class="fas fa-people-arrows"></i></a>
                        <a href="javascript:"><i class="fas fa-people-carry"></i></a>
                        <a href="javascript:"><i class="fas fa-pepper-hot"></i></a>
                        <a href="javascript:"><i class="fas fa-percent"></i></a>
                        <a href="javascript:"><i class="fas fa-percentage"></i></a>
                        <a href="javascript:"><i class="fas fa-person-booth"></i></a>
                        <a href="javascript:"><i class="fas fa-phone"></i></a>
                        <a href="javascript:"><i class="fas fa-phone-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-phone-slash"></i></a>
                        <a href="javascript:"><i class="fas fa-phone-square"></i></a>
                        <a href="javascript:"><i class="fas fa-phone-square-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-phone-volume"></i></a>
                        <a href="javascript:"><i class="fas fa-photo-video"></i></a>
                        <a href="javascript:"><i class="fas fa-piggy-bank"></i></a>
                        <a href="javascript:"><i class="fas fa-pills"></i></a>
                        <a href="javascript:"><i class="fas fa-pizza-slice"></i></a>
                        <a href="javascript:"><i class="fas fa-place-of-worship"></i></a>
                        <a href="javascript:"><i class="fas fa-plane"></i></a>
                        <a href="javascript:"><i class="fas fa-plane-arrival"></i></a>
                        <a href="javascript:"><i class="fas fa-plane-departure"></i></a>
                        <a href="javascript:"><i class="fas fa-plane-slash"></i></a>
                        <a href="javascript:"><i class="fas fa-play"></i></a>
                        <a href="javascript:"><i class="fas fa-play-circle"></i></a>
                        <a href="javascript:"><i class="fas fa-plug"></i></a>
                        <a href="javascript:"><i class="fas fa-plus"></i></a>
                        <a href="javascript:"><i class="fas fa-plus-circle"></i></a>
                        <a href="javascript:"><i class="fas fa-plus-square"></i></a>
                        <a href="javascript:"><i class="fas fa-podcast"></i></a>
                        <a href="javascript:"><i class="fas fa-poll"></i></a>
                        <a href="javascript:"><i class="fas fa-poll-h"></i></a>
                        <a href="javascript:"><i class="fas fa-poo"></i></a>
                        <a href="javascript:"><i class="fas fa-poo-storm"></i></a>
                        <a href="javascript:"><i class="fas fa-poop"></i></a>
                        <a href="javascript:"><i class="fas fa-portrait"></i></a>
                        <a href="javascript:"><i class="fas fa-pound-sign"></i></a>
                        <a href="javascript:"><i class="fas fa-power-off"></i></a>
                        <a href="javascript:"><i class="fas fa-pray"></i></a>
                        <a href="javascript:"><i class="fas fa-praying-hands"></i></a>
                        <a href="javascript:"><i class="fas fa-prescription"></i></a>
                        <a href="javascript:"><i class="fas fa-prescription-bottle"></i></a>
                        <a href="javascript:"><i class="fas fa-prescription-bottle-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-print"></i></a>
                        <a href="javascript:"><i class="fas fa-procedures"></i></a>
                        <a href="javascript:"><i class="fas fa-project-diagram"></i></a>
                        <a href="javascript:"><i class="fas fa-pump-medical"></i></a>
                        <a href="javascript:"><i class="fas fa-pump-soap"></i></a>
                        <a href="javascript:"><i class="fas fa-puzzle-piece"></i></a>
                        <a href="javascript:"><i class="fas fa-qrcode"></i></a>
                        <a href="javascript:"><i class="fas fa-question"></i></a>
                        <a href="javascript:"><i class="fas fa-question-circle"></i></a>
                        <a href="javascript:"><i class="fas fa-quidditch"></i></a>
                        <a href="javascript:"><i class="fas fa-quote-left"></i></a>
                        <a href="javascript:"><i class="fas fa-quote-right"></i></a>
                        <a href="javascript:"><i class="fas fa-quran"></i></a>
                        <a href="javascript:"><i class="fas fa-radiation"></i></a>
                        <a href="javascript:"><i class="fas fa-radiation-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-rainbow"></i></a>
                        <a href="javascript:"><i class="fas fa-random"></i></a>
                        <a href="javascript:"><i class="fas fa-receipt"></i></a>
                        <a href="javascript:"><i class="fas fa-record-vinyl"></i></a>
                        <a href="javascript:"><i class="fas fa-recycle"></i></a>
                        <a href="javascript:"><i class="fas fa-redo"></i></a>
                        <a href="javascript:"><i class="fas fa-redo-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-registered"></i></a>
                        <a href="javascript:"><i class="fas fa-remove-format"></i></a>
                        <a href="javascript:"><i class="fas fa-reply"></i></a>
                        <a href="javascript:"><i class="fas fa-reply-all"></i></a>
                        <a href="javascript:"><i class="fas fa-republican"></i></a>
                        <a href="javascript:"><i class="fas fa-restroom"></i></a>
                        <a href="javascript:"><i class="fas fa-retweet"></i></a>
                        <a href="javascript:"><i class="fas fa-ribbon"></i></a>
                        <a href="javascript:"><i class="fas fa-ring"></i></a>
                        <a href="javascript:"><i class="fas fa-road"></i></a>
                        <a href="javascript:"><i class="fas fa-robot"></i></a>
                        <a href="javascript:"><i class="fas fa-rocket"></i></a>
                        <a href="javascript:"><i class="fas fa-route"></i></a>
                        <a href="javascript:"><i class="fas fa-rss"></i></a>
                        <a href="javascript:"><i class="fas fa-rss-square"></i></a>
                        <a href="javascript:"><i class="fas fa-ruble-sign"></i></a>
                        <a href="javascript:"><i class="fas fa-ruler"></i></a>
                        <a href="javascript:"><i class="fas fa-ruler-combined"></i></a>
                        <a href="javascript:"><i class="fas fa-ruler-horizontal"></i></a>
                        <a href="javascript:"><i class="fas fa-ruler-vertical"></i></a>
                        <a href="javascript:"><i class="fas fa-running"></i></a>
                        <a href="javascript:"><i class="fas fa-rupee-sign"></i></a>
                        <a href="javascript:"><i class="fas fa-sad-cry"></i></a>
                        <a href="javascript:"><i class="fas fa-sad-tear"></i></a>
                        <a href="javascript:"><i class="fas fa-satellite"></i></a>
                        <a href="javascript:"><i class="fas fa-satellite-dish"></i></a>
                        <a href="javascript:"><i class="fas fa-save"></i></a>
                        <a href="javascript:"><i class="fas fa-school"></i></a>
                        <a href="javascript:"><i class="fas fa-screwdriver"></i></a>
                        <a href="javascript:"><i class="fas fa-scroll"></i></a>
                        <a href="javascript:"><i class="fas fa-sd-card"></i></a>
                        <a href="javascript:"><i class="fas fa-search"></i></a>
                        <a href="javascript:"><i class="fas fa-search-dollar"></i></a>
                        <a href="javascript:"><i class="fas fa-search-location"></i></a>
                        <a href="javascript:"><i class="fas fa-search-minus"></i></a>
                        <a href="javascript:"><i class="fas fa-search-plus"></i></a>
                        <a href="javascript:"><i class="fas fa-seedling"></i></a>
                        <a href="javascript:"><i class="fas fa-server"></i></a>
                        <a href="javascript:"><i class="fas fa-shapes"></i></a>
                        <a href="javascript:"><i class="fas fa-share"></i></a>
                        <a href="javascript:"><i class="fas fa-share-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-share-alt-square"></i></a>
                        <a href="javascript:"><i class="fas fa-share-square"></i></a>
                        <a href="javascript:"><i class="fas fa-shekel-sign"></i></a>
                        <a href="javascript:"><i class="fas fa-shield-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-shield-virus"></i></a>
                        <a href="javascript:"><i class="fas fa-ship"></i></a>
                        <a href="javascript:"><i class="fas fa-shipping-fast"></i></a>
                        <a href="javascript:"><i class="fas fa-shoe-prints"></i></a>
                        <a href="javascript:"><i class="fas fa-shopping-bag"></i></a>
                        <a href="javascript:"><i class="fas fa-shopping-basket"></i></a>
                        <a href="javascript:"><i class="fas fa-shopping-cart"></i></a>
                        <a href="javascript:"><i class="fas fa-shower"></i></a>
                        <a href="javascript:"><i class="fas fa-shuttle-van"></i></a>
                        <a href="javascript:"><i class="fas fa-sign"></i></a>
                        <a href="javascript:"><i class="fas fa-sign-in-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-sign-language"></i></a>
                        <a href="javascript:"><i class="fas fa-sign-out-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-signal"></i></a>
                        <a href="javascript:"><i class="fas fa-signature"></i></a>
                        <a href="javascript:"><i class="fas fa-sim-card"></i></a>
                        <a href="javascript:"><i class="fas fa-sitemap"></i></a>
                        <a href="javascript:"><i class="fas fa-skating"></i></a>
                        <a href="javascript:"><i class="fas fa-skiing"></i></a>
                        <a href="javascript:"><i class="fas fa-skiing-nordic"></i></a>
                        <a href="javascript:"><i class="fas fa-skull"></i></a>
                        <a href="javascript:"><i class="fas fa-skull-crossbones"></i></a>
                        <a href="javascript:"><i class="fas fa-slash"></i></a>
                        <a href="javascript:"><i class="fas fa-sleigh"></i></a>
                        <a href="javascript:"><i class="fas fa-sliders-h"></i></a>
                        <a href="javascript:"><i class="fas fa-smile"></i></a>
                        <a href="javascript:"><i class="fas fa-smile-beam"></i></a>
                        <a href="javascript:"><i class="fas fa-smile-wink"></i></a>
                        <a href="javascript:"><i class="fas fa-smog"></i></a>
                        <a href="javascript:"><i class="fas fa-smoking"></i></a>
                        <a href="javascript:"><i class="fas fa-smoking-ban"></i></a>
                        <a href="javascript:"><i class="fas fa-sms"></i></a>
                        <a href="javascript:"><i class="fas fa-snowboarding"></i></a>
                        <a href="javascript:"><i class="fas fa-snowflake"></i></a>
                        <a href="javascript:"><i class="fas fa-snowman"></i></a>
                        <a href="javascript:"><i class="fas fa-snowplow"></i></a>
                        <a href="javascript:"><i class="fas fa-soap"></i></a>
                        <a href="javascript:"><i class="fas fa-socks"></i></a>
                        <a href="javascript:"><i class="fas fa-solar-panel"></i></a>
                        <a href="javascript:"><i class="fas fa-sort"></i></a>
                        <a href="javascript:"><i class="fas fa-sort-alpha-down"></i></a>
                        <a href="javascript:"><i class="fas fa-sort-alpha-down-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-sort-alpha-up"></i></a>
                        <a href="javascript:"><i class="fas fa-sort-alpha-up-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-sort-amount-down"></i></a>
                        <a href="javascript:"><i class="fas fa-sort-amount-down-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-sort-amount-up"></i></a>
                        <a href="javascript:"><i class="fas fa-sort-amount-up-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-sort-down"></i></a>
                        <a href="javascript:"><i class="fas fa-sort-numeric-down"></i></a>
                        <a href="javascript:"><i class="fas fa-sort-numeric-down-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-sort-numeric-up"></i></a>
                        <a href="javascript:"><i class="fas fa-sort-numeric-up-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-sort-up"></i></a>
                        <a href="javascript:"><i class="fas fa-spa"></i></a>
                        <a href="javascript:"><i class="fas fa-space-shuttle"></i></a>
                        <a href="javascript:"><i class="fas fa-spell-check"></i></a>
                        <a href="javascript:"><i class="fas fa-spider"></i></a>
                        <a href="javascript:"><i class="fas fa-spinner"></i></a>
                        <a href="javascript:"><i class="fas fa-splotch"></i></a>
                        <a href="javascript:"><i class="fas fa-spray-can"></i></a>
                        <a href="javascript:"><i class="fas fa-square"></i></a>
                        <a href="javascript:"><i class="fas fa-square-full"></i></a>
                        <a href="javascript:"><i class="fas fa-square-root-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-stamp"></i></a>
                        <a href="javascript:"><i class="fas fa-star"></i></a>
                        <a href="javascript:"><i class="fas fa-star-and-crescent"></i></a>
                        <a href="javascript:"><i class="fas fa-star-half"></i></a>
                        <a href="javascript:"><i class="fas fa-star-half-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-star-of-david"></i></a>
                        <a href="javascript:"><i class="fas fa-star-of-life"></i></a>
                        <a href="javascript:"><i class="fas fa-step-backward"></i></a>
                        <a href="javascript:"><i class="fas fa-step-forward"></i></a>
                        <a href="javascript:"><i class="fas fa-stethoscope"></i></a>
                        <a href="javascript:"><i class="fas fa-sticky-note"></i></a>
                        <a href="javascript:"><i class="fas fa-stop"></i></a>
                        <a href="javascript:"><i class="fas fa-stop-circle"></i></a>
                        <a href="javascript:"><i class="fas fa-stopwatch"></i></a>
                        <a href="javascript:"><i class="fas fa-stopwatch-20"></i></a>
                        <a href="javascript:"><i class="fas fa-store"></i></a>
                        <a href="javascript:"><i class="fas fa-store-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-store-alt-slash"></i></a>
                        <a href="javascript:"><i class="fas fa-store-slash"></i></a>
                        <a href="javascript:"><i class="fas fa-stream"></i></a>
                        <a href="javascript:"><i class="fas fa-street-view"></i></a>
                        <a href="javascript:"><i class="fas fa-strikethrough"></i></a>
                        <a href="javascript:"><i class="fas fa-stroopwafel"></i></a>
                        <a href="javascript:"><i class="fas fa-subscript"></i></a>
                        <a href="javascript:"><i class="fas fa-subway"></i></a>
                        <a href="javascript:"><i class="fas fa-suitcase"></i></a>
                        <a href="javascript:"><i class="fas fa-suitcase-rolling"></i></a>
                        <a href="javascript:"><i class="fas fa-sun"></i></a>
                        <a href="javascript:"><i class="fas fa-superscript"></i></a>
                        <a href="javascript:"><i class="fas fa-surprise"></i></a>
                        <a href="javascript:"><i class="fas fa-swatchbook"></i></a>
                        <a href="javascript:"><i class="fas fa-swimmer"></i></a>
                        <a href="javascript:"><i class="fas fa-swimming-pool"></i></a>
                        <a href="javascript:"><i class="fas fa-synagogue"></i></a>
                        <a href="javascript:"><i class="fas fa-sync"></i></a>
                        <a href="javascript:"><i class="fas fa-sync-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-syringe"></i></a>
                        <a href="javascript:"><i class="fas fa-table"></i></a>
                        <a href="javascript:"><i class="fas fa-table-tennis"></i></a>
                        <a href="javascript:"><i class="fas fa-tablet"></i></a>
                        <a href="javascript:"><i class="fas fa-tablet-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-tablets"></i></a>
                        <a href="javascript:"><i class="fas fa-tachometer-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-tag"></i></a>
                        <a href="javascript:"><i class="fas fa-tags"></i></a>
                        <a href="javascript:"><i class="fas fa-tape"></i></a>
                        <a href="javascript:"><i class="fas fa-tasks"></i></a>
                        <a href="javascript:"><i class="fas fa-taxi"></i></a>
                        <a href="javascript:"><i class="fas fa-teeth"></i></a>
                        <a href="javascript:"><i class="fas fa-teeth-open"></i></a>
                        <a href="javascript:"><i class="fas fa-temperature-high"></i></a>
                        <a href="javascript:"><i class="fas fa-temperature-low"></i></a>
                        <a href="javascript:"><i class="fas fa-tenge"></i></a>
                        <a href="javascript:"><i class="fas fa-terminal"></i></a>
                        <a href="javascript:"><i class="fas fa-text-height"></i></a>
                        <a href="javascript:"><i class="fas fa-text-width"></i></a>
                        <a href="javascript:"><i class="fas fa-th"></i></a>
                        <a href="javascript:"><i class="fas fa-th-large"></i></a>
                        <a href="javascript:"><i class="fas fa-th-list"></i></a>
                        <a href="javascript:"><i class="fas fa-theater-masks"></i></a>
                        <a href="javascript:"><i class="fas fa-thermometer"></i></a>
                        <a href="javascript:"><i class="fas fa-thermometer-empty"></i></a>
                        <a href="javascript:"><i class="fas fa-thermometer-full"></i></a>
                        <a href="javascript:"><i class="fas fa-thermometer-half"></i></a>
                        <a href="javascript:"><i class="fas fa-thermometer-quarter"></i></a>
                        <a href="javascript:"><i class="fas fa-thermometer-three-quarters"></i></a>
                        <a href="javascript:"><i class="fas fa-thumbs-down"></i></a>
                        <a href="javascript:"><i class="fas fa-thumbs-up"></i></a>
                        <a href="javascript:"><i class="fas fa-thumbtack"></i></a>
                        <a href="javascript:"><i class="fas fa-ticket-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-times"></i></a>
                        <a href="javascript:"><i class="fas fa-times-circle"></i></a>
                        <a href="javascript:"><i class="fas fa-tint"></i></a>
                        <a href="javascript:"><i class="fas fa-tint-slash"></i></a>
                        <a href="javascript:"><i class="fas fa-tired"></i></a>
                        <a href="javascript:"><i class="fas fa-toggle-off"></i></a>
                        <a href="javascript:"><i class="fas fa-toggle-on"></i></a>
                        <a href="javascript:"><i class="fas fa-toilet"></i></a>
                        <a href="javascript:"><i class="fas fa-toilet-paper"></i></a>
                        <a href="javascript:"><i class="fas fa-toilet-paper-slash"></i></a>
                        <a href="javascript:"><i class="fas fa-toolbox"></i></a>
                        <a href="javascript:"><i class="fas fa-tools"></i></a>
                        <a href="javascript:"><i class="fas fa-tooth"></i></a>
                        <a href="javascript:"><i class="fas fa-torah"></i></a>
                        <a href="javascript:"><i class="fas fa-torii-gate"></i></a>
                        <a href="javascript:"><i class="fas fa-tractor"></i></a>
                        <a href="javascript:"><i class="fas fa-trademark"></i></a>
                        <a href="javascript:"><i class="fas fa-traffic-light"></i></a>
                        <a href="javascript:"><i class="fas fa-trailer"></i></a>
                        <a href="javascript:"><i class="fas fa-train"></i></a>
                        <a href="javascript:"><i class="fas fa-tram"></i></a>
                        <a href="javascript:"><i class="fas fa-transgender"></i></a>
                        <a href="javascript:"><i class="fas fa-transgender-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-trash"></i></a>
                        <a href="javascript:"><i class="fas fa-trash-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-trash-restore"></i></a>
                        <a href="javascript:"><i class="fas fa-trash-restore-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-tree"></i></a>
                        <a href="javascript:"><i class="fas fa-trophy"></i></a>
                        <a href="javascript:"><i class="fas fa-truck"></i></a>
                        <a href="javascript:"><i class="fas fa-truck-loading"></i></a>
                        <a href="javascript:"><i class="fas fa-truck-monster"></i></a>
                        <a href="javascript:"><i class="fas fa-truck-moving"></i></a>
                        <a href="javascript:"><i class="fas fa-truck-pickup"></i></a>
                        <a href="javascript:"><i class="fas fa-tshirt"></i></a>
                        <a href="javascript:"><i class="fas fa-tty"></i></a>
                        <a href="javascript:"><i class="fas fa-tv"></i></a>
                        <a href="javascript:"><i class="fas fa-umbrella"></i></a>
                        <a href="javascript:"><i class="fas fa-umbrella-beach"></i></a>
                        <a href="javascript:"><i class="fas fa-underline"></i></a>
                        <a href="javascript:"><i class="fas fa-undo"></i></a>
                        <a href="javascript:"><i class="fas fa-undo-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-universal-access"></i></a>
                        <a href="javascript:"><i class="fas fa-university"></i></a>
                        <a href="javascript:"><i class="fas fa-unlink"></i></a>
                        <a href="javascript:"><i class="fas fa-unlock"></i></a>
                        <a href="javascript:"><i class="fas fa-unlock-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-upload"></i></a>
                        <a href="javascript:"><i class="fas fa-user"></i></a>
                        <a href="javascript:"><i class="fas fa-user-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-user-alt-slash"></i></a>
                        <a href="javascript:"><i class="fas fa-user-astronaut"></i></a>
                        <a href="javascript:"><i class="fas fa-user-check"></i></a>
                        <a href="javascript:"><i class="fas fa-user-circle"></i></a>
                        <a href="javascript:"><i class="fas fa-user-clock"></i></a>
                        <a href="javascript:"><i class="fas fa-user-cog"></i></a>
                        <a href="javascript:"><i class="fas fa-user-edit"></i></a>
                        <a href="javascript:"><i class="fas fa-user-friends"></i></a>
                        <a href="javascript:"><i class="fas fa-user-graduate"></i></a>
                        <a href="javascript:"><i class="fas fa-user-injured"></i></a>
                        <a href="javascript:"><i class="fas fa-user-lock"></i></a>
                        <a href="javascript:"><i class="fas fa-user-md"></i></a>
                        <a href="javascript:"><i class="fas fa-user-minus"></i></a>
                        <a href="javascript:"><i class="fas fa-user-ninja"></i></a>
                        <a href="javascript:"><i class="fas fa-user-nurse"></i></a>
                        <a href="javascript:"><i class="fas fa-user-plus"></i></a>
                        <a href="javascript:"><i class="fas fa-user-secret"></i></a>
                        <a href="javascript:"><i class="fas fa-user-shield"></i></a>
                        <a href="javascript:"><i class="fas fa-user-slash"></i></a>
                        <a href="javascript:"><i class="fas fa-user-tag"></i></a>
                        <a href="javascript:"><i class="fas fa-user-tie"></i></a>
                        <a href="javascript:"><i class="fas fa-user-times"></i></a>
                        <a href="javascript:"><i class="fas fa-users"></i></a>
                        <a href="javascript:"><i class="fas fa-users-cog"></i></a>
                        <a href="javascript:"><i class="fas fa-utensil-spoon"></i></a>
                        <a href="javascript:"><i class="fas fa-utensils"></i></a>
                        <a href="javascript:"><i class="fas fa-vector-square"></i></a>
                        <a href="javascript:"><i class="fas fa-venus"></i></a>
                        <a href="javascript:"><i class="fas fa-venus-double"></i></a>
                        <a href="javascript:"><i class="fas fa-venus-mars"></i></a>
                        <a href="javascript:"><i class="fas fa-vial"></i></a>
                        <a href="javascript:"><i class="fas fa-vials"></i></a>
                        <a href="javascript:"><i class="fas fa-video"></i></a>
                        <a href="javascript:"><i class="fas fa-video-slash"></i></a>
                        <a href="javascript:"><i class="fas fa-vihara"></i></a>
                        <a href="javascript:"><i class="fas fa-virus"></i></a>
                        <a href="javascript:"><i class="fas fa-virus-slash"></i></a>
                        <a href="javascript:"><i class="fas fa-viruses"></i></a>
                        <a href="javascript:"><i class="fas fa-voicemail"></i></a>
                        <a href="javascript:"><i class="fas fa-volleyball-ball"></i></a>
                        <a href="javascript:"><i class="fas fa-volume-down"></i></a>
                        <a href="javascript:"><i class="fas fa-volume-mute"></i></a>
                        <a href="javascript:"><i class="fas fa-volume-off"></i></a>
                        <a href="javascript:"><i class="fas fa-volume-up"></i></a>
                        <a href="javascript:"><i class="fas fa-vote-yea"></i></a>
                        <a href="javascript:"><i class="fas fa-vr-cardboard"></i></a>
                        <a href="javascript:"><i class="fas fa-walking"></i></a>
                        <a href="javascript:"><i class="fas fa-wallet"></i></a>
                        <a href="javascript:"><i class="fas fa-warehouse"></i></a>
                        <a href="javascript:"><i class="fas fa-water"></i></a>
                        <a href="javascript:"><i class="fas fa-wave-square"></i></a>
                        <a href="javascript:"><i class="fas fa-weight"></i></a>
                        <a href="javascript:"><i class="fas fa-weight-hanging"></i></a>
                        <a href="javascript:"><i class="fas fa-wheelchair"></i></a>
                        <a href="javascript:"><i class="fas fa-wifi"></i></a>
                        <a href="javascript:"><i class="fas fa-wind"></i></a>
                        <a href="javascript:"><i class="fas fa-window-close"></i></a>
                        <a href="javascript:"><i class="fas fa-window-maximize"></i></a>
                        <a href="javascript:"><i class="fas fa-window-minimize"></i></a>
                        <a href="javascript:"><i class="fas fa-window-restore"></i></a>
                        <a href="javascript:"><i class="fas fa-wine-bottle"></i></a>
                        <a href="javascript:"><i class="fas fa-wine-glass"></i></a>
                        <a href="javascript:"><i class="fas fa-wine-glass-alt"></i></a>
                        <a href="javascript:"><i class="fas fa-won-sign"></i></a>
                        <a href="javascript:"><i class="fas fa-wrench"></i></a>
                        <a href="javascript:"><i class="fas fa-x-ray"></i></a>
                        <a href="javascript:"><i class="fas fa-yen-sign"></i></a>
                        <a href="javascript:"><i class="fas fa-yin-yang"></i></a>
                    </div>
                    <div class="rce-clear"></div>
                </div>
                <div class="rce-dialog-footer">
                    <a href="javascript:" class="rce-button rce-button-flat rce-close-dialog">${this.RichContentEditorInstance.DialogManager.Locale.DialogCancelButton}</a>
                </div>
            </div>`;
    }
}

RichContentBaseEditor.RegisterEditor('RichContentFontAwesomeIconEditor', RichContentFontAwesomeIconEditor);