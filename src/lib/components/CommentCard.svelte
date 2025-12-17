<script lang="ts">
	import type { Comment } from '$lib/interfaces/comment';

	interface Props {
		comment: Comment;
	}

	let { comment }: Props = $props();
	let username = $state('Anónimo');
</script>

<div class="flex flex-col rounded-md bg-emerald-300 px-4 py-2 shadow shadow-black">
	<div>
		<span class="text-stone-900">
			{comment.text}
		</span>
	</div>
	<div class="flex flex-col justify-between text-sm">
		<span class="font-semibold text-stone-700">
			{username}
		</span>
		<span class="text-stone-600">
			{comment.createdAt}
		</span>
	</div>
</div>
