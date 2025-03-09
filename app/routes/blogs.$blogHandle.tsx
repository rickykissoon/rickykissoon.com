import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getDb } from "~/utils/db.server";

export const loader: LoaderFunction = async ({ params }) => {
    const db = await getDb();
    const collection = db.collection("blogs");

    const { blogHandle } = params;
    const blogPost = await collection.findOne({ slug: blogHandle });

    if (!blogPost) {
        throw new Response("Blog post not found", { status: 404 });
    }

    return {
        ...blogPost,
        _id: blogPost._id.toString(),
        createdAt: blogPost.createdAt.toISOString(),
    };
}

interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    content: string;
    createdAt: string;
}

export default function Blog() {
    const blogPost = useLoaderData<BlogPost>();

    return(
		<div className="flex w-full">
			<div className="m-3 lg:mx-10 w-full">
                <div className="flex bg-[#290701] border-[#480d02] border-[1px] mt-1 text-[#ff4f30]">
                    <div className="flex justify-center flex-col border-r-[1px] h-[35px] border-[#480d02] px-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
                        </svg>
                    </div>
                    <h1 className="mx-2 my-auto">{blogPost.title}</h1>
                </div>
                <div className="my-3 text-sm text-purple-500 font-thin">{blogPost.createdAt}</div>
                <div>{blogPost.content}</div>
            </div>
        </div>
    );
}