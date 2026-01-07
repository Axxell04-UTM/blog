import { getUserNameById } from '$lib/server/user';
import { json, type RequestHandler } from '@sveltejs/kit';

export { config } from '$lib/server/vercel';

export const GET: RequestHandler = async ({ params }) => {
	const userId = params.id;
	if (!userId) {
		return json({ success: false, message: 'Se necesita un ID de usuario' });
	}
	const username = await getUserNameById(userId);
	return json({ succes: true, username });
};
