declare class GridFrameworkBootstrap extends GridFrameworkBase {
    GetRowClass(): string;
    GetColumnClass(width: number): string;
    GetSmallPrefix(): string;
    GetMediumPrefix(): string;
    GetLargePrefix(): string;
    GetExtraLargePrefix(): string;
    GetRightAlignClass?(): string;
    GetLeftAlignClass?(): string;
    GetBlockAlignClass?(): string;
    GetRightAlignCss?(): KeyValue<string>;
    GetLeftAlignCss?(): KeyValue<string>;
    GetColumnLeftAlignClass(): string;
    GetColumnCenterAlignClass(): string;
    GetColumnRightAlignClass(): string;
}
