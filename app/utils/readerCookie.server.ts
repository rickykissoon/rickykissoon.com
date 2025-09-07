import { createCookie } from "react-router";
import { createHash } from "crypto";

export const lastSeenCookie = createCookie("reader_last_seen", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
});

export const readIdsCookie = createCookie("reader_read_ids", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
});

export function shortId(id: string) {
    return createHash("sha1").update(id).digest("base64url").slice(0, 12);
}

export async function getReadIds(cookieHeader: string | null) {
    try {
        const arr = (await readIdsCookie.parse(cookieHeader)) as string[] | undefined;
        return Array.isArray(arr) ? arr : [];
    } catch { return []}
}

export function serializeReadIds(ids: string[], max = 1000) {
    const seen = new Set<string>();
    const deduped: string[] = [];

    for (let i = ids.length - 1; i >= 0; i--) {
        const v = ids[i];
        if (!seen.has(v)) {
            seen.add(v);
            deduped.push(v);
        }
    }
    deduped.reverse();
    const trimmed = deduped.slice(-max);
    return readIdsCookie.serialize(trimmed);
}