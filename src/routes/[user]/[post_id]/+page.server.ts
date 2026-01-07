import { getPostById } from '$lib/server/post';
import { getUserNameById } from '$lib/server/user';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPostsByUserId } from '$lib/server/post';
import type { Profile } from '$lib/interfaces/profile';

export const load: PageServerLoad = async ({ params, locals }) => {
	const post_id = params.post_id;
	const post = await getPostById(post_id);
	if (!post) {
		return redirect(308, '/');
	}
	
	const username = await getUserNameById(post.userId);
	if (!locals.user) {
		return {
			post,
			username
		};
	}

	const myPosts = await getPostsByUserId(locals.user.id);
	const profile: Profile = {
		user_id: locals.user.id,
		username: locals.user.username,
		posts: myPosts
	};

	return {
		post,
		username,
		profile
	};
};
