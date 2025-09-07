import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { useState } from "react";
import { getReadIds, lastSeenCookie, serializeReadIds, shortId } from "~/utils/readerCookie.server";
import { getAllFeeds } from "~/utils/rss.server";

function idFor(item: { guid?: string; link?: string }) {
    return item.guid || item.link || "";
}

function stripTags(html: string) {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toSummaryHtml(item: { contentSnippet?: string; contentHtml?: string }, max = 280) {
    if (item.contentSnippet) return item.contentSnippet;
    const html = item.contentHtml ?? "";
    const text = stripTags(html);
    return text.length > max ? text.slice(0, max) + "..." : text;
}

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const only = url.searchParams.get("only");

    const cookieHeader = request.headers.get("cookie");
    const lastSeen = (await lastSeenCookie.parse(cookieHeader) as string | undefined);
    const lastSeenMs = lastSeen ? new Date(lastSeen).getTime() : 0;
    const readIds = await getReadIds(cookieHeader);
    const readSet = new Set(readIds);

    const items = await getAllFeeds();
    const filtered = only ? items.filter(i => i.feedUrl.includes(only)) : items;

    const mapped = filtered.map((i) => {
        const pub = new Date(i.isoDate || 0).getTime();
        const rawId = idFor(i);
        const sid = shortId(rawId);
        const isRead = rawId ? readSet.has(sid) : false;
        const isNew = !isRead && pub > lastSeenMs;
        const summary = toSummaryHtml(i, 280);
        return { ...i, _id: sid, isRead, isNew, summary, hasFull: !!i.contentHtml };
    });

    return {
        items: mapped,
        lastSeen
    };
}

export async function action({ request }: ActionFunctionArgs) {
    const form = await request.formData();
    const intent = String(form.get("intent") || "");
    const cookieHeader = request.headers.get("cookie");
    const readIds = await getReadIds(cookieHeader);

    if (intent === "MARK-READ" || intent === "MARK-UNREAD") {
        const id = String(form.get("id") || "");
        if (!id) return Response.json({ ok: false, error: "missing id" }, { status: 400 });

        let next = readIds;
        if (intent === "MARK-READ") {
            if (!next.includes(id)) next = [...next, id];
        } else {
            next = next.filter((x) => x !== id);
        }

        return redirect("/reader", {
            headers: {
                "Set-Cookie": await serializeReadIds(next, 1000)
            },
        });
    }

    return Response.json({ ok: false }, { status: 400 });
}

type LoaderData = {
    items: {
        _id: string;
        isRead: boolean;
        isNew: boolean;
        summary: string;
        hasFull: boolean;
        feedUrl: string;
        feedTitle?: string | undefined;
        guid?: string | undefined;
        title?: string | undefined;
        link?: string | undefined;
        isoDate?: string | undefined;
        contentHtml?: string | undefined;
        contentSnippet?: string | undefined;
    }[];
    lastSeen: string | undefined;
}

type ReaderItem = LoaderData["items"][number];

export default function Reader() {
    const {items, lastSeen} = useLoaderData<LoaderData>();

    return(
        <div className="m-4">
            <div className="flex items-center justify-between mb-3">
                <h1 className="text-xl font-semibold">XML Reader</h1>
            </div>

            <div className="text-sm opacity-70 mb-4">
                Last seen: {lastSeen ? new Date(lastSeen).toLocaleString() : "—"}
            </div>

            <ul className="space-y-3">
                {items.map((it) => (
                    <FeedComponent key={it._id || it.link} item={it} />  
                ))}
            </ul>
        </div>
    );
}

export function FeedComponent({ item, expandable = true }: { item: ReaderItem, expandable?: boolean }) {
    const [expanded, setExpanded] = useState(false);
    const fetcher = useFetcher();

    return(
        <li className={`border p-3 ${item.isRead ? "opacity-60" : ""}`}>
            <div className="flex items-center justify-between gap-2">
                <a href={item.link} target="_blank" rel="noreferrer" className="underline">
                    {item.title || item.link}
                </a>
                <div className="flex items-center gap-2">
                    {expandable && item.isNew && <span className="bg-[#290701] border-[#480d02] border px-2 text-xs text-[#ff4f30]">NEW</span>}
                    <fetcher.Form method="POST">
                        <input type="hidden" name="intent" value={item.isRead ? "MARK-UNREAD" : "MARK-READ"} />
                        <input type="hidden" name="id" value={item._id} />
                        <button className="text-xs border px-2">
                            {item.isRead ? "Mark Unread" : "Mark Read"}
                        </button>
                    </fetcher.Form>
                </div>
            </div>

            <div className="text-xs opacity-70">
                {item.feedTitle} • {item.isoDate ? new Date(item.isoDate).toLocaleString() : "no date"}
            </div>

            {expandable && (
                <>
                    {(!expanded || !item.contentHtml) && item.summary && (
                        <div className="prose prose-invert max-w-none mt-2">{item.summary}</div>
                    )}

                    {expanded && item.contentHtml && (
                        <div className="prose prose-invert max-w-none mt-2"
                            dangerouslySetInnerHTML={{ __html: item.contentHtml }} />
                    )}

                    {item.contentHtml && (
                        <button className="mt-2 text-xs underline"
                            onClick={() => setExpanded((v) => !v)}>
                                {expanded ? "Show less": "Show full"}
                        </button>
                    )}
                </>
            )}
        </li>
    );
}