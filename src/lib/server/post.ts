import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { desc, eq } from 'drizzle-orm';

export async function getPosts () {
    try {
        const posts = await db.select().from(table.post).orderBy(desc(table.post.createdAt));
        return posts;
    } catch (e) {
        console.error("Error al realizar la consulta: "+ e);
        return [];
    }
}

export async function getPostById (id: string) {
    try {
        const [post] = await db.select().from(table.post).where(eq(table.post.id, id));
        return post;
    } catch (e) {
        console.error("Error al realizar la consulta: " + e);
        return null;
    }
}

export async function getPostsOfUser (id: string) {
    try {
        const posts = await db.select().from(table.post).where(eq(table.post.userId, id)).orderBy(desc(table.post.createdAt));
        return posts;
    } catch (e) {
        console.error("Error al realizar la consulta: "+ e);
        return [];
    }
}

export async function getPostsByUserId (userId: string) {
    try {
        const posts = await db.select().from(table.post).where(eq(table.post.userId, userId));
        return posts;
    } catch (e) {
        console.error("Error al realizar la consulta: "+ e);
        return [];
    }
}

export async function createPost (userId: string, title: string, content: string) {
    try {
        const postId = generateId();
        const newPost: table.Post = {
            id: postId,
            userId: userId,
            title: title,
            content: content,
            createdAt: new Date(Date.now())
        }
        await db.insert(table.post).values(newPost).execute();
        return postId;
    } catch {
        console.error("Error al crear el post");
    }
}

function generateId() {
    // ID with 120 bits of entropy, or about the same as UUID v4.
    const bytes = crypto.getRandomValues(new Uint8Array(15));
    const id = encodeBase32LowerCase(bytes);
    return id;
}