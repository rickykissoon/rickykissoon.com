import React, { useEffect, useRef } from "react";
import { toggleInline } from "./inline";
import { toggleList } from "./lists";

type Props = {
    value: string;
    onChange: (html: string) => void;
    hydrated?: boolean;
}

export function Editor({ value, onChange, hydrated = true }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!hydrated) return;
        if (ref.current && ref.current.innerHTML !== value) {
            ref.current.innerHTML = value;
        }
    }, [value, hydrated]);

    const onInput = () => {
        if (ref.current) onChange(ref.current.innerHTML);
    };

    const keepFocus = (e: React.MouseEvent) => {
        e.preventDefault();
        ref.current?.focus();
    };

    const handleBold = (e: React.MouseEvent) => {
        keepFocus(e);
        toggleInline("strong");
        onInput();
    };

    const handleItalic = (e: React.MouseEvent) => {
        keepFocus(e);
        toggleInline("em");
        onInput();
    };

    const handleUl = (e: React.MouseEvent) => {
        keepFocus(e);
        toggleList("ul");
        onInput();
    };

    const handleOl = (e: React.MouseEvent) => {
        keepFocus(e);
        toggleList("ol");
        onInput();
    };

    if (!hydrated) return null;

    return(
        <div>
            <div className="flex gap-2 my-2 text-sm">
                <button type="button" className="bg-[#290701] border-[#480d02] border-[1px] text-[#ff4f30] text-[14px] p-1 w-8 h-8" onMouseDown={keepFocus} onClick={handleBold}><b>B</b></button>
                <button type="button" className="bg-[#290701] border-[#480d02] border-[1px] text-[#ff4f30] text-[14px] p-1 w-8 h-8" onMouseDown={keepFocus} onClick={handleItalic}><i>I</i></button>
                <button type="button" className="bg-[#290701] border-[#480d02] border-[1px] text-[#ff4f30] text-[14px] p-1 w-8 h-8" onMouseDown={keepFocus} onClick={handleUl}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5 m-auto">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                </button>
                <button type="button" className="bg-[#290701] border-[#480d02] border-[1px] text-[#ff4f30] text-[14px] p-1 w-8 h-8" onMouseDown={keepFocus} onClick={handleOl}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5 m-auto">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.242 5.992h12m-12 6.003H20.24m-12 5.999h12M4.117 7.495v-3.75H2.99m1.125 3.75H2.99m1.125 0H5.24m-1.92 2.577a1.125 1.125 0 1 1 1.591 1.59l-1.83 1.83h2.16M2.99 15.745h1.125a1.125 1.125 0 0 1 0 2.25H3.74m0-.002h.375a1.125 1.125 0 0 1 0 2.25H2.99" />
                    </svg>
                </button>
            </div>

            <div
                ref={ref}
                contentEditable
                suppressContentEditableWarning
                className="editor-area border border-[#480D02] p-2 min-h-[150px]"
                onInput={onInput}
            />
        </div>
    );
}