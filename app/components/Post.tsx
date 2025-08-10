

interface PostProps {
    icon: React.ReactNode;
    title: React.ReactNode;
    body: React.ReactNode;
}

export function Post({icon, title, body }: PostProps){

    return(
        <div className="flex flex-col">
            <div className="flex bg-[#290701] border-[#480d02] border-[1px] text-[#ff4f30]">
                <div className="flex justify-center flex-col border-r-[1px] h-[35px] border-[#480d02] px-2">
                    {icon}
                </div>
                <div className="mx-2 my-auto">{title}</div>
            </div>
            <div className="border-[1px] border-t-0 border-[#6e5e5d] font-extralight text-sm px-3 py-3 rounded-br-md">{body}</div>
        </div>
    );
}