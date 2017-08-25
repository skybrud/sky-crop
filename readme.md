# sky-crop
> JS module for cropping images in accordance to the desired width and height.

## Dependencies
- Core-js [https://github.com/zloirock/core-js]
- Sky-window [https://github.com/skybrud/sky-window]
- RxJs [https://github.com/ReactiveX/rxjs]

## Support
- source.unsplash url (with size post-fix): https://source.unsplash.com/[yourDesiredImageSelector]/1600x900
- umbraco imageprocessor urls. eg http://[imagePath]?center=0.915,0.40833333333333333&mode=crop&rnd=131419166470000000&height=600&width=1000

## Usage
Import sky-crop. The following is the bare minimum for using sky-crop.
``` html
<sky-crop src="supportedImageUrl"></sky-crop>
```
Available attributes (optional): 
read as `attr-name="defaultValue"` [supported types] : required syntax / options
* `auto="null"` [String] : 'width', 'height'
* `focal="50%,50%"` [String] : 'x%,y%' from top left cornor of image
* `mode="width"` [String] : 'width', 'height', 'cover', 'contain'
* `round="100"` [String | integer] 
* `container="sky-crop"` [String | HTMLDomElement] : Class selector without `.(dot)` on element defined as container or the domElement.

### auto
By setting this attr you specify that the image `height` or `width` will not be hindered by it's parent, if no styling is set on the ancestoral elements.

### focal
Desired point to be set as close to center as posible.

### mode
Best result will be given if the container has width and height set in css.
**width**: image will fill entire container width - overflow in y axis is hidden.
**height**: image will fill entire container height - overflow in x axis is hidden.
**contain**: image will always be fully visible.
**cover**: image will fill entire container - overflow is hidden.

### round
Indication of how often you would like a recrop of your image. Case: image is loaded and starts with cropped dimensions at 400x300. At `round="100"` should the image be stretch to more than `500` in width and/or `400` in height, a recrop will be initiated.

### container
Class name or the desired HTMLDomElement. The class name must be provided without `.(dot)` and `<sky-crop>` must be nested in the container. This is handy when used in eg a slider:
```html
<div class="myDisplay">
    <div class="slide">
        <sky-crop src="..." container="myDisplay"></sky-crop>
    </div>
    <div class="slide">
        <sky-crop src="..." container="myDisplay"></sky-crop>
    </div>
    ...
</div>
```

# Credits
This module is made by the Frontenders at [skybrud.dk](http://www.skybrud.dk/). Feel free to use it in any way you want. Feedback, questions and bugreports should be posted as issues. Pull-requests appreciated!
