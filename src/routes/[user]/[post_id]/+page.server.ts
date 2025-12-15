import { getPostById } from "$lib/server/post";
import { getUserNameById } from "$lib/server/user";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
    const post_id = params.post_id;
    const post = await getPostById(post_id);
    if (!post) {
        return redirect(308, "/");
    }

    const username = await getUserNameById(post.userId)

    return {
        post,
        username
    }
};