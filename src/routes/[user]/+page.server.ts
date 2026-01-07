import type { Profile } from '$lib/interfaces/profile';
import { getUserProfile } from '$lib/server/user';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export { config } from '$lib/server/vercel';

export const load: PageServerLoad = async ({ params }) => {
	console.log(params.user);
	const profile: Profile | null | undefined = await getUserProfile({ username: params.user });
	if (!profile) {
		return redirect(308, '/');
	}
	return {
		profile
	};
};
