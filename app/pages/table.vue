<template><OrderApp /></template>

<script lang="ts" setup>
	definePageMeta({
		middleware: [
			(to) => {
				if (typeof to.query.id !== 'string' || to.query.id.length !== 5)
					return navigateTo('/');
			},
		],
	});
</script>
