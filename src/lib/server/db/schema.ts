import { pgTable, integer, text, timestamp } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});


export const post = pgTable('post', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	title: text('title').notNull(),
	content: text('content').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull()	
});

export const comment = pgTable('comment', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	postId: text('post_id')
		.notNull()
		.references(() => post.id),
	text: text('text').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;

export type Post = typeof post.$inferInsert;

export type Comment = typeof comment.$inferInsert;