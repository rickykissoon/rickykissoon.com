import { LoaderFunctionArgs } from "@remix-run/node";
import { listBlogs } from "~/utils/blog.server";

const SITE = "https://rickykissoon.com";

export async function loader({request}: LoaderFunctionArgs) {
    const { items: blogs } = await listBlogs({
        limit: 20,
        sort: { createdAt: -1 },
        select: ["id", "title", "slug", "content", "createdAt", "tags"],
    });

    const filteredBlogs = blogs.filter((b) => !(b.tags?.some((tag) => tag.toLowerCase() === "test")));
    const feedItems = filteredBlogs.map((b) => {
        const url = `${SITE}/blogs/${b.slug}`;
        const description = (b.content ?? "").replace(/<[^>]*>/g, "").slice(0, 300);

        return `<item>
            <title>${escape(b.title)}</title>
            <link>${url}</link>
            <guid isPermaLink="true">${url}</guid>
            <pubDate>${new Date(b.createdAt).toUTCString()}</pubDate>
            ${b.tags?.length ? b.tags.map(t => `<category>${xmlEscape(t)}</category>`).join("") : ""}
            <description><![CDATA[${description}]]></description>
            <content:encoded><![CDATA[${b.content ?? ""}]]></content:encoded>
        </item>`;
    }).join("");

    const now = new Date().toUTCString();
    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <?xml-stylesheet type="text/xsl" href="/rss.xsl"?>
    <rss version="2.0" xmlns:content="https://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
        <channel>
            <title>Ricky Kissoon - Blog</title>
            <link>${SITE}/blogs</link>
            <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
            <description>Latest posts from rickykissoon.com</description>
            <language>en</language>
            <lastBuildDate>${now}</lastBuildDate>
            <ttl>30</ttl>
            ${feedItems}
        </channel>
    </rss>`;

    return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" }});
}

function xmlEscape(str: string) {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
};