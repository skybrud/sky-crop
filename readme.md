# sky-crop
> VueJS module for cropping images from umbraco imageprocessor (http://imageprocessor.org/imageprocessor-web/).


Only requirement is that the original size of the image is included in the url parameters.
- ImageProcessor/Umbraco urls - eg. `[imagePath]?anchor=center&height=600&width=1000`

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

// If you want to use the baseline scss add the following line
import '${YOUR-PROJECT-ROOT-PATH}/node_modules/sky-crop/dist/sky-crop.css';

Vue.use(SkyCrop);

```
The `<sky-crop>` component registers globally and can now be used.

Basic example:
``` html
<sky-crop src="/your-image.png?anchor=center&height=600&width=1000" />
```

Advanced example:
``` html
<sky-crop
  src="/your-image.png?anchor=center&height=600&width=1000"
  mode="cover"
  :round="100"
  :options="{ upscale: false }"
/>
```
### Available attributes (optional):
Read as *`attributeName="defaultValue"` [supported types]*
* `mode="width"` [String] : 'width', 'height', 'cover', 'contain'
* `:round="100"` [Number]
* `:options="{ upscale: false }"`


### mode
Best result will be given if the container has width and height set in css.

<u>*width*</u>

* image will fill entire container width - height will be based on the image original ratio.
* only `width` dimension is required in this mode.

<u>*height*</u>

* image will fill entire container height - width will be based on the image original ratio.
* only `height` dimension is required in this mode.

<u>*contain*</u>

* image will always be fully visible.
* `height` and `width` is required in this mode.

<u>*cover*</u>

* image will fill entire container - overflow is hidden.
* `height` and `width` is required in this mode.



#### round
Indication of how often you would like a recrop of your image.
**Case:** image is loaded and starts with cropped dimensions at 350x350. At `round="100"` should the image be stretch to more than `400` in width and/or `400` in height, a recrop will be initiated.

## Events:
The SkyCrop component emits two events:
* `loaded` - when a cropped image finishes loading, the emitted data it the loaded src url.
* `loading` - when fetching of a new crop is ongoing

**Note:** These events can be triggered multiple times per component - for instance if the viewport is resized and a new crop is needed.

Example:
```html
<sky-crop
  src="/your-image.png?anchor=center&height=600&width=1000"
  mode="cover"
  round="200"
  @loaded="yourOnImageLoadedMethod"
  @loading="yourOnImageLoadingMethod"
/>
```

# Credits
This module is made by the Frontenders at [skybrud.dk](http://www.skybrud.dk/). Feel free to use it in any way you want. Feedback, questions and bugreports should be posted as issues. Pull-requests appreciated!
