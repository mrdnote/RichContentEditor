﻿interface FileListItem
{
    name: string;
    uri: string;
}

enum ImageAlignment
{
    Fill, Left, Right
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

        this.RichContentEditorInstance.FileManager.ShowFileSelectionDialog(
            (url) => { this.InsertImage(url, ImageAlignment.Fill, this._appendElement); return true; }
        );
    }

    public InsertImage(url: string, alignment: ImageAlignment, targetElement?: JQuery<HTMLElement>)
    {
        const img = $('<img class="rce-image"></img>');
        img.attr('src', url);
        const imgWrapper = $('<div class="rce-image-wrapper"></div>');
        imgWrapper.addClass(this.getImageAlignmentClass(alignment));
        imgWrapper.append(img);

        if (!targetElement)
        {
            targetElement = $(`#${this.RichContentEditorInstance.EditorId} .rce-grid`);
        }

        this.Attach(imgWrapper, targetElement);
    }

    private getImageAlignmentClass(alignment: ImageAlignment): string
    {
        switch (alignment)
        {
            case ImageAlignment.Left: return 'rce-image-left';
            case ImageAlignment.Right: return 'rce-image-right';
            case ImageAlignment.Fill: return 'rce-image-block';
            default: throw `Unexpected alignment value: ${alignment}`;
        }
    }

    public GetDetectionSelectors(): string
    {
        return 'img';
    }

    public Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>)
    {
        if (source.is('img'))
        {
            let clone = source.clone();
            clone.addClass('rce-image');
            const imgWrapper = $('<div class="rce-image-wrapper"></div>');
            let alignment = ImageAlignment.Fill;
            if (clone.hasClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass()))
            {
                alignment = ImageAlignment.Left;
            }
            else if (clone.hasClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass()))
            {
                alignment = ImageAlignment.Right;
            }
            imgWrapper.addClass(this.getImageAlignmentClass(alignment));
            source.replaceWith(imgWrapper.append(clone));

            this.Attach(imgWrapper, targetElement);
        }
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

    public Clean(elem: JQuery<HTMLElement>): void
    {
        var wrapper = elem.closest('.rce-image-wrapper');
        if (wrapper.hasClass('rce-image-left'))
            elem.addClass(this.RichContentEditorInstance.GridFramework.GetLeftAlignClass());
        if (wrapper.hasClass('rce-image-right'))
            elem.addClass(this.RichContentEditorInstance.GridFramework.GetRightAlignClass());

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
        var leftCommand = new ContextCommand(this._locale.AlignLeftMenuLabel, 'fas fa-arrow-left', function (elem)
        {
            elem.removeClass('rce-image-block rce-image-right').addClass('rce-image-left');
        });

        var rightCommand = new ContextCommand(this._locale.AlignRightMenuLabel, 'fas fa-arrow-right', function (elem)
        {
            elem.removeClass('rce-image-block rce-image-left').addClass('rce-image-right');
        });

        var blockCommand = new ContextCommand(this._locale.BlockAlignMenuLabel, 'fas fa-arrows-alt-h', function (elem)
        {
            elem.removeClass('rce-image-left rce-image-right').addClass('rce-image-block');
        });

        return [leftCommand, rightCommand, blockCommand];
    }
}

RichContentBaseEditor.RegisterEditor(RichContentImageEditor);