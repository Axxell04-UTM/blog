<script lang="ts">
	import { enhance } from '$app/forms';
	import CommentCard from '$lib/components/CommentCard.svelte';
	import type { Profile } from '$lib/interfaces/profile';
	import SectionPerfil from '$lib/sections/SectionPerfil.svelte';
	import { scale, slide } from 'svelte/transition';
	import type { PageProps } from './$types';
	import type { Comment } from '$lib/interfaces/comment';
	import type { Post } from '$lib/interfaces/post';
	import PostCard from '$lib/components/PostCard.svelte';
	let session = false;

	let { data }: PageProps = $props();
	let profile: Profile | undefined = $state(data.profile);
	let posts: Post[] = $state(data.posts);

	let resMessage = $state('');

	let postView: 'Todas' | 'Mías' = $state('Todas');
	let formNewPostIsVisible = $state(false);

	function setProfile(newProfile: Profile | undefined) {
		profile = newProfile;
	}

	function setPosts(newPosts: Post[]) {
		posts = newPosts;
	}

	function updatePostsOfProfile(newPosts: Post[]) {
		if (!profile) {
			return;
		}
		profile.posts = newPosts;
	}

	// TOGGLE FUNCTIONS
	function togglePostView(newPostView?: 'Todas' | 'Mías') {
		if (newPostView) {
			postView = newPostView;
		} else {
			if (postView === 'Todas') {
				postView = 'Mías';
			} else {
				postView = 'Todas';
			}
		}
	}

	function toggleFormNewPostIsVisible(visible?: boolean) {
		if (typeof visible !== 'undefined') {
			formNewPostIsVisible = visible;
		} else {
			formNewPostIsVisible = !formNewPostIsVisible;
		}
	}

	function setResMessage(message: string) {
		resMessage = message;
		setTimeout(() => {
			resMessage = '';
		}, 2000);
	}
</script>

<div
	class="flex min-h-screen items-start justify-center bg-linear-to-b from-emerald-50 to-white px-4 py-8"
