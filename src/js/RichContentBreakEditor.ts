class RichContentBreakEditor extends RichContentBaseEditor
{
    private _appendElement: JQuery<HTMLElement>;

    public Init(richContentEditor: RichContentEditor)
    {
        super.Init(richContentEditor);
    }

    public Insert(targetElement?: JQuery<HTMLElement>)
    {
        super.Insert(targetElement);

        if (!targetElement)
        {
            targetElement = $('.rce-grid', this.RichContentEditorInstance.GridSelector);
        }

        this._appendElement = targetElement;

        this.InsertBreak(targetElement);
    }

    public InsertBreak(targetElement?: JQuery<HTMLElement>)
    {
        const breakElement = $('<div class="rce-break clearfix"></div>');

        if (!targetElement)
        {
            targetElement = $(`#${this.RichContentEditorInstance.EditorId} .rce-grid`);
        }

        this.Attach(breakElement, targetElement);
    }

    public GetDetectionSelectors(): string
    {
        return 'div.clearfix';
    }

    public Import(targetElement: JQuery<HTMLElement>, source: JQuery<HTMLElement>, touchedElements: HTMLElement[]): JQuery<HTMLElement>
    {
        if (source.is('div.clearfix'))
        {
            let clone = source.clone();
            clone.addClass('rce-break');
            source.replaceWith(clone);

            this.Attach(clone, targetElement);

            return clone;
        }

        return null;
    }

    public GetMenuLabel(): string
    {
        return "Break";
    }

    public GetMenuIconClasses(): string
    {
        return 'fas fa-terminal';
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
        elem.removeClass('rce-break');
        if (elem.attr('class') === '')
            elem.removeAttr('class');
        elem.removeAttr('draggable');

        super.Clean(elem);
    }

    public GetContextButtonText(_elem: JQuery<HTMLElement>): string
    {
        return 'c';
    }

    public UseWrapper(): boolean
    {
        return false; 
    }
}

RichContentBaseEditor.RegisterEditor('RichContentBreakEditor', RichContentBreakEditor);