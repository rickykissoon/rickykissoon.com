import { LoaderFunction, MetaFunction } from "@remix-run/node";
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

    console.log(`/blogs/${blogHandle}`);

    const tracking_collection = db.collection("tracking_events");
    const uniqueUserCount = await tracking_collection.aggregate([
        {
            $match: {
                "eventType": "page_view",
                "eventData.url": { $regex: `^/blogs/${blogHandle}$`, $options: "i" }
            }
        },
        {
            $group: { _id: "$userId" }
        },
        {
            $count: "uniqueUsers"
        }
    ]).toArray();

    const count = uniqueUserCount.length > 0 ? uniqueUserCount[0].uniqueUsers : 0;

    return {
        ...blogPost,
        _id: blogPost._id.toString(),
        createdAt: blogPost.createdAt.toISOString(),
        viewCount: count
    };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    if (!data) {
        return [
            { title: "Blog Not Found" },
            { name: "robots", content: "noindex" }
        ];
    }

    return [
        { title: data.title },
        { name: "description", content: data.excerpt || data.content?.slice(0, 150) || "Blog post on site" },
        { property: "og:title", content: data.title },
        { property: "og:description", content: data.excerpt || data.content?.slice(0, 150) },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `https://rickykissoon.com/blogs/${data.slug}` },
    ];
}

interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    content: string;
    tags: string[];
    createdAt: string;
    viewCount: number;
}

export default function Blog() {
    const blogPost = useLoaderData<BlogPost>();

    console.log(blogPost);

    return(
		<article className="flex flex-col w-full">
			<header className="m-3 lg:mx-10">
                <div className="flex flex-col bg-[#290701] border-[#480d02] border-[1px] mt-1 text-[#ff4f30]">
                    <h1 className="mx-2 text-[32px] md:text-[64px] my-auto">{blogPost.title}</h1>
                </div>
                <div className="flex justify-between my-3 text-xs border-[#480d02] pb-2 border-b-[1px]">
                    <div className="text-[#6e5e5d]">{blogPost.createdAt}</div>
                    <div className="text-[#6e5e5d]">{blogPost.viewCount} view{blogPost.viewCount === 1 ? '' : 's'}</div>
                </div>
            </header>
            <section className="mx-3 lg:mx-10 text-base" dangerouslySetInnerHTML={{ __html: blogPost.content }} />
            <section className="mt-3">
                {blogPost.tags && blogPost.tags.map((tag, index) => (
                    <div key={index}>{tag}</div>
                ))}
            </section>
        </article>
    );
}