# sky-accordion
> JS module for cropping images in accordance to the desired width and height.

## Dependencies
- No dependencies

## Support
- source.unsplash url (with size post-fix): [https://source.unsplash.com/Ixp4YhCKZkI/1600x900]
- umbraco imageprocessor urls.

## Usage
Import sky-crop. The css-class `.skyCrop-parent` controlls the image element's `width` and `height`
``` html
<sky-crop
	src="https://source.unsplash.com/Ixp4YhCKZkI/1600x900"
	focalpoint="50%,50%"
	mode="width"
	round="175"
	type="div">
	// Options:
	focalPoint (optional): Must be comma-seperated percentage values. (default: '50%,50%')
	mode (optional): Must be string (default/fallback: 'width') ['width'|'height'|'cover'|'contain']
	round (optional): Must be int (default/fallback: 1)
	type (optional): Must be string (default: 'img', fallback: 'div') ['img'|'div']
</sky-crop>
```
``` css
.skyCrop-parent {
	overflow: hidden;
	width: 100%;
	height: 400px;
}
```

# Credits
This module is made by the Frontenders at [skybrud.dk](http://www.skybrud.dk/). Feel free to use it in any way you want. Feedback, questions and bugreports should be posted as issues. Pull-requests appreciated!