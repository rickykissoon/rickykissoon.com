import { ActionFunction, data, LoaderFunction, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { getDb } from "~/utils/db.server";
import { lazy, Suspense, useEffect, useState } from "react";
import { useHydrated } from "~/hooks/useHydrated";
import { ClientOnly } from "~/utils/ClientOnly";
import {stateToHTML} from "draft-js-export-html";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

const DraftEditorClient = lazy(() => import("~/utils/DraftEditor.client"));

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const secretKey = url.searchParams.get("key");

    if (secretKey !== ADMIN_SECRET) {
        return redirect("/");
    }

    return null;
}

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const tagStr = formData.get("tags") as string;

    if (!title || !content) {
        return data({
            error: "Title and content are required."
        }, {
            status: 400
        });
    }

    const db = await getDb();
    const collection = db.collection("blogs");

    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    let uniqueSlug = slug;
    let counter = 1;

    while (await collection.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
    }

    const tags = tagStr
        .split(",")
        .map(t => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 10);

    await collection.insertOne({
        title,
        slug: uniqueSlug,
        content,
        tags,
        createdAt: new Date(),
        published: true,
    });

    return redirect(`/blogs/${uniqueSlug}`);
}

interface BlogError {
    error: string;
}

export default function AdminBlogPage() {
    const actionData: BlogError | undefined = useActionData();
    const [editorRaw, setEditorRaw] = useState<string>("");
    const [content, setContent] = useState("");
    const [previewHtml, setPreviewHtml] = useState<string>("");

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold">Create a New Blog Post</h1>

            {actionData?.error && (
                <p className="text-red-500">{actionData.error}</p>
            )}

            <form method="post">
                <input type="text" name="title" placeholder="Title" required className="w-full p-2 border" />
 
                <div className="mt-1">
                    <ClientOnly fallback={<div style={{minHeight: 120}} >Loading Client...</div>}>
                        {() => {
                            return(
                                <>
                                <Suspense fallback={<div style={{minHeight: 120}} >Loading Suspense...</div>}>
                                    <DraftEditorClient onChange={setEditorRaw} />
                                </Suspense>
                                
                                <RawToHtmlPreview raw={editorRaw} onHtml={(html) => {
                                    setPreviewHtml(html);
                                    setContent(html);
                                }} />

                                <h2 className="mt-4 mb-2 text-lg font-semibold">Preview</h2>
                                <div className="" dangerouslySetInnerHTML={{ __html: previewHtml}} />
                                </>
                            );
                        }}
                    </ClientOnly>
                    <textarea name="content" value={content} hidden readOnly />
                </div>

                <div className="mt-1">
                    <input name="tags" placeholder="Tags: (react, remix, mongodb)" className="w-full p-2 border" />
                </div>

                <button type="submit" className="bg-[#480d02] text-white px-4 py-2 mt-4">Publish</button>
            </form>
        </div>  
    );
}

function RawToHtmlPreview({
    raw,
    onHtml,
}: {
    raw: string;
    onHtml: (html: string) => void;
}) {
    useEffect(() => {
        let cancelled = false;

        async function run() {
            if (!raw) {
                if (!cancelled) onHtml("");
                return;
            }

            try {
                const parsed = JSON.parse(raw);
                const [{ convertFromRaw }, { stateToHTML }] = await Promise.all([
                    import("draft-js"),
                    import("draft-js-export-html")
                ]);

                const contentState = convertFromRaw(parsed);
                const html = stateToHTML(contentState, {
                    defaultBlockTag: "p",
                    inlineStyles: {
                        BOLD: { element: "strong" },
                        ITALIC: { element: "em" },
                        UNDERLINE: { element: "u" },
                        CODE: { element: "code" },
                    },
                });

                if (!cancelled) onHtml(html);
            } catch (e) {
                if (!cancelled) onHtml("");
            }
        }

        run();
        return () => {
            cancelled = true;
        };
    }, [raw, onHtml]);

    return null;
}