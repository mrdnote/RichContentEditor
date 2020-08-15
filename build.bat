call tsc
IF %ERRORLEVEL% NEQ 0 PAUSE

IF EXIST dist\js\RichContentEditor.js del /Q dist\js\RichContentEditor.js
for %%x in (
    src\js\RichContentUtils.js,
    src\js\RichContentBaseEditor.js,
    src\js\RichContentEditor.js,
    src\js\RichContentTextEditor.js,
    src\js\RichContentHeadingEditor.js,
    src\js\RichContentImageEditor.js,
    src\js\RichContentVideoEditor.js,
    src\js\RichContentIFrameEditor.js,
    src\js\RichContentLinkEditor.js,
    src\js\RichContentFontAwesomeIconEditor.js,
    src\js\RichContentTableEditor.js,
    src\js\GridFrameworkBootstrap.js,
    src\js\GridFrameworkMaterialize.js,
    src\js\RichContentUtils.js,
    src\js\Locale\DialogManagerLocaleEN.js,
    src\js\Locale\FileManagerLocaleEN.js,
    src\js\Locale\RichContentEditorLocaleEN.js,
    src\js\Locale\RichContentFontAwesomeIconEditorLocaleEN.js,
    src\js\Locale\RichContentHeadingEditorLocaleEN.js,
    src\js\Locale\RichContentImageEditorLocaleEN.js,
    src\js\Locale\RichContentIFrameEditorLocaleEN.js,
    src\js\Locale\RichContentVideoEditorLocaleEN.js,
    src\js\Locale\RichContentLinkEditorLocaleEN.js,
    src\js\Locale\RichContentFontAwesomeIconEditorLocaleEN.js,
    src\js\Locale\RichContentTableEditorLocaleEN.js,
    src\js\Locale\RichContentTextEditorLocaleEN.js
) do (
    type %%x >> dist\js\RichContentEditor.js 
    echo. >> dist\js\RichContentEditor.js
)
IF %ERRORLEVEL% NEQ 0 PAUSE

for %%x in (
    src\js\Locale\DialogManagerLocaleNL.js,
    src\js\Locale\FileManagerLocaleNL.js,
    src\js\Locale\RichContentEditorLocaleNL.js,
    src\js\Locale\RichContentFontAwesomeIconEditorLocaleNL.js,
    src\js\Locale\RichContentHeadingEditorLocaleNL.js,
    src\js\Locale\RichContentImageEditorLocaleNL.js,
    src\js\Locale\RichContentVideoEditorLocaleNL.js,
    src\js\Locale\RichContentIFrameEditorLocaleNL.js,
    src\js\Locale\RichContentLinkEditorLocaleNL.js,
    src\js\Locale\RichContentFontAwesomeIconEditorLocaleNL.js,
    src\js\Locale\RichContentTableEditorLocaleNL.js,
    src\js\Locale\RichContentTextEditorLocaleNL.js
) do ( 
    type %%x >> dist\js\RichContentEditorNL.js
    echo. >> dist\js\RichContentEditorNL.js
)
IF %ERRORLEVEL% NEQ 0 PAUSE

copy src\css\RichContentEditor.css dist\css\RichContentEditor.css /Y

copy src\js\*.d.ts dist\js /Y
copy src\js\Locale\*.d.ts dist\js /Y