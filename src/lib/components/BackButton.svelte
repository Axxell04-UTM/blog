<script lang="ts">
	import { goto } from '$app/navigation';
	import { previousPath } from '$lib/stores';
	import Icon from '@iconify/svelte';
	

	function goBack() {
		if ($previousPath) {
			goto($previousPath)
		}
	}
</script>

<button
	class="flex cursor-pointer flex-row items-center gap-2 rounded-xl p-2 text-emerald-600 ring-1 ring-transparent transition duration-500 hover:ring-emerald-600"
	onclick={goBack}
>
	<Icon icon="weui:back-filled" width="12" height="24" />
	Regresar
</button>
