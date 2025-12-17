<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { Post } from '$lib/interfaces/post';
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	interface Props {
		post: Post;
	}

	let { post }: Props = $props();
	let username = $state('');
	let inThePost = $state(false);
	const urlPost = $derived(`/${username}/${post.id}`);

	onMount(async () => {
		const res = await fetch(`/api/username_by_id/${post.userId}`);
		const data = await res.json();
		if (res.ok) {
			username = data.username;
		}

		if (page.url.pathname === urlPost) {
			inThePost = true;
		}
	});

	function goToPost() {
		if (inThePost) {
			return;
		}
		goto(urlPost);
	}

	function goToProfile() {
		goto(`/${username}/`);
	}
</script>

<section
	class="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-white/80 p-5 shadow-md backdrop-blur-sm hover:bg-emerald-50/5 hover:shadow-lg hover:shadow-emerald-900/25"
>
	<div class="flex flex-col gap-2">
		<span class="font-semibold text-emerald-800"> Título </span>
		<h3 class="p-1 text-xl text-stone-700">
			{post.title}
		</h3>
	</div>
	<div class="flex flex-col gap-2">
		<span class="font-semibold text-emerald-800"> Contenido </span>
		<textarea class="field-sizing-content p-1 text-stone-700" disabled>{post.content}</textarea>
	</div>
	<div class="flex flex-row items-center gap-2">
		{#if !inThePost}
			<button
				type="submit"
				class="cursor-pointer rounded-md px-4 py-2 font-semibold text-emerald-600 ring-1 ring-emerald-600 transition duration-500 hover:bg-emerald-600 hover:text-white hover:ring-white"
				onclick={goToPost}
			>
				Ver publicación
			</button>
		{/if}

		{#if username && page.route.id === '/'}
			<button
				in:fade
				class="ml-auto flex cursor-pointer flex-row gap-2 text-sm transition hover:scale-105"
				onclick={goToProfile}
			>
				<span class="font-semibold text-emerald-800"> Creador </span>
				<span class="text-emerald-700">
					{username}
				</span>
			</button>
		{/if}
	</div>
</section>
