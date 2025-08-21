

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

interface InfoProps {
    title: React.ReactNode;
    body: React.ReactNode;
}

export function Info({title, body}: InfoProps) {
    return(
        <div className="flex flex-col">
            <div className="flex bg-[#18073e] border-[#4f1db3] border-[1px] text-[#b062ff]">
                <div className="flex justify-center flex-col border-r-[1px] h-[35px] border-[#421994] px-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                </div>
                <div className="mx-2 my-auto">{title}</div>
            </div>
            <div className="border-[1px] border-t-0  bg-[#0b041a] border-[#4f1db3] text-[#b062ff] font-extralight text-sm px-3 py-3 rounded-br-md">{body}</div>
        </div>
    );
} 