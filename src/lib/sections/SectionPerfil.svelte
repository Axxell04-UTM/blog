<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Profile } from '$lib/interfaces/profile';
	import { scale } from 'svelte/transition';

	interface Props {
		profile: Profile | undefined;
		resMessage: string;
		setResMessage: (newMessage: string) => void;
		setProfile: (newProfile: Profile | undefined) => void;
	}

	let { profile, resMessage, setResMessage, setProfile }: Props = $props();
</script>

<section
	class="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-white/80 p-5 shadow-md backdrop-blur-sm"
>
	<div class="flex items-center gap-4">
		<div
			class="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-200 text-xl font-bold text-emerald-800"
		>
			{#if profile}
				{profile.username?.charAt(0).toUpperCase()}
			{:else}
				U
			{/if}
		</div>
		<div class="flex-1">
			<div class="flex items-baseline justify-between gap-3">
				<h2 class="text-lg font-semibold text-emerald-900">
					{profile ? profile.username : 'Invitado'}
				</h2>
				{#if profile}
					<span class="text-sm text-emerald-700/90">Activo</span>
				{/if}
			</div>
			<p class="mt-1 text-xs text-stone-500">Bienvenido a Mi blog — participa con respeto.</p>
		</div>
	</div>

	{#if profile}
		<form
			method="POST"
			action="?/logout"
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						setProfile(undefined);
					}
				};
			}}
			class="mt-2 flex items-center justify-end"
		>
			<button
				class="rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-shadow hover:bg-emerald-600"
			>
				Cerrar sesión
			</button>
		</form>
	{:else}
		<form
			method="POST"
			action="?/login"
			class="grid grid-cols-1 items-end gap-3 sm:grid-cols-2"
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						console.log(result.data);
						setProfile(result.data?.profile as Profile);
					} else if (result.type === 'failure') {
						console.log(result.data);
						setResMessage(result.data?.message as string);
					}
				};
			}}
		>
			<div class="col-span-1 grid grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-2">
				<div class="flex flex-col">
					<label for="username" class="mb-1 text-xs text-stone-600">Nombre de usuario</label>
					<input
						type="text"
						name="username"
						placeholder="usuario"
						class="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 transition focus:ring-2 focus:ring-emerald-300 focus:outline-none"
					/>
				</div>
				<div class="flex flex-col">
					<label for="password" class="mb-1 text-xs text-stone-600">Contraseña</label>
					<input
						type="password"
						name="password"
						placeholder="••••••"
						class="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 transition focus:ring-2 focus:ring-emerald-300 focus:outline-none"
					/>
				</div>
			</div>

			<div class="col-span-1 flex justify-end gap-2 sm:col-span-2">
				<button
					type="submit"
					class="rounded-md bg-emerald-500 px-4 py-2 font-semibold text-white transition hover:bg-emerald-600"
					>Iniciar sesión</button
				>
				<button
					formaction="?/register"
					class="rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white transition hover:bg-emerald-800"
					>Registrarse</button
				>
			</div>

			{#if resMessage}
				<div
					transition:scale
					class="col-span-1 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-center text-sm text-red-700 sm:col-span-2"
				>
					{resMessage}
				</div>
			{/if}
		</form>
	{/if}
</section>
