# jQuery imageHalftone plugin

Floyd-Steinberg algorithm implementation for javascript.

## Available options ##

* radius: [Integer:1] Number of pixels per dot.
* output: [String(canvas|image):'canvas'] Type of resulting image. canvas - original image is replaced with a canvas element; image - original image is replaced with a new image.
* target: [Mixed:null] CSS selector of the container to append new converted image (or canvas) to. Original image will not be replaced. If target is a function then it is called with new image passed as argument.
* grayscale: [Boolean:false] Just convert image to grayscale.
* addCSS: [Object:{}] CSS properties to be added to the image or canvas.
* addClass: [String:null] Class name to be added.

## Example of usage ##

```javascript
$('#poster').imageHalftone({
    output: 'image',
    addClass: 'ht-poster',
    target: function($new) {
    	$new.appendTo('#posters-container')
    }
});
```

## Demo page ##

[View demo page].

[View demo page]: http://dfsq.info/projects/imageHalftone
