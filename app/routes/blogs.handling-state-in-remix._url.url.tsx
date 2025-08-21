import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { useEffect, useMemo } from "react";

export default function UrlLayout() {
    const navigate = useNavigate();
    const {pathname, search, hash} = useLocation();
    const fullPath = useMemo(
        () => `${pathname}${search}${hash}`,
    [pathname, search, hash]);

    useEffect(() => {
        console.log('navigate', navigate);
        console.log('pathname', pathname);
    })

    return(
        <div className="">
            <div className="font-semibold text-[#6e5e5d]">URL State</div>
            
            <div className="mt-5 py-3 min-h-[100px]">
                <Outlet />
            </div>
        </div>
    );
}