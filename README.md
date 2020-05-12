<h1>RichContentEditor Readme</h1>
RichContentEditor is a WYSIWYG editor for embedding in html. It is configurable and extendable and responsive from the get-go.

<h2>Demo</h2>
You can find a demo of the editor over on GitHub.io: https://mrdnote.github.io/RichContentEditor/example/bootstrap.html

<h2>Getting started</h2>
Download the repository archive, unzip it and add the css and javascript from the <code>dist</code> directory to your html.

```html
  <html>
    <head>
      <link rel="stylesheet" href="../src/css/RichContentEditor.css" />
    </head>
    <body>
    
      <!-- your content -->
    
      <!-- SortableJS makes it possible to sort elements in the editor. Optional. -->  
      <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.10.2/Sortable.min.js"></script>

      <!-- Crossbrowser support for editor range selections -->
      <script src="https://cdn.jsdelivr.net/npm/rangy@1.3.0/lib/rangy-core.js"></script>
      
      <!-- The main library file -->
      <script src="../dist/js/RichContentEditor.js"></script>
    </body>
  </html>
```

Add a <code>&lt;div></code> with an id attribute, at the position where you want to show the editor:
Simpy add the css and javascript to a div to your html:

```html
  <div id="MyEditor"></div>
```

And load the editor into it by creating a <code>RichContentEditor</code> instance and calling <code>Init</code> on it:

```html
  <script>
    new RichContentEditor().Init('MyEditor');
  </script>
```

Check out the html in the <code>example</code> directory for a complete example of how to use the RichContentEditor library.

<h2>Credits</h2>

The library uses <a href="https://github.com/SortableJS/Sortable" target="_blank">SortableJs</a> to enable sorting.<br/>
The library uses <a href="https://github.com/timdown/rangy" target="_blank">rangy</a> to implement selection ranges of content in the editor.<br/>