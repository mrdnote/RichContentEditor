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
    public static GetMimeType(url: string): string
    {
        const ext = this.GetExtensionOfUrl(url);

        if (ext === 'mp4')
        {
            return 'video/mp4';
        }
        if (ext === 'mp3')
        {
            return 'audio/mpeg';
        }

        return null;
    }

    public static IsVideoUrl(url: string): boolean
    {
        const ext = this.GetExtensionOfUrl(url);

        if (ext === 'mp4')
        {
            return true;
        }

        return false;
    }

    public static IsAudioUrl(url: string): boolean
    {
        const ext = this.GetExtensionOfUrl(url);

        if (ext === 'mp3')
        {
            return true;
        }

        return false;
    }

    public static HasFeatherLight(): boolean
    {
        return (window as any).$.featherlight;
    }

    public static GetExtensionOfUrl(url: string): string
    {
        const lastPointIndex = url.lastIndexOf('.');
        if (lastPointIndex > -1)
        {
            return url.substr(lastPointIndex + 1).toLowerCase();
        }

        return null;
    }

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

    public static IsNullOrEmpty(value: string): boolean
    {
        return value === null || value === '' || value === undefined;
    }
}