<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { Post } from '$lib/interfaces/post';
	import type { Profile } from '$lib/interfaces/profile';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Icon from "@iconify/svelte";
	import { enhance } from '$app/forms';

	interface Props {
		post: Post;
		profile: Profile | undefined;
		setPosts: (newPosts: Post[], toProfile?: boolean) => void
	}

	let { post, profile, setPosts }: Props = $props();
	let username = $state('');
	let inThePost = $state(false);
	const urlPost = $derived(`/${username}/${post.id}`);

	let newTitle = $state(post.title);
	let newContent = $state(post.content);

	let editMode = $state(false);

	function resetEditInputs () {
		newTitle = post.title;
		newContent = post.content;
	}

	function closeEditMode () {
		resetEditInputs();
		toggleEditMode(false);
	}

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

	function toggleEditMode (visible?: boolean) {
		if (typeof visible !== "undefined") {
			editMode = visible;
		} else {
			editMode = !editMode;
		}
	}

	function goToPost() {
		if (inThePost) {
			return;
		}
		goto(urlPost);
	}

	async function goToProfile() {
		await goto(resolve(`/${username}/`));
	}
</script>

<section
	class="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-white/80 p-5 shadow-md backdrop-blur-sm hover:bg-emerald-50/5 hover:shadow-lg hover:shadow-emerald-900/25"
>
	<div class="flex flex-col gap-2">
		<span class="font-semibold text-emerald-800"> Título </span>

		{#if editMode}
		<input type="text" class="p-2 ring-1 rounded-md ring-emerald-600 outline-emerald-600" bind:value={newTitle}>
		{:else}
		<h3 class="p-1 text-xl text-stone-700">
			{post.title}
		</h3>
		{/if}
		
	</div>
	<div class="flex flex-col gap-2">
		<span class="font-semibold text-emerald-800"> Contenido </span>
		{#if editMode}
		<textarea class="field-sizing-content rounded-md p-2 ring-1 ring-emerald-600 outline-emerald-600 text-stone-700" bind:value={newContent}></textarea>
		{:else}
		<textarea class="field-sizing-content p-1 text-stone-700" disabled>{post.content}</textarea>
		{/if}
	</div>
	<div class="flex flex-wrap items-center gap-3">
		{#if !inThePost}
		<button
			type="submit"
			class="cursor-pointer rounded-md outline-none px-4 py-2 font-semibold text-emerald-600 ring-1 ring-emerald-600 transition duration-500 hover:bg-emerald-600 hover:text-white hover:ring-white"
			onclick={goToPost}
		>
			Ver publicación
		</button>		
		{/if}

		{#if profile?.user_id === post.userId}
		<div class="flex flex-wrap gap-2">
			{#if !editMode}
			<button
				in:fade
				type="submit"
				class="cursor-pointer rounded-md outline-none px-4 py-2 font-semibold bg-emerald-600 text-white ring-1 ring-white transition duration-500 hover:bg-emerald-600/75 hover:ring-emerald-600"
				onclick={() => toggleEditMode(true)}
			>
				Editar
			</button>
			{:else}
			<form method="post" action="?/update_post" use:enhance={() => {
				return async ({ result }) => {
					if (result.type === "success") {
						const posts = result.data?.posts as Post[];
						const myPosts = result.data?.myPosts as Post[];
						if (posts) {
							setPosts(posts);
						}
						if (myPosts) {
							setPosts(myPosts, true);
							closeEditMode();
						}
					}
				}
			}}>
				<input type="hidden" name="post_id" value={post.id}>
				<input type="hidden" name="profile_id" value={profile.user_id}>
				<input type="hidden" name="new_title" value={newTitle}>
				<input type="hidden" name="new_content" value={newContent}>
				<button
					in:fade
					type="submit"
					class="cursor-pointer rounded-full outline-none p-2 font-semibold bg-emerald-600 text-white ring-1 ring-emerald-600 transition duration-500 hover:bg-emerald-600/75"
				>
					<Icon icon="iconamoon:check-bold" class="text-2xl" />
				</button>
			</form>
			<button
				in:fade
				type="submit"
				class="cursor-pointer rounded-full outline-none p-2 font-semibold text-emerald-600 ring-1 ring-emerald-600 transition duration-500 hover:bg-emerald-600 hover:text-white hover:ring-white"
				onclick={closeEditMode}
			>
				<Icon icon="iconamoon:close-bold" class="text-2xl" />
			</button>

			<form method="post" action="?/delete_post" use:enhance={() => {
				return async ({ result }) => {
					if (result.type === "success") {
						const posts = result.data?.posts as Post[];
						const myPosts = result.data?.myPosts as Post[];
						if (posts) {
							setPosts(posts);
						}
						if (myPosts) {
							setPosts(myPosts, true);
						}
						closeEditMode();
					}
				}
			}}>
				<input type="hidden" name="post_id" value={post.id}>
				<input type="hidden" name="profile_id" value={profile.user_id}>

				<button
					in:fade
					type="submit"
					class="cursor-pointer rounded-full outline-none p-2 font-semibold text-emerald-600 ring-1 ring-emerald-600 transition duration-500 hover:bg-emerald-600 hover:text-white hover:ring-white"
				>
					<Icon icon="iconamoon:trash-bold" class="text-2xl" />
				</button>
			</form>
			{/if}
			
			

		</div>
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
