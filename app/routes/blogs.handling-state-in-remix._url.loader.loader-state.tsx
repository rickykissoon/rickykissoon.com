import { Link } from "@remix-run/react";


export default function LoaderState() {

    return(
        <div className="">
            <p>
                Loaders run on the server, can access databases/APIs, and hydrate the initial HTML, making server data the source of truth
                for what{'\''}s rendered.
            </p>
            <br></br>
            <Snippet1 />
            <br></br>
            <p>
                Our component gets access to loader data via useLoaderData{'()'}.
            </p>
            <br></br>
            <Snippet2 />
            <br></br>
            <p>
                Behaviour wise, this is no different than before. But as mentioned, when URL query params are added or removed this triggers
                a loader revalidation, which causes the loader and any associated useLoaderData{'()'} and components to re-run, ensuring that
                the page has the most up to date server data.
            </p>

            <div className="flex items-center gap-3 justify-between mt-6">
                <Link to="/blogs/handling-state-in-remix" preventScrollReset>Back To All State Methods</Link>
                <Link to="/blogs/handling-state-in-remix/action/action-state" preventScrollReset>3. action{'()'}</Link>
            </div>
        </div>
    );
}

function Snippet1() {
    return(
        <pre><code>
{`export const loader: LoaderFunction = async ({ params }) => {
    const db = await getDb();
    const collection = db.collection("blogs");
    const { blogHandle } = params;
    const blogPost = await collection.findOne({ slug: blogHandle });

    return {
        ...blogPost,
    };
};`}
        </code></pre>
    );
}

function Snippet2() {
    return(
        <pre><code>
{`export default function PageComponent {
    const {title, body} = useLoaderData<typeof loader>();

    return(
        <div>
            <h1>{title}</h1>
            <div>
                <p>{body}</p>
            </div>
        </div>
    );
}`}
        </code></pre>
    );
}