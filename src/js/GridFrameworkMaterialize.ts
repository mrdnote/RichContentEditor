﻿class GridFrameworkMaterialize extends GridFrameworkBase
{
    public UpdateFields()
    {
        (window as any).M.updateTextFields();
    }

    public GetRowClass()
    {
        return 'row';
    }

    public GetColumnClass(width: number)
    {
        return `col s${width} m${width} l${width} xl${width}`;
    }

    public GetSmallPrefix(): string
    {
        return 's';
    }

    public GetMediumPrefix(): string
    {
        return 'm';
    }

    public GetLargePrefix(): string
    {
        return 'l';
    }

    public GetExtraLargePrefix(): string
    {
        return 'xl';
    }

    public GetPreviousSize(size: string): string
    {
        if (size === 'm')
        {
            return 's';
        }
        if (size === 'l')
        {
            return 'm';
        }
        if (size === 'xl')
        {
            return 'l';
        }
    }

    public GetRightAlignClass?(): string
    {
        return 'right';
    }

    public GetLeftAlignClass?(): string
    {
        return 'left';
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

GridFrameworkBase.Register(GridFrameworkMaterialize);