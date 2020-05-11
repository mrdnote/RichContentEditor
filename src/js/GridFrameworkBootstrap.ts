class GridFrameworkBootstrap extends GridFrameworkBase
{
    public GetRowClass()
    {
        return 'row';
    }

    public GetColumnClass(width: number)
    {
        return `col col-${width} col-md-${width} col-lg-${width} col-xl-${width}`;
    }

    public GetSmallPrefix(): string
    {
        return 'col-';
    }

    public GetMediumPrefix(): string
    {
        return 'col-md-';
    }

    public GetLargePrefix(): string
    {
        return 'col-lg-';
    }

    public GetExtraLargePrefix(): string
    {
        return 'col-xl-';
    }

    public GetRightAlignClass?(): string
    {
        return 'pull-right';
    }

    public GetLeftAlignClass?(): string
    {
        return 'pull-left';
    }

    public GetRightAlignCss?(): KeyValue<string>
    {
        return null;
    }

    public GetLeftAlignCss?(): KeyValue<string>
    {
        return null;
    }
}

GridFrameworkBase.Register(GridFrameworkBootstrap);