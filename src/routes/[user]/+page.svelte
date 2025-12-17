<script lang="ts">
	import { page } from '$app/state';
	import BackButton from '$lib/components/BackButton.svelte';
	import PostCard from '$lib/components/PostCard.svelte';
	import type { PageProps } from './$types';
	import Icon from '@iconify/svelte';

	let { data }: PageProps = $props();

	let user = page.params.user;

	let profile = $state(data.profile);
</script>

<div class="flex min-h-screen flex-col bg-linear-to-b from-emerald-50 to-white p-4">
	<section
		class="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-white/80 p-5 shadow-md backdrop-blur-sm"
	>
		<div class="flex items-center gap-4">
			<div
				class="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-200 text-xl font-bold text-emerald-800"
			>
				{#if user}
					{user.charAt(0).toUpperCase()}
				{:else}
					U
				{/if}
			</div>
			<div class="flex-1">
				<div class="flex items-baseline justify-between gap-3">
					<h2 class="text-lg font-semibold text-emerald-900">{user ? user : 'Invitado'}</h2>
				</div>
				<p class="mt-1 text-xs text-stone-500">
					Publicaciones: {profile.posts.length}
				</p>
			</div>
		</div>
	</section>

	<div class="py-2">
		<BackButton />
	</div>

	<section class="flex flex-col gap-2">
		{#each profile.posts as post}
			<PostCard {post} />
		{/each}
	</section>
</div>
