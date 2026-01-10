import { writable } from "svelte/store";

export const previousPath = writable<string | undefined>(undefined);

export const toastMessage = writable("");