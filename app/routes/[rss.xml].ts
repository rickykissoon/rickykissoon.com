import { LoaderFunctionArgs } from "@remix-run/node";
import { listBlogs } from "~/utils/blog.server";

export async function loader({request}: LoaderFunctionArgs) {
    const { items } = await listBlogs({
        limit: 20,
        sort: { createdAt: -1 },
        select: ["id", "title", "slug", "content", "createdAt", "tags"],
    });

    const blogs = items.filter((b) => !(b.tags?.some((tag) => tag.toLowerCase() === "test")));
    const { origin } = new URL(request.url);
    const site = origin;
    const selfHref = `${site}/rss.xml`;

    const feedItems = blogs.map((b) => {
        const url = `${site}/blogs/${b.slug}`;
        const description = (b.content ?? "").replace(/<[^>]*>/g, "").slice(0, 300);

        return `<item>
            <title>${xmlEscape(b.title)}</title>
            <link>${url}</link>
            <guid isPermaLink="true">${url}</guid>
            <pubDate>${new Date(b.createdAt).toUTCString()}</pubDate>
            ${(b.tags ??[]).map(t => `<category>${xmlEscape(t)}</category>`).join("")}
            <description><![CDATA[${description}]]></description>
            <content:encoded><![CDATA[${b.content ?? ""}]]></content:encoded>
        </item>`;
    }).join("");

    const now = new Date().toUTCString();
    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <?xml-stylesheet type="text/xsl" href="/rss.xsl"?>
    <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
        <channel>
            <title>Ricky Kissoon - Blog</title>
            <link>${site}/blogs</link>
            <atom:link href="${selfHref}" rel="self" type="application/rss+xml" />
            <description>Latest posts from rickykissoon.com</description>
            <language>en</language>
            <lastBuildDate>${now}</lastBuildDate>
            <ttl>30</ttl>
            ${feedItems}
        </channel>
    </rss>`;

    return new Response(xml, { 
        headers: { 
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=300, s-maxage=300",
        },
    });
}

function xmlEscape(str: string) {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}