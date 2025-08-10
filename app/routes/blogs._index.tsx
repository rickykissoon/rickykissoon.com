import { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Post } from "~/components/Post";
import { BlogSnippet, listBlogs } from "~/utils/blog.server";
import { getDb } from "~/utils/db.server";

const BLOGS_PER_PAGE = 5;

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;

    const {items: blogs} = await listBlogs({
        select: ["id", "title", "slug", "content", "tags", "createdAt"],
        perPage: BLOGS_PER_PAGE,
        page,
    });

    const db = await getDb();
    const collection = db.collection("blogs");
    const totalBlogs = await collection.countDocuments();

    return {
        blogs,
        page,
        totalPages: Math.ceil(totalBlogs / BLOGS_PER_PAGE),
		isProd: process.env.ENVIRONMENT === 'production'
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
    isProd: boolean;
}

export default function Blogs() {
    const { blogs, page, totalPages } = useLoaderData<BlogsProps>();
    // text-[#6e5e5d]

    return(
        <div className="flex">
            <div className="w-full">
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

                    <div className="flex flex-col mt-3 gap-3">
                        {blogs.length === 0 ? <p>No blogs yet</p> : (
                            blogs.map((blog) => (
                                <BlogPreviewCard key={blog.id} blog={blog} />
                            ))
                        )}
                    </div>

                    <div className="mt-6 flex justify-between">
                        {page > 1 ? (
                            <Link to={`?page=${page - 1}`} className="bg-[#290701] border-[#480d02] border-[1px] px-2 py-[2px] text-[#ff4f30]">Previous</Link>
                        ) : <div />}

                        {page < totalPages ? (
                            <Link to={`?page=${page + 1}`} className="bg-[#290701] border-[#480d02] border-[1px] px-2 py-[2px] text-[#ff4f30]">Next</Link>
                        ) : <div />}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function BlogPreviewCard({blog }: {blog: BlogSnippet}) {
    const { isProd } = useLoaderData<BlogsProps>();
    const { title, slug, tags, content} = blog;
    const isTest = tags?.includes('test');
    const isDisabled = isProd  && isTest;

    const Wrapper: React.ElementType = isDisabled ? "div" : Link;
    const wrapperProps = isDisabled ? {} : { to: `/blogs/${slug}` };

    return(
        <Wrapper {...wrapperProps} className={`${isDisabled && 'cursor-not-allowed text-[#6e5e5d]'}`}>
            <div className={`flex justify-between border-[1px] mt-1 ${isDisabled ? 'text-[#6e5e5d] border-[#6e5e5d]' : 'text-[#ff4f30] bg-[#290701] border-[#480d02]'}`}>
                <div className={`flex justify-center flex-col border-r-[1px] h-[35px] px-2 ${isDisabled ? 'border-[#6e5e5d]' : 'border-[#480d02]' }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
                    </svg>
                </div>
                <div className="mx-2 my-auto">{isTest && '[TEST] '} {title}</div>
                <div className={`flex justify-center flex-col border-l-[1px] h-[35px] px-2 ${isDisabled ? 'border-[#6e5e5d]' : 'border-[#480d02]' }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
                    </svg>
                </div>
            </div>
            <div className="border-[1px] border-t-0 border-[#6e5e5d] font-extralight text-sm px-3 py-3 rounded-br-md">
                {getSnippet(content || "")}
            </div>
        </Wrapper>
    );
}