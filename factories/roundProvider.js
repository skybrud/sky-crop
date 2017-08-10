export default function (round) {
	return value => Math.ceil(value / round) * round;
}

/*
	Wanna avoid unreadable double shorthand version:
	export default round => value => Math.ceil(value / round) * round;
*/
