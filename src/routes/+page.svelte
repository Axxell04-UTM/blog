<script lang="ts">
    import { enhance } from "$app/forms";
    import CommentCard from "$lib/components/CommentCard.svelte";
    import type { Profile } from "$lib/interfaces/profile";
    import SectionPerfil from "$lib/sections/SectionPerfil.svelte";
    import { scale } from "svelte/transition";
    import type { PageProps } from "./$types";
    import type { Comment } from "$lib/interfaces/comment";
    let session = false;

    let { data }: PageProps = $props();
    let profile: Profile | undefined = $state(data.profile);
    let comments: Comment[] = $state(data.comments || []);
    
    let resMessage = $state("");

    function setResMessage (message: string) {
        resMessage = message;
        setTimeout(() => {
            resMessage = "";
        }, 2000)
    }

    function setComments (list: Comment[]) {
        comments = list;
    }

</script>

<div class="min-h-screen flex items-start justify-center bg-linear-to-b from-emerald-50 to-white py-8 px-4">
  <main class="w-full max-w-3xl space-y-6">
    <header class="text-center">
      <h1 class="text-3xl font-extrabold text-emerald-700">Mi Foro Version B</h1>
      <p class="mt-1 text-sm text-emerald-600/80">Comparte ideas, comenta y participa</p>
    </header>

    <!-- Perfil -->
    <section class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-emerald-100 p-5 flex flex-col gap-4">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-200 text-emerald-800 font-bold text-xl">
          {#if profile}
            {profile.username?.charAt(0).toUpperCase()}
          {:else}
            U
          {/if}
        </div>
        <div class="flex-1">
          <div class="flex items-baseline justify-between gap-3">
            <h2 class="text-lg font-semibold text-emerald-900">{profile ? profile.username : 'Invitado'}</h2>
            {#if profile}
              <span class="text-sm text-emerald-700/90">Activo</span>
            {/if}
          </div>
          <p class="text-xs text-stone-500 mt-1">Bienvenido al foro — participa con respeto.</p>
        </div>
      </div>

      {#if profile}
      <form method="POST" action="?/logout" use:enhance={() => {
          return async ({ result }) => {
              if (result.type === "success") {
                  profile = undefined;
              }
          }
      }}
        class="mt-2 flex items-center justify-end"
      >
        <button class="px-3 py-1.5 rounded-md bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-shadow shadow-sm">
          Cerrar sesión
        </button>
      </form>
      {:else}
      <form method="POST" action="?/login" class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end" use:enhance={() => {
          return async ({ result }) => {
              if (result.type === "success") {
                  console.log(result.data)
                  profile = result.data?.profile as Profile;
              } else if (result.type === "failure") {
                  console.log(result.data)
                  setResMessage(result.data?.message as string);
              }
          }
      }}
      >
        <div class="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col">
            <label for="username" class="text-xs text-stone-600 mb-1">Nombre de usuario</label>
            <input type="text" name="username" placeholder="usuario" class="px-3 py-2 rounded-md border border-emerald-100 bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition" />
          </div>
          <div class="flex flex-col">
            <label for="password" class="text-xs text-stone-600 mb-1">Contraseña</label>
            <input type="password" name="password" placeholder="••••••" class="px-3 py-2 rounded-md border border-emerald-100 bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition" />
          </div>
        </div>

        <div class="flex gap-2 justify-end col-span-1 sm:col-span-2">
          <button type="submit" class="px-4 py-2 rounded-md bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition">Iniciar sesión</button>
          <button formaction="?/register" class="px-4 py-2 rounded-md bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition">Registrarse</button>
        </div>

        {#if resMessage}
        <div transition:scale class="col-span-1 sm:col-span-2 text-center text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {resMessage}
        </div>
        {/if}
      </form>
      {/if}
    </section>

    <!-- Crear comentario -->
    {#if profile}
    <section class="bg-white/80 rounded-2xl shadow-sm border border-emerald-50 p-4">
      <form method="POST" action="?/send_comment" use:enhance={() => {
          return async ({ result }) => {
              if (result.type === "success") {
                  setComments(result.data?.comments as Comment[]);
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
    {/if}

    <!-- Lista de comentarios -->
    <section class="space-y-3">
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
    </section>
  </main>
</div>