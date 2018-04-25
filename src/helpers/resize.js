import _throttle from 'lodash.throttle';

const _callbacks = [];
const _throttledCallbacks = [];
let _listenerOn = false;

const runCallbacks = () => {
	for (let i = _callbacks.length - 1; i >= 0; i--) {
		_callbacks[i]();
	}
};

const runThrottledCallbacks = _throttle(() => {
	for (let i = _throttledCallbacks.length - 1; i >= 0; i--) {
		_throttledCallbacks[i]();
	}
}, 300);

function onResize() {
	runCallbacks();
	runThrottledCallbacks();
}

function on(fn, throttle = true) {
	const array = (throttle) ? _throttledCallbacks : _callbacks;
	array.push(fn);
	if (typeof window !== 'undefined' && !_listenerOn) {
		window.addEventListener('resize', onResize);
		_listenerOn = true;
	}
}

function off(fn, throttle = true) {
	const array = (throttle) ? _throttledCallbacks : _callbacks;
	const index = array.indexOf(fn);
	if (index > -1) {
		array.splice(index, 1);
	}
	if (typeof window !== 'undefined'
		&& _listenerOn
		&& !_callbacks.length
		&& !_throttledCallbacks.length) {
		window.removeEventListener('resize', onResize);
		_listenerOn = false;
	}
}

export default {
	on,
	off,
};
