import { isRouteErrorResponse, Links, LoaderFunction, Meta, Scripts, ScrollRestoration, useRouteError } from "react-router";
import { Link, Outlet, useLoaderData, useLocation } from "react-router";
import Menu from "~/components/Menu";
import { Post } from "~/components/Post";
import { BlogSnippet, listBlogs } from "~/utils/blog.server";

export const loader: LoaderFunction = async ({ request }) => {
    const {items: blogs} = await listBlogs({
        select: ["id", "title", "slug", "content", "tags", "createdAt"],
    });

    return {
        blogs,
		isProd: process.env.ENVIRONMENT === 'production'
    };
}

interface BlogTemplateLoader {
    blogs: BlogSnippet[];
    isProd: boolean;
}

export default function BlogsTemplate() {
    const {blogs, isProd} = useLoaderData<BlogTemplateLoader>();
    const location = useLocation();

    return(
		<article className="flex gap-2 m-3 lg:mx-10">
            <div className="hidden md:flex flex-col gap-2">
                <div className="w-[175px] border-[#480d02] border-[1px] text-[#ff4f30]">
                    <Link to="/">
                        <div className="text-center text-[10px] py-2 underline">rickykissoon.com/</div>
                    </Link>
                </div>
                {location.pathname !== "/blogs" && (
                    <div className="w-[175px] border-[#480d02] border-[1px] text-[#ff4f30]">
                        <Link to="/blogs">
                            <div className="text-center text-[10px] py-2 underline">/blogs</div>
                        </Link>
                    </div>
                )}
                <SideMenuCard name="blogs" items={blogs.map((b) => ({to: b.slug, label: b.title, disabled: (b.tags?.includes('test') && isProd) || false })) ?? []} basePath="/blogs/" />
                {/* {location.pathname === "/blogs" && (
                    <SideMenuCard name="filters" items={[
                        { to: "?tag=filter", label: "filter" }
                    ]} />
                )} */}
            </div>
            <div className="flex-1 min-w-0">
                <Outlet />
            </div>
        </article>
    );
}

export type SideMenuItem = {
    to: string;
    label: string;
    disabled?: boolean;
}

export interface SideMenuCardProps {
    name: string;
    items: SideMenuItem[];
    basePath?: string;
}

export function SideMenuCard({name, items, basePath}: SideMenuCardProps) {
    const { pathname } = useLocation();

    return(
        <div className="w-[175px] border-[#480d02] border-[1px] text-[#ff4f30]">
            <div className="flex flex-col text-[11px]">
                <div className="py-1 text-center text-[10px] bg-[#480d02]">{name}</div>
                <div className="flex flex-col gap-2 ml-2 my-2">
                    {items.length > 0 && items.map(({to, label, disabled}, index) => {
                        const href = basePath ? `${basePath}${to}` : to
                        const isActive = pathname === href;

                        if (isActive || disabled) {
                            return <div key={index} className="text-[#6e5e5d]">{label}</div>
                        } else {
                            return (
                                <Link key={index} to={to} className="underline text-ellipsis">{label}</Link>
                            );
                        }
                    })}
                </div>
            </div>
        </div>
    );
}