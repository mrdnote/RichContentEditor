enum MediaType
{
    GenericVideo,
    YouTubeVideo,
    GenericAudio
}

class RichContentMediaEditor extends RichContentBaseEditor
{
    private _appendElement: JQuery<HTMLElement>;
    private static _localeRegistrations?: Dictionary<typeof RichContentMediaEditorLocale> = {};
    private _locale?: RichContentMediaEditorLocale;

    public static RegisterLocale?<T extends typeof RichContentMediaEditorLocale>(localeType: T, language: string)
    {
        RichContentMediaEditor._localeRegistrations[language] = localeType;
    }

    public Init(richContentEditor: RichContentEditor)
    {
        super.Init(richContentEditor);

        this._locale = new RichContentMediaEditor._localeRegistrations[richContentEditor.Options.Language]();
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
            const coreElement = elem.find('.rce-media');
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

        if ($('video source', coreElement).length)
        {
            return $('video source', coreElement).attr('src');
        }

        return $('audio source', coreElement).attr('src');
    }

    public InsertElement(url: string, targetElement?: JQuery<HTMLElement>)
    {
        const wrapper = $('<div class="rce-media-wrapper"></div>');

        this.updateElement(wrapper, url);

        if (!targetElement)
        {
            targetElement = $(`#${this.RichContentEditorInstance.EditorId} .rce-grid`);
        }

        this.Attach(wrapper, targetElement);
    }

    private getCoreElement(mediaType: MediaType)
    {
        if (mediaType == MediaType.YouTubeVideo)
        {
            return $('<div class="rce-media video"><iframe allowfullscreen="allowfullscreen" frameborder="0"></iframe></div>');
        }

        if (mediaType == MediaType.GenericVideo)
        {
            return $('<div class="rce-media video videojs"><video class="video-js vjs-default-skin vjs-16-9" preload="auto" controls><source /></video></div>');
        }

        if (mediaType == MediaType.GenericAudio)
        {
            return $('<div class="rce-media audio videojs"><audio class="video-js vjs-default-skin" preload="auto" controls><source /></video></div>');
        }
    }

    private updateElement(elem: JQuery<HTMLElement>, url: string)
    {
        const mediaType = this.getMediaType(url);

        const coreElement = this.getCoreElement(mediaType); 

        elem.empty();
        elem.append(coreElement);

        if (mediaType == MediaType.YouTubeVideo)
        {
            const iframe = coreElement.find('iframe');
            iframe.attr('src', url);
        }
        else if (mediaType == MediaType.GenericVideo)
        {
            const source = coreElement.find('video source');
            source.attr('src', url);
        }
        else if (mediaType == MediaType.GenericAudio)
        {
            const source = coreElement.find('audio source');
            source.attr('src', url);
        }
    }

    private getMediaType(url: string): MediaType
    {
        if (url.indexOf('youtube.com/embed/') > -1)
        {
            return MediaType.YouTubeVideo;
        }

        if (RichContentUtils.GetMimeType(url).split('/')[0] == 'video')
        {
            return MediaType.GenericVideo
        }

        if (RichContentUtils.GetMimeType(url).split('/')[0] == 'audio')
        {
            return MediaType.GenericAudio
        }
    }

    public GetDetectionSelectors(): string
    {
        return 'div.video,div.audio';
    }

    public GetActualElement(elem: JQuery<HTMLElement>): JQuery<HTMLElement>
    {
        return elem.find('div.video');
    }

    public Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>, touchedElements: HTMLElement[]): JQuery<HTMLElement>
    {
        if (source.is('div.video') || source.is('div.audio'))
        {
            let clone = source.clone();
            clone.addClass('rce-media');
            const wrapper = $('<div class="rce-media-wrapper"></div>');
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
        elem.removeClass('rce-media');
        //elem.removeAttr('draggable');

        super.Clean(elem);
    }

    public GetContextButtonText(_elem: JQuery<HTMLElement>): string
    {
        return 'media';
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

RichContentBaseEditor.RegisterEditor('RichContentVideoEditor', RichContentMediaEditor);