>
	<main class="w-full max-w-3xl space-y-6">
		<header class="text-center">
			<h1 class="text-3xl font-extrabold text-emerald-700">¡Mi Blog!</h1>
			<p class="mt-1 text-sm text-emerald-600/80">Comparte ideas, comenta y participa</p>
		</header>

		<!-- Perfil -->
		<SectionPerfil {profile} {setProfile} {setResMessage} {resMessage} />
		{#if profile}
			<div class="flex flex-col items-center">
				<button
					class="cursor-pointer rounded-md bg-emerald-500 px-4 py-2 font-medium text-white transition hover:bg-emerald-600"
					onclick={() => toggleFormNewPostIsVisible()}
				>
					{#if formNewPostIsVisible}
						Cancelar
					{:else}
						Nueva publicación
					{/if}
				</button>
			</div>
		{/if}

		<!-- Crear post -->
		{#if profile && formNewPostIsVisible}
			<section
				transition:slide={{ axis: 'y' }}
				class="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-white/80 p-5 shadow-md backdrop-blur-sm"
			>
				<form
					method="POST"
					action="?/create_post"
					use:enhance={({ formElement }) => {
						return async ({ result }) => {
							if (result.type === 'success') {
								// setComments(result.data?.comments as Comment[]);
								updatePostsOfProfile(result.data?.myPosts as Post[]);
								setPosts(result.data?.posts as Post[]);
								formElement.reset();
								toggleFormNewPostIsVisible(false);
							}
						};
					}}
					class="flex flex-col gap-3"
				>
					<input type="hidden" name="profile_id" value={profile.user_id} />
					<div class="flex flex-col gap-1">
						<label for="title" class="pl-2 font-semibold text-emerald-800"> Título </label>
						<input
							type="text"
							name="title"
							placeholder="Título..."
							class="flex-1 rounded-md border border-stone-100 bg-stone-50 px-3 py-2 transition focus:ring-2 focus:ring-emerald-200 focus:outline-none"
						/>
					</div>
					<div class="flex flex-col gap-1">
						<label for="content" class="pl-2 font-semibold text-emerald-800"> Contenido </label>
						<!-- <input type="text" name="content" placeholder="Contenido..." class="flex-1 px-3 py-2 rounded-md border border-stone-100 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition" />             -->
						<textarea
							name="content"
							id="content"
							placeholder="Contenido..."
							class="field-sizing-content flex-1 rounded-md border border-stone-100 bg-stone-50 px-3 py-2 transition focus:ring-2 focus:ring-emerald-200 focus:outline-none"
						></textarea>
					</div>
					<button
						class="rounded-md bg-emerald-500 px-4 py-2 font-medium text-white transition hover:bg-emerald-600"
					>
						Publicar
					</button>
				</form>
			</section>
		{/if}

		<!-- Posts -->
		<section class="space-y-1">
			<h2 class="text-xl font-semibold text-emerald-800">Publicaciones</h2>
			{#if profile}
				<div class="flex flex-row gap-0.5">
					{#if postView === 'Todas'}
						<button
							class="w-20 cursor-pointer rounded-tl-md bg-emerald-300/50 p-2 text-emerald-700 backdrop-blur-md transition hover:bg-emerald-300/80"
							onclick={() => togglePostView('Todas')}
						>
							Todas
						</button>
						<button
							class="w-20 cursor-pointer rounded-tr-md bg-stone-300/50 p-2 text-emerald-700 backdrop-blur-md transition hover:bg-stone-300/80"
							onclick={() => togglePostView('Mías')}
						>
							Mías
						</button>
					{:else}
						<button
							class="w-20 cursor-pointer rounded-tl-md bg-stone-300/50 p-2 text-emerald-700 backdrop-blur-md transition hover:bg-stone-300/80"
							onclick={() => togglePostView('Todas')}
						>
							Todas
						</button>
						<button
							class="w-20 cursor-pointer rounded-tr-md bg-emerald-300/50 p-2 text-emerald-700 backdrop-blur-md transition hover:bg-emerald-300/80"
							onclick={() => togglePostView('Mías')}
						>
							Mías
						</button>
					{/if}
				</div>
			{/if}

			{#if profile && postView === 'Mías'}
				{#each profile.posts as post (post.id)}
					{#key post.id}
						<div in:scale>
							<PostCard {post} />
						</div>
					{/key}
				{/each}
				{#if profile.posts.length === 0}
					<div class="rounded-lg border border-stone-50 bg-white py-6 text-center text-stone-500">
						Aún no has hecho ninguna publicación. Empieza haciendo click en <strong
							>Nueva publicación</strong
						>.
					</div>
				{/if}
			{:else}
				{#each posts as post (post.id)}
					{#key post.id}
						<div in:scale>
							<PostCard {post} />
						</div>
					{/key}
				{/each}
				{#if posts.length === 0}
					<div class="rounded-lg border border-stone-50 bg-white py-6 text-center text-stone-500">
						No hay publicación todavía. Sé el primero en hacer una.
					</div>
				{/if}
			{/if}
		</section>

		<!-- Crear comentario -->
		<!-- {#if profile}
    <section class="bg-white/80 rounded-2xl shadow-sm border border-emerald-50 p-4">
      <form method="POST" action="?/send_comment" use:enhance={() => {
          return async ({ result }) => {
              if (result.type === "success") {
                  // setComments(result.data?.comments as Comment[]);
              }
          }
      }}
      class="flex flex-col sm:flex-row gap-3 items-center"
      >
        <input type="hidden" name="profile_id" value={profile.user_id}>
        <input type="text" name="comment" placeholder="Escribe tu comentario..." class="flex-1 px-3 py-2 rounded-md border border-stone-100 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition" />
        <button class="px-4 py-2 rounded-md bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition">
          Añadir
        </button>
      </form>
    </section>
    {/if} -->

		<!-- Lista de comentarios -->
		<!-- <section class="space-y-3">
      <h2 class="text-xl font-semibold text-emerald-800">Comentarios</h2>
      <div class="grid gap-3">
        {#each comments as comment}
          <div class="bg-white rounded-xl border border-emerald-50 shadow-sm p-3 hover:shadow-md transition">
            <CommentCard {comment} />
          </div>
        {/each}
        {#if comments.length === 0}
          <div class="text-center text-stone-500 py-6 bg-white rounded-lg border border-stone-50">
            No hay comentarios todavía. Sé el primero en escribir uno.
          </div>
        {/if}
      </div>
    </section> -->
	</main>
</div>
