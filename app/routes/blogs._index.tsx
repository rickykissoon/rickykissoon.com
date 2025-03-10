import { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Post } from "~/components/Post";
import { getDb } from "~/utils/db.server";

const BLOGS_PER_PAGE = 5;

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;

    const db = await getDb();
    const collection = db.collection("blogs");
    const totalBlogs = await collection.countDocuments();
    const blogs = await collection
        .find({})
        .sort({ createdAt: -1 })
        .skip((page - 1) * BLOGS_PER_PAGE)
        .limit(BLOGS_PER_PAGE)
        .toArray();

    return {
        blogs: blogs.map((blog) => ({
            _id: blog._id.toString(),
            title: blog.title,
            slug: blog.slug,
            snippet: getSnippet(blog.content),
            createdAt: blog.createdAt.toISOString(),
        })),
        page,
        totalPages: Math.ceil(totalBlogs / BLOGS_PER_PAGE)
    };
}

function getSnippet(htmlContent: string, length: number = 100): string {
    if (!htmlContent) return "";

    const match = htmlContent.match(/<p>(.*?)<\/p>/i);
    const firstParagraph = match ? match[1].replace(/<\/?[^>]+(>|$)/g, "").trim() : "";

    return firstParagraph.length > length
        ? firstParagraph.substring(0, length) + "..."
        : firstParagraph;
}

interface BlogsProps {
    blogs: BlogSnippet[];
    page: number;
    totalPages: number;
}

interface BlogSnippet {
    _id: string;
    title: string;
    slug: string;
    snippet: string;
    createdAt: string;
}

export default function Blogs() {
    const { blogs, page, totalPages } = useLoaderData<BlogsProps>();

    return(
        <div className="flex w-full">
            <div className="m-3 lg:mx-10 w-full">
                <div className="max-w-[700px]">
                    <Post
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                        } 
                        title={<div>Blogs</div>} 
                        body={<div>Musings, experiments...</div>} 
                    />

                    <div className="flex flex-col justify-center w-full text-[#480d02] mb-4">
                        <div className="mx-auto h-4">.</div>
                        <div className="mx-auto h-4">.</div>
                        <div className="mx-auto h-4">.</div>
                    </div>

                    <div className="mt-3 gap-3">
                        {blogs.length === 0 ? <p>No blogs yet</p> : (
                            blogs.map((blog) => (
                                <BlogSnippet key={blog._id} title={blog.title} handle={blog.slug} snippet={blog.snippet} />
                            ))
                        )}
                    </div>

                    <div className="mt-6 flex justify-between">
                        {page > 1 ? (
                            <Link to={`?page=${page - 1}`} className="bg-gray-300 px-4 py-2 rounded">Previous</Link>
                        ) : <div />}

                        {page < totalPages ? (
                            <Link to={`?page=${page + 1}`} className="bg-gray-300 px-4 py-2 rounded">Next</Link>
                        ) : <div />}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function BlogSnippet({title, handle, snippet}: {title: string, handle: string, snippet: string}) {
    return(
        <>
            <div className="flex justify-between bg-[#290701] border-[#480d02] border-[1px] mt-1 text-[#ff4f30]">
                <div className="flex justify-center flex-col border-r-[1px] h-[35px] border-[#480d02] px-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
                    </svg>
                </div>
                <div className="mx-2 my-auto">{title}</div>
                <div className="flex justify-center flex-col border-l-[1px] h-[35px] border-[#480d02] px-2">
                    <Link to={`/blogs/${handle}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
                        </svg>
                    </Link>
                </div>
            </div>
            <div className="border-[1px] border-t-0 border-[#6e5e5d] font-extralight text-sm px-3 py-3 rounded-br-md">
                {snippet}
            </div>
        </>
    );
}