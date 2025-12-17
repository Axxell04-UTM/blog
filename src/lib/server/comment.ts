import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { encodeBase32LowerCase } from '@oslojs/encoding';

export async function getComments() {
	try {
		const comments = await db.select().from(table.comment);
		return comments;
	} catch (e) {
		console.error('Error al realizar la consulta: ' + e);
		return [];
	}
}

export async function createComment(userId: string, postId: string, comment: string) {
	try {
		const newComment: table.Comment = {
			id: generateId(),
			userId: userId,
			postId: postId,
			text: comment,
			createdAt: new Date(Date.now())
		};
		await db.insert(table.comment).values(newComment).execute();
	} catch {
		console.error('Error al crear el comentario');
	}
}

function generateId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}
