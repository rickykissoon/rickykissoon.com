import { LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getDb } from "~/utils/db.server";
import { useEffect } from "react";
import "highlight.js/styles/github-dark.css";

export const loader: LoaderFunction = async ({ params }) => {
    const db = await getDb();
    const collection = db.collection("blogs");
    const { blogHandle } = params;
    const blogPost = await collection.findOne({ slug: blogHandle });
    const isProd = process.env.ENVIRONMENT === 'production';
    const isTest = blogPost && blogPost?.tags?.includes('test') || false;

    if(isProd && isTest) return redirect("/");

    if (!blogPost) {
        throw new Response("Blog post not found", { status: 404 });
    }

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

    useEffect(() => {
        (async () => {
            const hljs = (await import("highlight.js/lib/core")).default;
            const javascript = (await import("highlight.js/lib/languages/javascript")).default;
            const typescript = (await import("highlight.js/lib/languages/typescript")).default;
            const bash = (await import("highlight.js/lib/languages/bash")).default; // example extra
            hljs.registerLanguage("javascript", javascript);
            hljs.registerLanguage("typescript", typescript);
            hljs.registerLanguage("bash", bash);
  
            document.querySelectorAll('pre code:not([class*="language-"])')
                .forEach((el) => el.classList.add("language-javascript"));
  
            document.querySelectorAll<HTMLElement>("article pre code")
                .forEach((block) => hljs.highlightElement(block));
        })();
    }, []);

    return(
		<article className="flex flex-col">
			<header className="">
                <div className="flex flex-col bg-[#290701] border-[#480d02] border-[1px] text-[#ff4f30]">
                    <h1 className="mx-2 text-[32px] md:text-[64px] my-auto">{blogPost.title}</h1>
                </div>
                <div className="flex justify-between my-3 text-xs border-[#480d02] pb-2 border-b-[1px]">
                    <div className="text-[#6e5e5d]">{blogPost.createdAt}</div>
                    <div className="text-[#6e5e5d]">{blogPost.viewCount} view{blogPost.viewCount === 1 ? '' : 's'}</div>
                </div>
            </header>
            <section className="text-base" dangerouslySetInnerHTML={{ __html: blogPost.content }} />
            <section className="flex justify-center text-[#ff4f30] mt-5 text-[10px]">***</section>
            {blogPost?.tags && (
                <section className="flex flex-col gap-2 mt-5">
                    <div className="w-full border-t border-[#480d02]" />
                    <div className="flex gap-2">
                        {blogPost.tags.map((tag, index) => (
                            <div key={index} className="bg-[#290701] border-[#480d02] border-[1px] px-2 py-[2px] text-[#ff4f30]">{tag}</div>
                        ))}
                    </div>
                </section>
            )}
        </article>
    );
}