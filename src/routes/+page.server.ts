import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as auth from '$lib/server/auth';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { verify } from '@node-rs/argon2';
import { createUser } from '$lib/server/user';
import type { Profile } from '$lib/interfaces/profile';
import { createComment, getComments } from '$lib/server/comment';
import { createPost, deletePost, getPosts, getPostsByUserId, updatePost } from '$lib/server/post';

export const load: PageServerLoad = async ({ locals }) => {
	const posts = await getPosts();
	if (!locals.user) {
		return {
			posts
		};
	}

	const myPosts = await getPostsByUserId(locals.user.id);
	const profile: Profile = {
		user_id: locals.user.id,
		username: locals.user.username,
		posts: myPosts
	};

	return {
		profile,
		posts
	};
};

export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!validateUsername(username)) {
			return fail(400, {
				message: 'Username inválido'
			});
		}

		if (!validatePassword(password)) {
			return fail(400, {
				message: 'Contraseña inválida'
			});
		}

		const results = await db.select().from(table.user).where(eq(table.user.username, username));

		const existingUser = results.at(0);
		if (!existingUser) {
			return fail(400, {
				message: 'El usuario no existe'
			});
		}

		const validPassword = await verify(existingUser.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		if (!validPassword) {
			return fail(400, {
				message: 'Contraseña incorrecta'
			});
		}

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		const myPosts = await getPostsByUserId(existingUser.id);
		const profile: Profile = {
			user_id: existingUser.id,
			username: existingUser.username,
			posts: myPosts
		};

		return {
			profile
		};

		// return redirect(302, '/admin')
	},
	register: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!validateUsername(username)) {
			return fail(400, { message: 'Username inválido' });
		}
		if (!validatePassword(password)) {
			return fail(400, { message: 'Contraseña inválida' });
		}

		try {
			await createUser(username, password);
		} catch (error) {
			console.log(error);
			return fail(500, { message: 'A ocurrido un error en el servidor' });
		}

		const results = await db.select().from(table.user).where(eq(table.user.username, username));

		const existingUser = results.at(0);
		if (!existingUser) {
			return fail(400, {
				message: 'El usuario no existe'
			});
		}

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		const myPosts = await getPostsByUserId(existingUser.id);
		const profile: Profile = {
			user_id: existingUser.id,
			username: existingUser.username,
			posts: myPosts
		};

		return {
			profile
		};
	},
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);
	},
	create_post: async (event) => {
		const formData = await event.request.formData();
		const profileId = formData.get('profile_id');
		const title = formData.get('title');
		const content = formData.get('content');
		if (!validateProfileId(profileId)) {
			return fail(401, { message: 'Id de perfil incorrecto' });
		}
		if (!validateTitle(title)) {
			return fail(401, { message: 'Titulo no válido' });
		}
		if (!validateContent(content)) {
			return fail(401, { message: 'Contenido no válido' });
		}

		try {
			const postId = await createPost(profileId, title, content);
			const posts = await getPosts();
			const myPosts = await getPostsByUserId(profileId);
			return {
				postId,
				posts,
				myPosts
			};
		} catch {
			return fail(500, { message: 'A ocurrido un error en el servidor' });
		}
	},
	update_post: async (event) => {
		const formData = await event.request.formData();
		const profileId = formData.get('profile_id');
		const postId = formData.get('post_id') as string;
		const newTitle = formData.get('new_title') as string;
		const newContent = formData.get("new_content") as string;
		if (!validateProfileId(profileId)) {
			return fail(401, { message: 'Id de perfil incorrecto' });
		}
		await updatePost(postId, newTitle, newContent);
		const posts = await getPosts();
		const myPosts = await getPostsByUserId(profileId);

		return {
			posts,
			myPosts
		}
	},
	delete_post: async (event) => {
		const formData = await event.request.formData();
		const postId = formData.get('post_id') as string;
		const profileId = formData.get('profile_id');
		if (!validateProfileId(profileId)) {
			return fail(401, { message: 'Id de perfil incorrecto' });
		}

		await deletePost(postId);
		const posts = await getPosts();
		const myPosts = await getPostsByUserId(profileId);

		return {
			posts,
			myPosts
		}
		
	},
	send_comment: async (event) => {
		const formData = await event.request.formData();
		const profileId = formData.get('profile_id');
		const postId = formData.get('post_id');
		const comment = formData.get('comment');

		if (!validateProfileId(profileId)) {
			return fail(401, { message: 'Id de perfil incorrecto' });
		}
		if (!validatePostId(postId)) {
			return fail(401, { message: 'Id de post incorrecto' });
		}
		if (!validateComment(comment)) {
			return fail(401, { message: 'Comentario no válido' });
		}

		try {
			await createComment(profileId, postId, comment);
			const comments = await getComments();
			return {
				comments
			};
		} catch {
			return fail(500, { message: 'A ocurrido un error en el servidor' });
		}
	}
};

// INPUT VALIDATIONS

function validateUsername(username: unknown): username is string {
	return (
		typeof username === 'string' &&
		username.length >= 3 &&
		username.length <= 31 &&
		/^[a-zA-Z0-9_-]+$/.test(username)
	);
}

function validatePassword(password: unknown): password is string {
	return typeof password === 'string' && password.length >= 6 && password.length <= 255;
}

function validateComment(comment: unknown): comment is string {
	return typeof comment === 'string';
}

function validateProfileId(profileId: unknown): profileId is string {
	return typeof profileId === 'string';
}

function validatePostId(postId: unknown): postId is string {
	return typeof postId === 'string';
}

function validateTitle(title: unknown): title is string {
	return typeof title === 'string';
}

function validateContent(content: unknown): content is string {
	return typeof content === 'string';
}
