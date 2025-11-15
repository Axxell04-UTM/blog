<script lang="ts">
	import { enhance } from "$app/forms";

    let session = $state(false);
</script>

<div class="flex flex-col border rounded-md py-3 px-4 bg-emerald-300 shadow shadow-black">
    <span class="font-semibold mx-auto">
        Perfil
    </span>
    {#if session}
    <div>
        <span class="font-semibold">
            Nombre de usuario:
        </span>
        <span>
            Axel Lajones
        </span>
    </div>
    <div>
        <span class="font-semibold">
            Cantidad de comentarios:
        </span>
        <span>
            23
        </span>
    </div>
    {:else}
    <form method="POST" action="?/login"  use:enhance={() => {
        // return async ({ result }) => {

        // }
    }}
    class="flex flex-col gap-2"
    >
        <div>
            <span class="font-semibold">
                Nombre de usuario:
            </span>
            <input type="text" class="bg-emerald-50 outline-none rounded-sm">
        </div>
        <div>
            <span class="font-semibold">
                Contraseña:
            </span>
            <input type="text" class="bg-emerald-50 outline-none rounded-sm">
        </div>
        <div class="flex flex-col gap-2 items-center">
            <button  class="bg-emerald-500 px-4 py-1 rounded-md cursor-pointer">
                Iniciar sesión
            </button>
            <button formaction="?/register" class="bg-emerald-600 px-4 py-1 rounded-md cursor-pointer">
                Registrarse
            </button>
        </div>

    </form>
    {/if}
</div>