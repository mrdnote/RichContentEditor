call tsc

type src\js\RichContentBaseEditor.js newline.js src\js\RichContentEditor.js newline.js src\js\RichContentTextEditor.js newline.js src\js\RichContentImageEditor.js newline.js src\js\RichContentTableEditor.js newline.js src\js\GridFrameworkBootstrap.js newline.js src\js\GridFrameworkMaterialize.js newline.js src\js\Locale\DialogManagerLocaleEN.js newline.js src\js\Locale\FileManagerLocaleEN.js newline.js src\js\Locale\RichContentEditorLocaleEN.js newline.js src\js\Locale\RichContentImageEditorLocaleEN.js newline.js src\js\Locale\RichContentTableEditorLocaleEN.js newline.js src\js\Locale\RichContentTextEditorLocaleEN.js > dist\js\RichContentEditor.js

del src\js\*.js 

type src\js\Locale\DialogManagerLocaleNL.js newline.js src\js\Locale\FileManagerLocaleNL.js newline.js src\js\Locale\RichContentEditorLocaleNL.js newline.js src\js\Locale\RichContentImageEditorLocaleNL.js newline.js src\js\Locale\RichContentTableEditorLocaleNL.js newline.js src\js\Locale\RichContentTextEditorLocaleNL.js > dist\js\RichContentEditorNL.js

del src\js\Locale\*.js

copy src\css\RichContentEditor.css dist\css\RichContentEditor.css /Y