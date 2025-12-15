<script lang="ts">
	import Icon from "@iconify/svelte";
    
    function goBack () {
        history.back();
    }
</script>

<button class="flex flex-row gap-2 p-2 items-center rounded-xl ring-1 ring-transparent transition duration-500 text-emerald-600 cursor-pointer hover:ring-emerald-600"
onclick={goBack}
>
    <Icon icon="weui:back-filled" width="12" height="24" />
    Regresar
</button>