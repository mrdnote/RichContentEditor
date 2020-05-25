interface FileListItem
{
    name: string;
    uri: string;
}

enum ImageAlignment
{
    None, Fill, Left, Right
}

enum ColumnAlignment
{
    Left, Center, Right
}

class RichContentImageEditor extends RichContentBaseEditor
{
    private _appendElement: JQuery<HTMLElement>;
    private static _localeRegistrations?: Dictionary<typeof RichContentImageEditorLocale> = {};
    private _locale?: RichContentImageEditorLocale;

    public static RegisterLocale?<T extends typeof RichContentImageEditorLocale>(localeType: T, language: string)
    {
        RichContentImageEditor._localeRegistrations[language] = localeType;
    }

    public Init(richContentEditor: RichContentEditor)
    {
        super.Init(richContentEditor);

        this._locale = new RichContentImageEditor._localeRegistrations[richContentEditor.Options.Language]();
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

        let url: string = null;
        let linkUrl: string = null;
        let lightBox = false;
        let update = elem !== null;
        let alignment = ImageAlignment.Fill;

        if (elem)
        {
            url = $('.rce-image', elem).attr('src');
            linkUrl = $('a', elem).attr('href');
            lightBox = $('a[data-featherlight]', elem).length > 0;
            alignment = this.getImageAlignment(elem);
        }

        this.RichContentEditorInstance.FileManager.ShowFileSelectionDialog(url, linkUrl, lightBox,
            (url, linkUrl, lightBox) =>
            {
                _this.OnChange();
                if (update)
                {
                    this.updateImage(elem, url, linkUrl, lightBox, alignment);
                }
                else 
                {
                    this.InsertImage(url, linkUrl, lightBox, alignment, this._appendElement);
                }
                return true;
            }
        );
    }

    public InsertImage(url, linkUrl: string, lightBox: boolean, alignment: ImageAlignment, targetElement?: JQuery<HTMLElement>)
    {
        const imgWrapper = $('<div class="rce-image-wrapper"></div>');
        const img = $('<img class="rce-image"></img>');
        imgWrapper.append(img);

        this.updateImage(imgWrapper, url, linkUrl, lightBox, alignment);

        if (!targetElement)
        {
            targetElement = $(`#${this.RichContentEditorInstance.EditorId} .rce-grid`);
        }

        this.Attach(imgWrapper, targetElement);
    }

