import { getRange, setRange } from "./selection";

function closestTag(node: Node | null, tag: string): HTMLElement | null {
    while (node && node !== document) {
        if (node instanceof HTMLElement && node.tagName === tag.toUpperCase()) return node;
        node = node.parentNode;
    }

    return null;
}

export function unwrapTag(el: HTMLElement) {
    const parent = el.parentNode!;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
}

export function mergeSiblings(node: HTMLElement) {
    const tag = node.tagName;
    const prev = node.previousSibling;
    const next = node.nextSibling;

    if (prev instanceof HTMLElement && prev.tagName === tag) {
        while (node.firstChild) prev.appendChild(node.firstChild);
        node.remove();
        node = prev;
    }

    if (next instanceof HTMLElement && next.tagName === tag) {
        while (next.firstChild) node.appendChild(next.firstChild);
        next.remove();
    }
}

export function wrapSelection(tag: "strong" | "em") {
    const range = getRange();
    if (!range) return;

    const frag = range.extractContents();
    const wrapper = document.createElement(tag);
    wrapper.appendChild(frag);
    range.insertNode(wrapper);
    mergeSiblings(wrapper);

    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    newRange.collapse(false);
    setRange(newRange);
}

export function toggleInline(tag: "strong" | "em") {
    const range = getRange();
    if (!range) return;

    const commonAncestor = range.commonAncestorContainer;
    const existing = closestTag(commonAncestor, tag);

    if (existing) {
        const saved = saveCaret(range);
        unwrapTag(existing);
        mergeSiblings(existing.parentElement as HTMLElement);
        if (saved) restoreCaret(saved);
    } else {
        wrapSelection(tag);
    }
}

function saveCaret(range: Range) {
    return range.cloneRange();
}

function restoreCaret(r: Range) {
    setRange(r);
}