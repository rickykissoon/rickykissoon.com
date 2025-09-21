import { useMemo } from "react";
import { Outlet, useLocation } from "react-router";

export default function UrlLayout() {
    const { pathname, search, hash } = useLocation();
    const fullpath = useMemo(() => `${pathname}${search}${hash}`, [pathname, search, hash]);

    return (
        <section className="blog-content text-base">
            <div className="font-semibold text-[#6e5e5d]">{decodeURI(fullpath)}</div>
            <div className="mt-5 py-3 min-h-[100px] border-y border-dotted border-[#6e5e5d]">
                <Outlet />
            </div>
        </section>
    );
}