    private updateImage(elem: JQuery<HTMLElement>, url: string, linkUrl: string, lightBox: boolean, alignment: ImageAlignment)
    {
        const img = elem.find('.rce-image');
        img.attr('src', url);
        let childToAppend: JQuery<HTMLElement> = null;
        if (linkUrl)
        {
            let a = elem.find('a').first();
            if (!a.length)
            {
                a = $(`<a href="${linkUrl}"></a>`);
                a.append(img.detach());
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
        elem.addClass(this.getImageAlignmentClass(alignment));
        if (childToAppend)
        {
            elem.append(childToAppend);
        }
    }

    private getImageAlignmentClass(alignment: ImageAlignment): string
    {
        switch (alignment)
        {
            case ImageAlignment.Left: return 'rce-image-left';
            case ImageAlignment.Right: return 'rce-image-right';
            case ImageAlignment.Fill: return 'rce-image-block';
            case ImageAlignment.None: return '';
            default: throw `Unexpected alignment value: ${alignment}`;
        }
    }

    private getImageAlignment(elem: JQuery<HTMLElement>): ImageAlignment
    {
        if (elem.hasClass('rce-image-left')) return ImageAlignment.Left;
        if (elem.hasClass('rce-image-block')) return ImageAlignment.Fill;
        if (elem.hasClass('rce-image-right')) return ImageAlignment.Right;
        return ImageAlignment.None;
    }

    public GetDetectionSelectors(): string
    {
        return 'img';
    }

    public Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>)
    {
        if (source.is('img') || source.is('a') && source.children().first().is('img'))
        {
            let clone = source.clone();
            const imgWrapper = $('<div class="rce-image-wrapper"></div>');
            imgWrapper.append(clone);
            const img = imgWrapper.find('img');
            img.addClass('rce-image');
            let alignment = ImageAlignment.None;
            if (img.hasClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass()))
            {
                alignment = ImageAlignment.Left;
                img.removeClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass());
            }
            else if (img.hasClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass()))
            {
                alignment = ImageAlignment.Right;
                img.removeClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass());
            }
            else if (img.hasClass(this.RichContentEditorInstance.GridFramework.GetBlockAlignClass()))
            {
                alignment = ImageAlignment.Fill;
                img.removeClass(this.RichContentEditorInstance.GridFramework.GetBlockAlignClass());
            }
            else if (this.hasCss(img, this.RichContentEditorInstance.GridFramework.GetBlockAlignCss()))
            {
                alignment = ImageAlignment.Fill;
                img.css(this.RichContentEditorInstance.GridFramework.GetBlockAlignCss().Key, '');
            }
            if (alignment !== ImageAlignment.None)
            {
                imgWrapper.addClass(this.getImageAlignmentClass(alignment));
            }
            source.replaceWith(imgWrapper);

            this.Attach(imgWrapper, targetElement);
        }
    }

    private hasCss(elem: JQuery<HTMLElement>, css: KeyValue<string>): boolean
    {
        if (css === null)
        {
            return false;
        }

        if (elem.css(css.Key) === css.Value)
            return true;

        return false;
    }

    public GetMenuLabel(): string
    {
        return this._locale.MenuLabel;
    }

    public GetMenuIconClasses(): string
    {
        return 'fas fa-image';
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
        var wrapper = elem.closest('.rce-image-wrapper');
        if (wrapper.hasClass('rce-image-left'))
        {
            elem.addClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass());
            const css = this.RichContentEditorInstance.GridFramework.GetLeftAlignCss();
            if (css != null) elem.css(css.Key, css.Value);
        }
        if (wrapper.hasClass('rce-image-right'))
        {
            elem.addClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass());
            const css = this.RichContentEditorInstance.GridFramework.GetRightAlignCss();
            if (css != null) elem.css(css.Key, css.Value);
        }
        if (wrapper.hasClass('rce-image-block'))
        {
            elem.addClass(this.RichContentEditorInstance.GridFramework.GetBlockAlignClass());
            const css = this.RichContentEditorInstance.GridFramework.GetBlockAlignCss();
            if (css != null) elem.css(css.Key, css.Value);
        }

        elem.removeClass('rce-image');
        if (elem.attr('class') === '')
            elem.removeAttr('class');
        elem.removeAttr('draggable');

        super.Clean(elem);
    }

    public GetContextButtonText(_elem: JQuery<HTMLElement>): string
    {
        return 'img';
    }

    public GetContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[]
    {
        const _this = this;

        var leftCommand = new ContextCommand(this._locale.AlignLeftMenuLabel, 'fas fa-arrow-left', function (elem)
        {
            _this.removeEditorAlignmentClasses(elem);
            elem.addClass('rce-image-left');
            _this.OnChange();
        });

        var rightCommand = new ContextCommand(this._locale.AlignRightMenuLabel, 'fas fa-arrow-right', function (elem)
        {
            _this.removeEditorAlignmentClasses(elem);
            elem.addClass('rce-image-right');
            _this.OnChange();
        });

        var blockCommand = new ContextCommand(this._locale.BlockAlignMenuLabel, 'fas fa-expand-arrows-alt', function (elem)
        {
            _this.removeEditorAlignmentClasses(elem);
            elem.addClass('rce-image-block');
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

        return [leftCommand, rightCommand, blockCommand, defaultCommand, editCommand];
    }

    private removeEditorAlignmentClasses(elem: JQuery<HTMLElement>)
    {
        elem.removeClass('rce-image-left rce-image-block rce-image-right');
    }
}

RichContentBaseEditor.RegisterEditor('RichContentImageEditor', RichContentImageEditor);