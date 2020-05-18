class XYPosition
{
    public constructor(x: number, y: number)
    {
        this.X = x;
        this.Y = y;
    }

    public X: number;
    public Y: number;
}

class RichContentUtils
{
    public static ShowMenu(menu, buttonOrPosition: JQuery<HTMLElement> | XYPosition)
    {
        let xy: XYPosition;
        if (buttonOrPosition instanceof XYPosition)
        {
            xy = buttonOrPosition as XYPosition;
        }
        else
        {
            const button = buttonOrPosition as JQuery<HTMLElement>;
            menu.data('origin', button);
            xy = new XYPosition(button.offset().left, button.offset().top + button.height());
        }
        menu.css({ left: xy.X, top: xy.Y });
        $('body').append(menu);
    }
}