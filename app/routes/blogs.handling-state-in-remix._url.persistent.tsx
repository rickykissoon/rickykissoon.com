import { Outlet } from "@remix-run/react";

export default function PersistentLayout() {

    return(
        <div className="">
            <div className="font-semibold text-[#6e5e5d]">4. Persistent State</div>
            
            <div className="mt-5 py-3 min-h-[100px]">
                <Outlet />
            </div>
        </div>
    );
}