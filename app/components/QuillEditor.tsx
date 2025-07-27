import { useEffect, useState } from "react";
import type { ReactQuillProps } from "react-quill";

export default function QuillEditor({ value, onChange }: ReactQuillProps) {
    const [ReactQuill, setReactQuill] = useState<React.ComponentType<ReactQuillProps> | null>(null);

    useEffect(() => {
        let mounted = true;
        import("react-quill").then(mod => {
            if (mounted) setReactQuill(() => mod.default);
        });
        return () => { mounted = false; };
    }, []);

    if (!ReactQuill) return <p>Loading editor...</p>;

    return (
        <div className="">
            <ReactQuill
                value={value}
                onChange={onChange}
                // theme="snow"
                className=" border-[#480d02] border-[1px]"
            />
        </div>
    );
}