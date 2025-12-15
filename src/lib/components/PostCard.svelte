<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import type { Post } from "$lib/interfaces/post";
	import { onMount } from "svelte";
	import { fade, scale } from "svelte/transition";

    interface Props {
        post: Post
    }

    let { post }: Props = $props();
    let username = $state("");
    let inThePost = $state(false);
    const urlPost = $derived(`/${username}/${post.id}`);

    onMount(async () => {
        const res = await fetch(`/api/username_by_id/${post.userId}`);
        const data = await res.json();
        if (res.ok) {
            username = data.username;
        }

        if ( page.url.pathname === urlPost ) { 
            inThePost = true;
        };
    })

    function goToPost () {
        if (inThePost) { return };
        goto(urlPost);
    }

    function goToProfile () {
        goto(`/${username}/`);
    }

</script>

<section class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-emerald-100 p-5 flex flex-col gap-4 hover:shadow-lg hover:shadow-emerald-900/25 hover:bg-emerald-50/5">
    <div class="flex flex-col gap-2">
        <span class="text-emerald-800 font-semibold">
            Título
        </span>
        <h3 class="p-1 text-xl text-stone-700">
            {post.title}
        </h3>          
    </div>
    <div class="flex flex-col gap-2">
        <span class="text-emerald-800 font-semibold">
            Contenido
        </span>
        <textarea class="p-1 text-stone-700 field-sizing-content" disabled>{post.content}</textarea>          
    </div>
    <div class="flex flex-row gap-2 items-center">
        {#if !inThePost}
        <button type="submit" class="px-4 py-2 rounded-md  text-emerald-600 ring-1 ring-emerald-600 font-semibold hover:bg-emerald-600 hover:text-white hover:ring-white transition duration-500 cursor-pointer"
        onclick={goToPost}
        >
            Ver publicación
        </button>
        {/if}

        {#if username && page.route.id === "/"}
        <button in:fade class="flex flex-row gap-2 text-sm ml-auto hover:scale-105 transition cursor-pointer"
        onclick={goToProfile}
        >
            <span class="text-emerald-800 font-semibold">
                Creador
            </span>
            <span class="text-emerald-700">
                {username}
            </span>
        </button>        
        {/if}
    </div>
</section>