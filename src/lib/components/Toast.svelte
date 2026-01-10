<script lang="ts">
	import { toastMessage } from "$lib/stores";
	import { scale, slide } from "svelte/transition";

    $effect(() =>{
        if ($toastMessage) {
            setTimeout(() => {
                $toastMessage = "";
            }, 3000);
        }
    })

</script>

{#if $toastMessage}
<div transition:slide={{ axis: "y" }} class="fixed w-full flex justify-center mt-3 z-10 py-3">
    <div class="bg-emerald-50/70 backdrop-blur-2xl ring-2 ring-emerald-400 px-3 py-2 rounded-md">
        <p class="text-emerald-900 font-semibold text-xl">
            {$toastMessage}
        </p>
    </div>
</div>    
{/if}