import { lazy, Suspense, useEffect, useState } from "react";

export default function QuillEditor({ value, onChange }: { value: string; onChange: (val: string) => void }) {
    const [Quill, setQuill] = useState<any>(null);

    useEffect(() => {
        import("react-quill").then((QuillModule) => {
            setQuill(() => QuillModule.default);
        });
    }, []);

    if (!Quill) return <p>Loading editor...</p>;

    return (
        <div className="">
            <Quill
                value={value}
                onChange={onChange}
                // theme="snow"
                className=" border-[#480d02] border-[1px]"
            />
        </div>
    );
}