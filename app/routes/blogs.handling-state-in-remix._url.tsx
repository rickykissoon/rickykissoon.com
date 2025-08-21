import { Outlet, useLocation } from "@remix-run/react";
import { useMemo } from "react";

export default function UrlLayout() {
    const {pathname, search, hash} = useLocation();
    const fullPath = useMemo(
        () => `${pathname}${search}${hash}`,
    [pathname, search, hash]);

    return(
        <div className="">
            <div className="font-semibold text-[#6e5e5d]">{decodeURI(fullPath)}</div>
            <div className="mt-5 py-3 min-h-[100px] border-y border-dotted border-[#6e5e5d]">
                <Outlet />
            </div>
        </div>
    );
}