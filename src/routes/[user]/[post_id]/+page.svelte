<script lang="ts">
	import BackButton from '$lib/components/BackButton.svelte';
	import PostCard from '$lib/components/PostCard.svelte';
	import type { Post } from '$lib/interfaces/post';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import { previousPath } from '$lib/stores';
	import { goto } from '$app/navigation';

	let { data }: PageProps = $props();
	let post: Post = $state(data.post);
	let username = $state(data.username);
	let profile = $state(data.profile);
	
	function setPosts(newPosts: Post[], toProfile?: boolean) {
		if (toProfile && profile) {
			profile.posts = newPosts;
			const updatedPost = profile.posts.find((p) => p.id === post.id);
			if (updatedPost) {
				post = updatedPost;
			} else {
				goto($previousPath ?? "/", {
					invalidateAll: true,
					replaceState: true
				})
			}
		} else {
			// posts = newPosts;
		}
	}

</script>

<div class="flex min-h-screen flex-col bg-linear-to-b from-emerald-50 to-white p-4">
	<div class="py-2">
		<BackButton />
	</div>
	<PostCard {post} {profile} {setPosts} />
</div>
