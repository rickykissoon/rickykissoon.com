import { LoaderFunction, MetaFunction } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import "highlight.js/styles/github-dark.css";

export const loader: LoaderFunction = async () => {
    // const db = await getDb();
    // const collection = db.collection("blogs");
    // const { blogHandle } = params;
    // const blogPost = await collection.findOne({ slug: blogHandle });
    // const isProd = process.env.ENVIRONMENT === 'production';
    // const isTest = blogPost && blogPost?.tags?.includes('test') || false;

    // if(isProd && isTest) return redirect("/");

    // if (!blogPost) {
    //     throw new Response("Blog post not found", { status: 404 });
    // }

    // const tracking_collection = db.collection("tracking_events");
    // const uniqueUserCount = await tracking_collection.aggregate([
    //     {
    //         $match: {
    //             "eventType": "page_view",
    //             "eventData.url": { $regex: `^/blogs/${blogHandle}$`, $options: "i" }
    //         }
    //     },
    //     {
    //         $group: { _id: "$userId" }
    //     },
    //     {
    //         $count: "uniqueUsers"
    //     }
    // ]).toArray();

    // const count = uniqueUserCount.length > 0 ? uniqueUserCount[0].uniqueUsers : 0;

    return {
        _id: 'aaaabbbbccccccddddd',
        title: 'Handling State In Remix',
        slug: 'handling-state-in-remix',
        content: '',
        tags: ['test', 'code', 'remix'],
        createdAt: '',
        viewCount: 0,
        // ...blogPost,
        // _id: blogPost._id.toString(),
        // createdAt: blogPost.createdAt.toISOString(),
        // viewCount: count
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
            const xml = (await import("highlight.js/lib/languages/xml")).default;
            const json = (await import("highlight.js/lib/languages/json")).default;
            const css = (await import("highlight.js/lib/languages/css")).default;
            const diff = (await import("highlight.js/lib/languages/diff")).default;
            const bash = (await import("highlight.js/lib/languages/bash")).default;
            hljs.registerLanguage("javascript", javascript);
            hljs.registerLanguage("typescript", typescript);
            hljs.registerLanguage("xml", xml);
            hljs.registerLanguage("json", json);
            hljs.registerLanguage("css", css);
            hljs.registerLanguage("diff", diff);
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
                    <h1 className="mx-2 text-[32px] md:text-[42px] my-auto">{blogPost.title}</h1>
                </div>
                <div className="flex justify-between my-3 text-xs border-[#480d02] pb-2 border-b-[1px]">
                    <div className="text-[#6e5e5d]">{blogPost.createdAt}</div>
                    <div className="text-[#6e5e5d]">{blogPost.viewCount} view{blogPost.viewCount === 1 ? '' : 's'}</div>
                </div>
            </header>
            <section className="blog-content text-base" dangerouslySetInnerHTML={{ __html: blogPost.content }} />
            
            <section className="blog-content text-base">
                <p>
                    Although Remix has some similarities to React, there are fundamental differences that change how you would architect an application. React and Next.js are opinionated, 
                    sometimes skip over web fundamentals, and tend to rely on js to accomplish tasks. Whereas Remix not only embraces web fundamentals, but leans into them heavily. To
                    paraphrase Ryan Florence, thinking in terms of Remix is just thinking in terms of web fundamentals.
                </p>
                <br></br>
                <p>    
                    Working in Remix makes you better at web development, not better
                    at a specific framework.
                </p>
                <br></br>
                <p>
                    This web fundamentals paradigm becomes more apparent when you look at how state is handled in Remix. If we prioritize web fundamentals first, then what Remix does by
                    default second, we can get a sort of order of operations for using state in Remix, which is, platform first, then server, then client.
                </p>
                <br></br>
                <p>
                    The following is a rough list of the various methods we can employ to handle state in descending order. On the left is the method, and on the right, how we can accomplish it.
                </p>
                <br></br>
                <table className="w-full text-[12px]">
                    <tbody>
                        <tr>
                            <td className="pl-2 border">URL State</td>
                            <td className="pl-2 border">path and query params</td>
                        </tr>
                        <tr>
                            <td className="pl-2 border">loader{'()'}</td>
                            <td className="pl-2 border">HTTP Request Response, URL routing, SSR HTML</td>
                        </tr>
                        <tr>
                            <td className="pl-2 border">action{'()'}</td>
                            <td className="pl-2 border">HTML Forms, Form Data</td>
                        </tr>
                        <tr>
                            <td className="pl-2 border">Persistent State</td>
                            <td className="pl-2 border">HTTP Cookies, LocalStorage</td>
                        </tr>
                        <tr>
                            <td className="pl-2 border">useFetcher{'()'}</td>
                            <td className="pl-2 border">Fetch API, FormData, background requests</td>
                        </tr>
                        <tr>
                            <td className="pl-2 border">useNavigation{'()'}</td>
                            <td className="pl-2 border">browser navigation lifecycle</td>
                        </tr>
                        <tr>
                            <td className="pl-2 border">Local UI State</td>
                            <td className="pl-2 border">useState{'()'}, useReducer{'()'}</td>
                        </tr>
                        <tr>
                            <td className="pl-2 border">Global State</td>
                            <td className="pl-2 border">context API</td>
                        </tr>
                        <tr>
                            <td className="pl-2 border">defer{'()'}</td>
                            <td className="pl-2 border">HTTP streaming</td>
                        </tr>
                        <tr>
                            <td className="pl-2 border">Caching</td>
                            <td className="pl-2 border">Cache-Control</td>
                        </tr>
                    </tbody>
                </table>
            </section>
            <section className="blog-content text-base mt-14">
                <Outlet />
            </section>
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

