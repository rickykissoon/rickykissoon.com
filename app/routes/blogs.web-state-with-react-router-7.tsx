import { Outlet, redirect, useLoaderData, useLocation } from "react-router";
import { Route } from "./+types/blogs.web-state-with-react-router-7";
import { useEffect, useRef, useState } from "react";
import "highlight.js/styles/github-dark.css";
import { getDb } from "~/utils/db.server";

export async function loader({ params }: Route.LoaderArgs) {
    const db = await getDb();
    const collection = db.collection("blogs");
    const blogHandle = 'web-state-with-react-router-7';
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

    const result: BlogPost = {
        ...(blogPost as any),
        _id: blogPost._id.toString(),
        createdAt: blogPost.createdAt.toISOString(),
        viewCount: count,
    };

    return result;
}

export function meta({ data }: Route.MetaArgs) {
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
    excerpt?: string;
}

export default function Blog() {
    const blogPost = useLoaderData<BlogPost>();
    const location = useLocation();
    const containerRef = useRef<HTMLDivElement | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hljsRef = useRef<any>(null);
    const [hljsReady, setHljsReady] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const hljs = (await import("highlight.js/lib/core")).default;
            const [js, ts, xml] = await Promise.all([
                import("highlight.js/lib/languages/javascript").then(m => m.default),
                import("highlight.js/lib/languages/typescript").then(m => m.default),
                import("highlight.js/lib/languages/xml").then(m => m.default), // HTML/JSX
            ]);
            hljs.registerLanguage("javascript", js);
            hljs.registerLanguage("typescript", ts);
            hljs.registerLanguage("xml", xml);
            if (cancelled) return;
            hljsRef.current = hljs;
            setHljsReady(true);
        })();
    
        return () => { cancelled = true; };
    }, []);

    const highlightAll = () => {
        const root = containerRef.current ?? document;
        const hljs = hljsRef.current;
        if (!hljs) return;
        
        root.querySelectorAll<HTMLElement>("pre code").forEach((el) => {
            if (el.classList.contains("hljs")) return; // already highlighted
            if (!/\blanguage-/.test(el.className)) el.classList.add("language-typescript");
            hljs.highlightElement(el);
        });
    };

    useEffect(() => {
        if (!hljsReady) return;
        requestAnimationFrame(highlightAll);
    }, [hljsReady]);

    useEffect(() => {
        if (!hljsReady) return;
        requestAnimationFrame(() => requestAnimationFrame(highlightAll));
    }, [location.key, hljsReady]);

    return(
        <article className="flex flex-col">
            <header className="">
                <div className="flex flex-col bg-[#290701] border-[#480d02] border-[1px] text-[#ff4f30]">
                    <h1 className="mx-2 text-[32px] md:text-[42px] my-auto">{blogPost.title}</h1>
                </div>
                <div className="flex justify-between my-3 text-xs border-[#480d02] pb-2 border-b-[1px]">
                    <div className="text-[#6e5e5d]">{blogPost.createdAt}</div>
                    <div className="text-[#6e5e5d]">{blogPost.viewCount} view{blogPost.viewCount === 1 ? '' : 's'}</div>
                </div>
            </header>

            <section className="blog-content text-lg mt-3 mb-5">
                <p><i><b>Remix is Dead, Long Live Remix!</b></i></p>
            </section>

            <Outlet />
        </article>
    )
}