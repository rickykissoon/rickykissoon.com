import Parser from "rss-parser";

const parser = new Parser({
    headers: { "User-Agent": "RickyKissoon/1.0"},
    timeout: 15000,
});

export type FeedItem = {
    feedUrl: string;
    feedTitle?: string;
    guid?: string;
    title?: string;
    link?: string;
    isoDate?: string;
    contentHtml?: string;
    contentSnippet?: string;
};

type CacheEntry = {
    items: FeedItem[];
    etag?: string;
    lastModified?: string;
    fetchedAt: number;
};

const FEEDS = [
    "https://bl.elg.gg/rss",
];

const TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

function toTime(iso?: string) {
    const t = iso ? Date.parse(iso) : NaN;
    return Number.isFinite(t) ? t : 0;
}

const byIsoDesc = (a: FeedItem, b: FeedItem) => toTime(b.isoDate) - toTime(a.isoDate);

export async function getAllFeeds() {
    const results = await Promise.all(FEEDS.map(getOneFeed));
    return results.flat().sort(byIsoDesc);
}

export async function getLatestArticles(limit = 5): Promise<FeedItem[]> {
    const perFeed = await Promise.all(FEEDS.map(async (u) => (await getOneFeed(u)).slice(0, limit)));
    return perFeed.flat().sort(byIsoDesc).slice(0, limit);
}

async function getOneFeed(url: string): Promise<FeedItem[]> {
    const now = Date.now();
    const hit = cache.get(url);
    if (hit && now - hit.fetchedAt < TTL_MS) return hit.items;

    const headers: Record<string, string> = {};
    if (hit?.etag) headers["If-None-Match"] = hit.etag;
    if (hit?.lastModified) headers["If-Modified-Since"] = hit.lastModified;

    const res = await fetch(url, { headers });
    if (res.status === 304 && hit) {
        hit.fetchedAt = now;
        return hit.items;
    }

    if (!res.ok) {
        if (hit) return hit.items;
        throw new Error(`Fetch ${url} failed: ${res.status}`);
    }

    const xml = await res.text();
    const feed = await parser.parseString(xml);
    const items: FeedItem[] = (feed.items ?? []).map((it) => ({
        feedUrl: url,
        feedTitle: feed.title,
        guid: it.guid ?? it.link ?? "",
        title: it.title,
        link: it.link,
        isoDate: it.isoDate,
        contentHtml: it["content:encoded"] ?? it.content ?? "",
        contentSnippet: it.contentSnippet,
    }));

    cache.set(url, {
        items,
        etag: res.headers.get("ETag") ?? undefined,
        lastModified: res.headers.get("Last-Modified") ?? undefined,
        fetchedAt: now,
    });

    return items;
}