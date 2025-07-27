import { ActionFunction, data, LinksFunction, LoaderFunction, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { getDb } from "~/utils/db.server";
import QuillEditor from "~/components/QuillEditor";
import { useEffect, useState } from "react";
import quillCss from "quill/dist/quill.snow.css";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: quillCss },
];

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

    await collection.insertOne({
        title,
        slug: uniqueSlug,
        content,
        createdAt: new Date(),
        published: true,
    });

    return redirect("/admin/blogs?key=" + ADMIN_SECRET)
}

interface BlogError {
    error: string;
}

export default function AdminBlogPage() {
    const actionData: BlogError | undefined = useActionData();
    const [content, setContent] = useState("");

    useEffect(() => {
        console.log(content);
    }, [content]);

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold">Create a New Blog Post</h1>

            {actionData?.error && (
                <p className="text-red-500">{actionData.error}</p>
            )}

            <form method="post">
                <input type="text" name="title" placeholder="Title" required className="w-full p-2 border" />
 
                <div className="mt-1">
                    <QuillEditor value={content} onChange={setContent} />
                    <textarea name="content" value={content} hidden readOnly />
                </div>

                <button type="submit" className="bg-[#480d02] text-white px-4 py-2 mt-4">Publish</button>
            </form>
        </div>  
    );
}