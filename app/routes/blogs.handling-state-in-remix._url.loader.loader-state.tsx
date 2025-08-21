import { Link } from "@remix-run/react";


export default function LoaderState() {

    return(
        <div className="">
            <p>
                Loaders run on the server, can access databases, APIs, and hydrate the initial HTML, making server data the source of truth
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

            <div className="flex items-center gap-3 justify-between mt-6">
                <Link to="/blogs/handling-state-in-remix" preventScrollReset>Back To All State Methods</Link>
                <Link to="/blogs/handling-state-in-remix/loader/loader-state" preventScrollReset>2. loader{'()'}</Link>
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