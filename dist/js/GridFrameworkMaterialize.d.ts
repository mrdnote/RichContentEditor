declare class GridFrameworkMaterialize extends GridFrameworkBase {
    UpdateFields(): void;
    GetRowClass(): string;
    GetColumnClass(width: number): string;
    GetSmallPrefix(): string;
    GetMediumPrefix(): string;
    GetLargePrefix(): string;
    GetExtraLargePrefix(): string;
    GetPreviousSize(size: string): string;
    GetRightAlignClass?(): string;
    GetLeftAlignClass?(): string;
    GetBlockAlignClass?(): string;
    GetRightAlignCss?(): KeyValue<string>;
    GetLeftAlignCss?(): KeyValue<string>;
    GetBlockAlignCss?(): KeyValue<string>;
    GetColumnLeftAlignClass(): string;
    GetColumnCenterAlignClass(): string;
    GetColumnRightAlignClass(): string;
}
