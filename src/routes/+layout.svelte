<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { beforeNavigate } from '$app/navigation';
	import { previousPath } from '$lib/stores';
	import Toast from '$lib/components/Toast.svelte';

	let { children } = $props();

	beforeNavigate(({ from }) => {
		if (from) {
			$previousPath = from.url.pathname;
		}
	})

</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>¡Mi Blog!</title>
</svelte:head>

<Toast />
{@render children()}
