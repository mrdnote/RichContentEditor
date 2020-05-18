declare class GridFrameworkBootstrap extends GridFrameworkBase {
    GetRowClass(): string;
    GetColumnClass(width: number): string;
    GetSmallPrefix(): string;
    GetMediumPrefix(): string;
    GetLargePrefix(): string;
    GetExtraLargePrefix(): string;
    GetRightAlignClass?(): string;
    GetLeftAlignClass?(): string;
    GetRightAlignCss?(): KeyValue<string>;
    GetLeftAlignCss?(): KeyValue<string>;
}
