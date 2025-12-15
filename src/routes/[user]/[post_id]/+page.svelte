<script lang="ts">
	import BackButton from "$lib/components/BackButton.svelte";
	import PostCard from "$lib/components/PostCard.svelte";
	import type { Post } from "$lib/interfaces/post";
	import type { PageProps } from "./$types";

	
    let { data }: PageProps = $props();
    let post: Post = $state(data.post);
    let username = $state(data.username);
    
</script>


<div class="min-h-screen flex flex-col bg-linear-to-b from-emerald-50 to-white p-4">
    <div class="py-2">
        <BackButton />
    </div>
    <PostCard {post} />

</div>