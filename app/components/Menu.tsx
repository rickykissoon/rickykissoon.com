import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@remix-run/react";

export default function Menu({pathname}: {pathname: string}) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-3 lg:bottom-10 right-3 lg:right-10 z-50 flex h-12 w-12 text-xl items-center justify-center transition bg-[#290701] border-[#480d02] border-[1px] text-[#ff4f30] rounded-br-md"
            >{isOpen ? "x" : "☰"}</button>

            {isOpen &&  (
                <div
                    className="fixed inset-0 z-40 bg-black/75"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
  
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: isOpen ? "0%" : "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-0 right-0 z-40 h-full w-full md:w-[400px] p-4 bg-[#080100]/75 md:border-[#6e5e5d] md:border-[1px] border-b-0 border-r-0"
            >
                <div className="flex text-[30px] font-thin">
                    <div className="text-[#ff4f30]">RICKY</div>
                    <div className="text-[#6e5e5d]">KISSOON</div>
                </div>
                <ul className="space-y-2 text-white">
                    <li>
                        <MenuListItem to="/" label="home" pathname={pathname} />
                    </li>
                    <li>
                        <MenuListItem to="/secondpage" label="second page" pathname={pathname} />
                    </li>
                    <li>
                        <MenuListItem to="/blogs" label="blogs" pathname={pathname} />
                    </li>
                    <li>
                        <MenuListItem to="/randomart-gallery" label="randomart gallery" pathname={pathname} />
                    </li>
                </ul>
            </motion.div>
        </>
    );
}

interface MenuListItemProps {
    to: string;
    label: string;
    pathname: string
}

export function MenuListItem({to, label, pathname }: MenuListItemProps) {
    const isActive = pathname === to;
    const [isHovered, setIsHovered] = useState(false);
    const hoverStyles = {
        backgroundColor: "#3b0764"
    };

    return (
        <Link className="flex" to={isActive ? "#" : to} style={{ cursor: isActive ? 'unset' : 'pointer', ...(isHovered && !isActive ? hoverStyles : {}) }}  onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <span className="flex justify-center mr-3">
                {isActive ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                    </svg>                  
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.49 12 3.75 3.75m0 0-3.75 3.75m3.75-3.75H3.74V4.499" />
                    </svg>
                )}
            </span>
            <span className="px-2" style={{ backgroundColor: isActive ? "#666666" : "#3b0764", color: isActive ? "#272120" : undefined}}>{label}</span>
        </Link>
    );
}