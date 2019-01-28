<template>
	<div :class="rootClasses">
		<img
			ref="image"
			:class="imageClasses"
			:src="cropUrl"
		/>
	</div>
</template>
<style lang="scss" src="./SkyCrop.scss"></style>
<script src="./SkyCrop.js"></script>
