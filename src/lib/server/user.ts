import { db } from '$lib/server/db'
import * as table from '$lib/server/db/schema'
import { hash } from '@node-rs/argon2';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { eq } from 'drizzle-orm';
import { getPostsOfUser } from './post';

export async function createUser(username: string, password: string) {

    const userId = generateId();
    const passwordHash = await hash(password, {
        // recommended minimum parameters
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
    });

    try {
        await db.insert(table.user).values({ id: userId, username, passwordHash }).execute();
    } catch (e) {
        console.error('An error occurred while creating the account:', e);
    }
}

export async function getUsers () {
    const users = await db.select({id: table.user.id, username: table.user.username}).from(table.user).execute();

    return users;
}

export async function getUserNameById (id: string) {
    const [user] = await db.select().from(table.user).where(eq(table.user.id, id));
    if (user) {
        return user.username
    }
    return "Anónimo"
}


type getUserProfileOptions = {
    id?: string
    username?: string
}
export async function getUserProfile (options: getUserProfileOptions) {
    const { id, username } = options;
    console.log(username)
    if (id || username) {
        try {
            const [user] = await db.select({ id: table.user.id, username: table.user.username }).from(table.user).where(id ? eq(table.user.id, id) : eq(table.user.username, username as string));
            console.log(user);
            const posts = await getPostsOfUser(user.id);
            const profile = {
                user_id: user.id,
                username: user.username,
                posts
            }
            return profile;
        } catch (e) {
            console.error("Error al realizar la consulta: " + e);
            return null;
        }
    }
}

getUserProfile({})

export async function deleteUser (id: string) {
    await db.delete(table.session).where(eq(table.session.userId, id)).execute();
    await db.delete(table.user).where(eq(table.user.id, id)).execute();
}

function generateId() {
    // ID with 120 bits of entropy, or about the same as UUID v4.
    const bytes = crypto.getRandomValues(new Uint8Array(15));
    const id = encodeBase32LowerCase(bytes);
    return id;
}