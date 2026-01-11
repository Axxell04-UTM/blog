<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { Post } from '$lib/interfaces/post';
	import type { Profile } from '$lib/interfaces/profile';
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import Icon from "@iconify/svelte";
	import { enhance } from '$app/forms';
	import { toastMessage } from '$lib/stores';
	import { CldImage, CldUploadWidget, type CloudinaryUploadWidgetResults } from 'svelte-cloudinary';

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
	let newImgUrl = $state(post.imgUrl ?? "")

	let editMode = $state(false);

	// HTML Elements

	function resetEditInputs () {
		newTitle = post.title;
		newContent = post.content;
		newImgUrl = post.imgUrl ?? "";
	}

	function closeEditMode () {
		resetEditInputs();
		toggleEditMode(false);
	}

	function onImgUpdateUpload (res: CloudinaryUploadWidgetResults) {
		if (res.event === "success" && (typeof res.info !== "string" && typeof res.info !== "undefined")) {
			newImgUrl = "";
			newImgUrl = res.info.url;
			console.log(res.info.url);
		}
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

	$inspect(newImgUrl)

</script>

<section
	class="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-white/80 p-5 shadow-md backdrop-blur-sm hover:bg-emerald-50/5 hover:shadow-lg hover:shadow-emerald-900/25"
>
	<!-- Tittle Section -->
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
	
	<!-- Content Section -->
	<div class="flex flex-wrap gap-2">
		<div class="flex flex-col grow gap-2">
			<span class="font-semibold text-emerald-800"> Contenido </span>
			{#if editMode}
			<textarea class="field-sizing-content rounded-md p-2 ring-1 ring-emerald-600 outline-emerald-600 text-stone-700" bind:value={newContent}></textarea>
			{:else}
			<textarea class="field-sizing-content p-1 text-stone-700 h-full" disabled>{post.content}</textarea>
			{/if}
		</div>
		<!-- IMAGE -->
		{#if (!editMode && post.imgUrl) || newImgUrl }
		<div transition:scale class="w-fit max-w-1/2 max-h-80 h-fit relative mx-auto">
			<CldImage objectFit="contain" alt="Blog-IMG" class="max-h-[inherit]"  height="auto" width="auto" radius={10} src={!editMode ? post.imgUrl ?? "" : newImgUrl}  />
			{#if editMode}
			<div class="absolute inset-0 rounded-md bg-emerald-50/30 backdrop-blur-sm flex items-center justify-center opacity-0 transition duration-500 hover:opacity-100">
				<button
					in:fade
					type="button"
					class="cursor-pointer rounded-full outline-none p-2 font-semibold text-emerald-600 ring-1 ring-emerald-600 transition duration-500 hover:bg-emerald-600 hover:text-white hover:ring-white"
					onclick={() => { newImgUrl = "" }}
				>
					<Icon icon="iconamoon:trash-bold" class="text-2xl" />
				</button>
			</div>				
			{/if}
		</div>
		{/if}
	</div>
	{#if editMode}
	<CldUploadWidget uploadPreset="blog_preset"  let:open let:isLoading onSuccess={onImgUpdateUpload}>
		<button type="button" onclick={() => open()} disabled={isLoading} class="ring ring-emerald-600 py-1 px-3 rounded-md cursor-pointer hover:bg-emerald-50 transition">
			Añadir Imagen
		</button>
	</CldUploadWidget>			
	{/if}
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
			<form method="post" action="/?/update_post" use:enhance={() => {
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
						$toastMessage = "Blog Editado";
						post.imgUrl = newImgUrl;
						closeEditMode();
					}
				}
			}}>
				<input type="hidden" name="post_id" value={post.id}>
				<input type="hidden" name="profile_id" value={profile.user_id}>
				<input type="hidden" name="new_title" value={newTitle}>
				<input type="hidden" name="new_content" value={newContent}>
				<input type="hidden" name="new_img_url" value={newImgUrl}>				
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

			<form method="post" action="/?/delete_post" use:enhance={() => {
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
						$toastMessage = "Blog Eliminado";
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






<!-- asset_folder
	: 
	"blog"
	asset_id
	: 
	"1918c11aca367add8a1c8e879c117deb"
	bytes
	: 
	206851
	created_at
	: 
	"2026-01-10T22:38:34Z"
	display_name
	: 
	"Captura de pantalla 2025-09-05 202949"
	etag
	: 
	"9783aa4079762017014c93b65e125fb1"
	format
	: 
	"png"
	height
	: 
	544
	original_filename
	: 
	"Captura de pantalla 2025-09-05 202949"
	placeholder
	: 
	false
	public_id
	: 
	"b2br2hfnzy33ihpvt6kp"
	resource_type
	: 
	"image"
	secure_url
	: 
	"https://res.cloudinary.com/dzlfy5fyf/image/upload/v1768084714/b2br2hfnzy33ihpvt6kp.png"
	signature
	: 
	"80536bcd7349914b374a26bf6e86f71f278a6a16"
	tags
	: 
	[]
	type
	: 
	"upload"
	url
	: 
	"http://res.cloudinary.com/dzlfy5fyf/image/upload/v1768084714/b2br2hfnzy33ihpvt6kp.png"
	version
	: 
	1768084714
	version_id
	: 
	"109e0108c7ff51ee4cdf47b5be893513"
	width
	: 
	229 -->