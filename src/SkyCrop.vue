<template>
	<div :class="rootClasses">
		<img
			ref="image"
			v-for="(url, index) in cropArray"
			:key="index"
			:class="imageClasses"
			:src="url"
			:alt="alt"
			@load="loaded"
		/>
	</div>
</template>
<style lang="scss" src="./SkyCrop.scss"></style>
<script src="./SkyCrop.js"></script>
