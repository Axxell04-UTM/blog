import type { Post } from '$lib/interfaces/post';

export interface Profile {
	user_id: string;
	username: string;
	posts: Post[];
}
