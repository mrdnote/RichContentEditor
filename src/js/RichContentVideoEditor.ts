class RichContentVideoEditor extends RichContentBaseEditor
{
    private _appendElement: JQuery<HTMLElement>;
    private static _localeRegistrations?: Dictionary<typeof RichContentVideoEditorLocale> = {};
    private _locale?: RichContentVideoEditorLocale;

    public static RegisterLocale?<T extends typeof RichContentVideoEditorLocale>(localeType: T, language: string)
    {
        RichContentVideoEditor._localeRegistrations[language] = localeType;
    }

    public Init(richContentEditor: RichContentEditor)
    {
        super.Init(richContentEditor);

        this._locale = new RichContentVideoEditor._localeRegistrations[richContentEditor.Options.Language]();
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
            const coreElement = elem.find('.video');
            url = this.getUrl(coreElement);
        }

        this.RichContentEditorInstance.FileManager.ShowFileSelectionDialog(url, false, false, false,
            (url, _lightBox, _targetBlank) =>
            {
                _this.OnChange();
                if (update)
                {
                    this.updateElement(elem, url);
                }
                else 
                {
                    this.InsertElement(url, this._appendElement);
                }
                return true;
            }
        );
    }

    private getUrl(coreElement: JQuery<HTMLElement>): string
    {
        if ($('iframe', coreElement).length)
        {
            return $('iframe', coreElement).attr('src');
        }

        return $('video source', coreElement).attr('src');
    }

    public InsertElement(url: string, targetElement?: JQuery<HTMLElement>)
    {
        const wrapper = $('<div class="rce-video-wrapper"></div>');

        this.updateElement(wrapper, url);

        if (!targetElement)
        {
            targetElement = $(`#${this.RichContentEditorInstance.EditorId} .rce-grid`);
        }

        this.Attach(wrapper, targetElement);
    }

    private isYouTube(url: string)
    {
        return url.indexOf('youtube.com/embed/') > -1;
    }

    private getCoreElement(youtube)
    {
        if (youtube)
        {
            return $('<div class="rce-video video"><iframe allowfullscreen="allowfullscreen" frameborder="0"></iframe></div>');
        }

        return $('<div class="rce-video video videojs"><video class="video-js vjs-default-skin vjs-16-9" preload="auto" controls><source /></video></div>');
    }

    private updateElement(elem: JQuery<HTMLElement>, url: string)
    {
        const youtube = this.isYouTube(url);

        const coreElement = this.getCoreElement(youtube); 

        elem.empty();
        elem.append(coreElement);

        if (youtube)
        {
            const iframe = coreElement.find('iframe');
            iframe.attr('src', url);
        }
        else
        {
            const source = coreElement.find('video source');
            source.attr('src', url);
        }
    }

    public GetDetectionSelectors(): string
    {
        return 'div.video';
    }

    public GetActualElement(elem: JQuery<HTMLElement>): JQuery<HTMLElement>
    {
        return elem.find('div.video');
    }

    public Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>, touchedElements: HTMLElement[]): JQuery<HTMLElement>
    {
        if (source.is('div.video'))
        {
            let clone = source.clone();
            clone.addClass('rce-video');
            const wrapper = $('<div class="rce-video-wrapper"></div>');
            wrapper.append(clone);
            source.replaceWith(wrapper);

            this.Attach(wrapper, targetElement); 

            return wrapper;
        }

        return null;
    }

    public GetMenuLabel(): string
    {
        return this._locale.MenuLabel;
    }

    public GetMenuIconClasses(): string
    {
        return 'fas fa-video';
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
        var wrapper = elem.closest('.rce-video-wrapper');
        var coreElement = wrapper.find('.rce-video');
        coreElement.removeClass('rce-video');
        elem.removeAttr('draggable');

        super.Clean(elem);
    }

    public GetContextButtonText(_elem: JQuery<HTMLElement>): string
    {
        return 'vid';
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

RichContentBaseEditor.RegisterEditor('RichContentVideoEditor', RichContentVideoEditor);