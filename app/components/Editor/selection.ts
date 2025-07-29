
export function getSelectionSafe(): Selection | null {
    if (typeof window === "undefined") return null;
    const sel = window.getSelection();
    return sel && sel.rangeCount ? sel : null;
}

export function getRange(): Range | null {
    const sel = getSelectionSafe();
    return sel ? sel.getRangeAt(0) : null;
}

export function setRange(range: Range) {
    const sel = getSelectionSafe();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
}

export function saveRange(): Range | null {
    const r = getRange();
    return r ? r.cloneRange() : null;
}

export function restoreRange(r: Range | null) {
    if (r) setRange(r);
}