import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import * as auth from '$lib/server/auth'
import * as table from '$lib/server/db/schema'
import { eq } from "drizzle-orm";
import { verify } from "@node-rs/argon2";
import { createUser } from "$lib/server/user";
import type { Profile } from "$lib/interfaces/profile";
import { createComment, getComments } from "$lib/server/comment";

export const load: PageServerLoad = async ({ locals }) => {
    const comments = await getComments();
    if (!locals.user) {
        return {
            comments
        }
    }

    const profile: Profile = {
        user_id: locals.user.id,
        username: locals.user.username,
        comments: 0
    }


    return {
        profile,
        comments
    }
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

        const profile: Profile = {
            user_id: existingUser.id,
            username: existingUser.username,
            comments: 0
        }

        return {
            profile
        }

        // return redirect(302, '/admin')

    },
    register: async (event) => {
        const formData = await event.request.formData();
        const username = formData.get('username');
        const password = formData.get('password');        

        if (!validateUsername(username)) {
            return fail(400, { message: 'Username inválido' })
        }
        if (!validatePassword(password)) {
            return fail(400, { message: 'Contraseña inválida' })
        }
        
        try {
            await createUser(username, password);
            
        } catch (error) {
            console.log(error)
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

        const profile: Profile = {
            user_id: existingUser.id,
            username: existingUser.username,
            comments: 0
        }

        return {
            profile
        }
        
    },
    logout: async (event) => {
        if (!event.locals.session) {
            return fail(401);
        }
        await auth.invalidateSession(event.locals.session.id);
        auth.deleteSessionTokenCookie(event);
    },
    send_comment: async (event) => {
        const formData = await event.request.formData();
        const profileId = formData.get("profile_id");
        const comment = formData.get("comment");

        if (!validateProfileId(profileId)) {
            return fail(401, { message: "Id de perfil incorrecto" });
        }
        if (!validateComment(comment)) {
            return fail(401, { message: 'Comentario no válido' });
        }

        try {
            await createComment(profileId, comment);
            const comments = await getComments();
            return {
                comments
            }
        } catch {
            return fail(500, { message: "A ocurrido un error en el servidor" });
        }

    }

}

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

function validateComment (comment: unknown): comment is string {
    return typeof comment === 'string';
}

function validateProfileId (profileId: unknown): profileId is string {
    return typeof profileId === 'string';
}
