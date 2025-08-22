import { Outlet } from "@remix-run/react";

export default function ActionLayout() {

    return(
        <div className="">
            <div className="font-semibold text-[#6e5e5d]">3. action{'()'}</div>
            
            <div className="mt-5 py-3 min-h-[100px]">
                <Outlet />
            </div>
        </div>
    );
}