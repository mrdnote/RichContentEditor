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
        let update = elem !== null;

        if (elem)
        {
            url = $('.rce-image', elem).attr('src');
        }

        this.RichContentEditorInstance.FileManager.ShowFileSelectionDialog(url, false, false, true,
            (url, _lightBox, _targetBlank) =>
            {
                _this.OnChange();
                if (update)
                {
                    this.updateImage(elem, url);
                }
                else 
                {
                    this.InsertImage(url, this._appendElement);
                }
                return true;
            }
        );
    }

    public InsertImage(url: string, targetElement?: JQuery<HTMLElement>)
    {
        const imgWrapper = $('<div class="rce-image-wrapper"></div>');
        const img = $('<img class="rce-image"></img>');
        imgWrapper.append(img);

        this.updateImage(imgWrapper, url);

        if (!targetElement)
        {
            targetElement = $(`#${this.RichContentEditorInstance.EditorId} .rce-grid`);
        }

        this.Attach(imgWrapper, targetElement);
    }

    private updateImage(elem: JQuery<HTMLElement>, url: string)
    {
        const img = elem.find('.rce-image');
        img.attr('src', url);
        let childToAppend: JQuery<HTMLElement> = null;
        if (childToAppend)
        {
            elem.append(childToAppend);
        }
    }

    public GetDetectionSelectors(): string
    {
        return 'img';
    }

    public GetActualElement(elem: JQuery<HTMLElement>): JQuery<HTMLElement>
    {
        return elem.find('img');
    }

    public Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>, touchedElements: HTMLElement[]): JQuery<HTMLElement>
    {
        if (source.is('img'))
        {
            let clone = source.clone();
            const imgWrapper = $('<div class="rce-image-wrapper"></div>');
            imgWrapper.append(clone);
            const img = imgWrapper.find('img');
            img.addClass('rce-image');
            source.replaceWith(imgWrapper);

            this.Attach(imgWrapper, targetElement);

            return imgWrapper;
        }

        return null;
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
        super.Clean(elem);

        elem.removeClass('rce-image');
        if (elem.attr('class') === '')
            elem.removeAttr('class');
        elem.removeAttr('draggable');
    }

    public GetContextButtonText(_elem: JQuery<HTMLElement>): string
    {
        return 'img';
    }

    public GetContextCommands(_elem: JQuery<HTMLElement>): ContextCommand[]
    {
        const _this = this;

        var editCommand = new ContextCommand(this._locale.EditMenuLabel, 'fas fa-cog', function (elem)
        {
            _this.showSelectionDialog(elem);
        });

        return [editCommand];
    }
}

RichContentBaseEditor.RegisterEditor('RichContentImageEditor', RichContentImageEditor);