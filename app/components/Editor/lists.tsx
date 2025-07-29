import { getRange, setRange } from "./selection";

function closestList(node: Node | null): HTMLUListElement | HTMLOListElement | null {
    while (node && node !== document) {
        if (node instanceof HTMLUListElement || node instanceof HTMLOListElement) return node;
        node = node.parentNode;
    }
    return null;
}

function unwrapList(list: HTMLUListElement | HTMLOListElement) {
    const parent = list.parentNode;
    while (list.firstChild) {
        const li = list.firstChild as HTMLLIElement;
        while (li.firstChild) parent?.insertBefore(li.firstChild, list);
        list.removeChild(li);
    }
    parent?.removeChild(list);
}

export function toggleList(type: "ul" | "ol") {
    const range = getRange();
    if (!range) return;

    const selCommon = range.commonAncestorContainer;
    const existing = closestList(selCommon);

    if (existing && existing.tagName.toLowerCase() === type) {
        const saved = range.cloneRange();
        unwrapList(existing);
        setRange(saved);
        return;
    }

    const list = document.createElement(type);
    const frag = range.extractContents();

    Array.from(frag.childNodes).forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE && n.textContent?.trim() === "") return;

        const li = document.createElement("li");
        li.appendChild(n);
        list.appendChild(li);
    });

    range.insertNode(list);

    const newRange = document.createRange();
    newRange.selectNodeContents(list);
    newRange.collapse(false);
    setRange(newRange);
}