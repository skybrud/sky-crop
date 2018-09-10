# sky-crop
> JS module for cropping images in accordance to the desired width and height.

## Integrations
Sky crop supports the image sources below. Only requirement is that the original size of the image is included in the url parameters.
- Unsplash (source.unsplash.com with size post-fix) - eg. `https://source.unsplash.com/[yourDesiredImageSelector]/1600x900`
- ImageProcessor/Umbraco urls - eg. `http://[imagePath]?center=0.915,0.40833333333333333&mode=crop&rnd=131419166470000000&height=600&width=1000`

## Installation
```bash
npm install sky-crop
```
or
```bash
yarn add sky-crop
```

## Usage
Begin by importing and installing the SkyCrop Vue plugin:
```js
import Vue from 'vue';
import SkyCrop from 'sky-crop';

// If you want to use SkyCrop baseline scss add the following line
import './node_modules/sky-crop/src/SkyCrop.scss';

Vue.use(SkyCrop);

```
The `<sky-crop>` component registers globally and can now be used.

Basic example:
``` html
<sky-crop src="https://source.unsplash.com/[yourDesiredImageSelector]/1600x900" />
```

Advanced example:
``` html
<sky-crop
	src="https://source.unsplash.com/[yourDesiredImageSelector]/1600x900"
	focal="0%,50%"
	mode="cover"
	round="200"
/>
```
### Available attributes (optional):
Read as *`attributeName="defaultValue"` [supported types]*
* `auto="null"` [String] : 'width', 'height'
* `focal="50%,50%"` [String] : 'x%,y%' from top left cornor of image
* `mode="width"` [String] : 'width', 'height', 'cover', 'contain'
* `round="100"` [String | integer]
* `container="sky-crop"` [String | HTMLDomElement]
* `:show-default="true"` [Boolean]
*Class selector without `.(dot)` on element defined as container or the domElement.*

#### auto
By setting this attr you specify that the image `height` or `width` will not be hindered by it's parent, if no styling is set on the ancestoral elements.

#### focal
Desired point to be set as close to center as posible.

#### mode
Best result will be given if the container has width and height set in css.
* **width**: image will fill entire container width - overflow in y axis is hidden.
* **height**: image will fill entire container height - overflow in x axis is hidden.
* **contain**: image will always be fully visible.
* **cover**: image will fill entire container - overflow is hidden.

#### round
Indication of how often you would like a recrop of your image. Case: image is loaded and starts with cropped dimensions at 400x300. At `round="100"` should the image be stretch to more than `500` in width and/or `400` in height, a recrop will be initiated.

#### container
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

#### show-default
Boolean prop (`true` by default). By default SkyCrop will load a small default crop of an image (server-side, if using SSR) until the DOM can be measured and the actual sized crop can be fetched. If false, this default crop will not be loaded while awaiting the correct size.

## Events:
The SkyCrop component emits two events:
* `load` - when a cropped image finishes loading
* `loadStart` - when fetching of a new crop initiates
**Note:** These events can be triggered multiple times per component - for instance if the viewport is resized and a new crop is needed.

Example:
```html
<sky-crop
	src="https://source.unsplash.com/[yourDesiredImageSelector]/1600x900"
	mode="cover"
	round="200"
    @load="yourOnImageLoadedMethod"
    @loadStart="yourOnImageStartLoadingMethod"
/>
```

# Credits
This module is made by the Frontenders at [skybrud.dk](http://www.skybrud.dk/). Feel free to use it in any way you want. Feedback, questions and bugreports should be posted as issues. Pull-requests appreciated!
